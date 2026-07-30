const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const { logActivity } = require('../utils/logger');
const { memoryStore, logInMemoryActivity } = require('../utils/inMemoryStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Get user collections
// @route   GET /api/collections
const getCollections = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const userColls = memoryStore.collections.filter(c => c.createdBy === req.user._id);
      const populated = userColls.map(c => ({
        ...c,
        items: memoryStore.items.filter(i => c.items.includes(i._id))
      }));
      return res.status(200).json(populated);
    }

    const collections = await Collection.find({ createdBy: req.user._id })
      .populate('items')
      .sort({ createdAt: -1 });
    return res.status(200).json(collections);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving collections', error: error.message });
  }
};

// @desc    Create a collection
// @route   POST /api/collections
const createCollection = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    if (!isMongoConnected()) {
      const exists = memoryStore.collections.find(c => c.createdBy === req.user._id && c.name.toLowerCase() === name.trim().toLowerCase());
      if (exists) return res.status(400).json({ message: 'A collection with this name already exists' });
      const newColl = {
        _id: `coll_${Date.now()}`,
        name: name.trim(),
        description: (description || '').trim(),
        createdBy: req.user._id,
        items: [],
        createdAt: new Date().toISOString()
      };
      memoryStore.collections.unshift(newColl);
      logInMemoryActivity(req.user._id, 'CREATE_COLLECTION', `Created collection "${newColl.name}"`);
      return res.status(201).json(newColl);
    }

    const exists = await Collection.findOne({ createdBy: req.user._id, name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: 'A collection with this name already exists' });
    }

    const collection = await Collection.create({
      name: name.trim(),
      description: (description || '').trim(),
      createdBy: req.user._id,
      items: []
    });

    await logActivity(req.user._id, 'CREATE_COLLECTION', `Created collection "${collection.name}"`);
    return res.status(201).json(collection);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating collection', error: error.message });
  }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
const deleteCollection = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const idx = memoryStore.collections.findIndex(c => c._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Collection not found' });
      const coll = memoryStore.collections[idx];
      memoryStore.collections.splice(idx, 1);
      logInMemoryActivity(req.user._id, 'DELETE_COLLECTION', `Deleted collection "${coll.name}"`);
      return res.status(200).json({ message: 'Collection deleted successfully' });
    }

    const collection = await Collection.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    await logActivity(req.user._id, 'DELETE_COLLECTION', `Deleted collection "${collection.name}"`);
    return res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting collection', error: error.message });
  }
};

// @desc    Add item to collection
// @route   POST /api/collections/:id/add
const addToCollection = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!isMongoConnected()) {
      const coll = memoryStore.collections.find(c => c._id === req.params.id);
      if (!coll) return res.status(404).json({ message: 'Collection not found' });
      if (coll.items.includes(itemId)) return res.status(400).json({ message: 'Item already in collection' });
      coll.items.push(itemId);
      logInMemoryActivity(req.user._id, 'ADD_TO_COLLECTION', `Added item to collection "${coll.name}"`);
      return res.status(200).json({ ...coll, items: memoryStore.items.filter(i => coll.items.includes(i._id)) });
    }

    const collection = await Collection.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.items.includes(itemId)) {
      return res.status(400).json({ message: 'Item already in collection' });
    }

    collection.items.push(itemId);
    await collection.save();
    await logActivity(req.user._id, 'ADD_TO_COLLECTION', `Added item to collection "${collection.name}"`);
    
    const updated = await Collection.findById(collection._id).populate('items');
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding to collection', error: error.message });
  }
};

// @desc    Remove item from collection
// @route   POST /api/collections/:id/remove
const removeFromCollection = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!isMongoConnected()) {
      const coll = memoryStore.collections.find(c => c._id === req.params.id);
      if (!coll) return res.status(404).json({ message: 'Collection not found' });
      coll.items = coll.items.filter(id => id !== itemId);
      logInMemoryActivity(req.user._id, 'REMOVE_FROM_COLLECTION', `Removed item from collection "${coll.name}"`);
      return res.status(200).json({ ...coll, items: memoryStore.items.filter(i => coll.items.includes(i._id)) });
    }

    const collection = await Collection.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.items = collection.items.filter(id => id.toString() !== itemId);
    await collection.save();
    await logActivity(req.user._id, 'REMOVE_FROM_COLLECTION', `Removed item from collection "${collection.name}"`);

    const updated = await Collection.findById(collection._id).populate('items');
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Error removing from collection', error: error.message });
  }
};

module.exports = {
  getCollections,
  createCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection
};
