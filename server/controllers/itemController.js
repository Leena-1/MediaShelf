const mongoose = require('mongoose');
const LibraryItem = require('../models/LibraryItem');
const Review = require('../models/Review');
const { validateItemInput } = require('../utils/validation');
const { logActivity } = require('../utils/logger');
const { memoryStore, logInMemoryActivity } = require('../utils/inMemoryStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Get user's items with search, filters, sorting, and pagination
// @route   GET /api/items
const getItems = async (req, res) => {
  try {
    const { search, type, genre, rating, year, sort, page = 1, limit = 10, deleted = 'false' } = req.query;

    if (!isMongoConnected()) {
      let filtered = memoryStore.items.filter(i => (i.createdBy === req.user._id || !i.createdBy) && i.deleted === (deleted === 'true'));

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(i => i.title.toLowerCase().includes(s) || i.genre.toLowerCase().includes(s) || i.authorOrDirector.toLowerCase().includes(s));
      }
      if (type && ['Movie', 'Book'].includes(type)) {
        filtered = filtered.filter(i => i.type === type);
      }
      if (genre) {
        filtered = filtered.filter(i => i.genre.toLowerCase() === genre.toLowerCase());
      }
      if (rating) {
        filtered = filtered.filter(i => i.rating === Number(rating));
      }
      if (year) {
        filtered = filtered.filter(i => i.releaseYear === Number(year));
      }

      const totalItems = filtered.length;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const totalPages = Math.ceil(totalItems / limitNum);
      const items = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.status(200).json({ items, currentPage: pageNum, totalPages, totalItems });
    }

    const query = {
      createdBy: req.user._id,
      deleted: deleted === 'true'
    };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { genre: searchRegex },
        { authorOrDirector: searchRegex }
      ];
    }

    if (type && ['Movie', 'Book'].includes(type)) {
      query.type = type;
    }

    if (genre) {
      if (Array.isArray(genre)) {
        query.genre = { $in: genre.map(g => new RegExp(`^${g.trim()}$`, 'i')) };
      } else if (genre.includes(',')) {
        const genres = genre.split(',').map(g => g.trim()).filter(Boolean);
        query.genre = { $in: genres.map(g => new RegExp(`^${g}$`, 'i')) };
      } else {
        query.genre = new RegExp(`^${genre.trim()}$`, 'i');
      }
    }

    if (rating) {
      const ratingNum = Number(rating);
      if (!isNaN(ratingNum)) query.rating = ratingNum;
    }

    if (year) {
      const yearNum = Number(year);
      if (!isNaN(yearNum)) query.releaseYear = yearNum;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skipNum = (pageNum - 1) * limitNum;

    let sortQuery = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'oldest': sortQuery = { createdAt: 1 }; break;
        case 'ratingHigh': sortQuery = { rating: -1, createdAt: -1 }; break;
        case 'ratingLow': sortQuery = { rating: 1, createdAt: -1 }; break;
        case 'titleAZ': sortQuery = { title: 1 }; break;
        case 'titleZA': sortQuery = { title: -1 }; break;
        default: sortQuery = { createdAt: -1 }; break;
      }
    }

    const [items, totalItems] = await Promise.all([
      LibraryItem.find(query).sort(sortQuery).skip(skipNum).limit(limitNum),
      LibraryItem.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({ items, currentPage: pageNum, totalPages, totalItems });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving items', error: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
const getItemById = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const item = memoryStore.items.find(i => i._id === req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      return res.status(200).json(item);
    }

    const item = await LibraryItem.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching item details', error: error.message });
  }
};

// @desc    Create item
// @route   POST /api/items
const createItem = async (req, res) => {
  try {
    const { cleanData, isValid, errors } = validateItemInput(req.body);
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (!isMongoConnected()) {
      const duplicate = memoryStore.items.find(i => i.type === cleanData.type && i.title.toLowerCase() === cleanData.title.toLowerCase() && !i.deleted);
      if (duplicate) {
        return res.status(400).json({ message: `A ${cleanData.type} with title "${cleanData.title}" already exists.` });
      }
      const newItem = {
        _id: `mem_item_${Date.now()}`,
        ...cleanData,
        deleted: false,
        createdBy: req.user._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.items.unshift(newItem);
      logInMemoryActivity(req.user._id, 'CREATE_ITEM', `Added ${newItem.type} "${newItem.title}"`, newItem.title);
      return res.status(201).json(newItem);
    }

    const duplicate = await LibraryItem.findOne({
      createdBy: req.user._id,
      type: cleanData.type,
      deleted: false,
      title: { $regex: new RegExp(`^${cleanData.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (duplicate) {
      return res.status(400).json({
        message: `A ${cleanData.type} with the title "${cleanData.title}" already exists.`
      });
    }

    const item = new LibraryItem({
      ...cleanData,
      createdBy: req.user._id
    });
    await item.save();

    await logActivity(req.user._id, 'CREATE_ITEM', `Added ${item.type} "${item.title}"`);
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Error saving item', error: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
const updateItem = async (req, res) => {
  try {
    const { cleanData, isValid, errors } = validateItemInput(req.body);
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (!isMongoConnected()) {
      const idx = memoryStore.items.findIndex(i => i._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Item not found' });
      memoryStore.items[idx] = { ...memoryStore.items[idx], ...cleanData, updatedAt: new Date().toISOString() };
      logInMemoryActivity(req.user._id, 'UPDATE_ITEM', `Updated ${cleanData.type} "${cleanData.title}"`, cleanData.title);
      return res.status(200).json(memoryStore.items[idx]);
    }

    const duplicate = await LibraryItem.findOne({
      _id: { $ne: req.params.id },
      createdBy: req.user._id,
      type: cleanData.type,
      deleted: false,
      title: { $regex: new RegExp(`^${cleanData.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (duplicate) {
      return res.status(400).json({ message: `A ${cleanData.type} with title "${cleanData.title}" already exists.` });
    }

    const updatedItem = await LibraryItem.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      cleanData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await logActivity(req.user._id, 'UPDATE_ITEM', `Updated details of ${updatedItem.type} "${updatedItem.title}"`);
    return res.status(200).json(updatedItem);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

// @desc    Delete or soft-delete item
// @route   DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const idx = memoryStore.items.findIndex(i => i._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Item not found' });
      const item = memoryStore.items[idx];
      if (!item.deleted) {
        item.deleted = true;
        logInMemoryActivity(req.user._id, 'TRASH_ITEM', `Moved ${item.type} "${item.title}" to Trash`, item.title);
        return res.status(200).json({ message: 'Item moved to Trash', softDeleted: true, id: item._id });
      } else {
        memoryStore.items.splice(idx, 1);
        logInMemoryActivity(req.user._id, 'DELETE_ITEM', `Permanently deleted ${item.type} "${item.title}"`, item.title);
        return res.status(200).json({ message: 'Item permanently deleted', softDeleted: false, id: item._id });
      }
    }

    const item = await LibraryItem.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.deleted) {
      item.deleted = true;
      await item.save();
      await logActivity(req.user._id, 'TRASH_ITEM', `Moved ${item.type} "${item.title}" to Trash`);
      return res.status(200).json({ message: 'Item moved to Trash', softDeleted: true, id: item._id });
    } else {
      await LibraryItem.findByIdAndDelete(item._id);
      await Review.deleteMany({ itemId: item._id });
      await logActivity(req.user._id, 'DELETE_ITEM', `Permanently deleted ${item.type} "${item.title}"`);
      return res.status(200).json({ message: 'Item permanently deleted', softDeleted: false, id: item._id });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};

// @desc    Restore a soft-deleted item from Trash
// @route   POST /api/items/:id/restore
const restoreItem = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const item = memoryStore.items.find(i => i._id === req.params.id && i.deleted);
      if (!item) return res.status(404).json({ message: 'Soft-deleted item not found' });
      item.deleted = false;
      logInMemoryActivity(req.user._id, 'RESTORE_ITEM', `Restored ${item.type} "${item.title}" from Trash`, item.title);
      return res.status(200).json(item);
    }

    const item = await LibraryItem.findOne({ _id: req.params.id, createdBy: req.user._id, deleted: true });
    if (!item) {
      return res.status(404).json({ message: 'Soft-deleted item not found' });
    }

    item.deleted = false;
    await item.save();

    await logActivity(req.user._id, 'RESTORE_ITEM', `Restored ${item.type} "${item.title}" from Trash`);
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Error restoring item', error: error.message });
  }
};

// @desc    Get dashboard metrics & statistics charts data
// @route   GET /api/items/stats
const getStats = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const activeItems = memoryStore.items.filter(i => !i.deleted);
      const movies = activeItems.filter(i => i.type === 'Movie');
      const books = activeItems.filter(i => i.type === 'Book');
      const favorites = activeItems.filter(i => i.favorite);
      const avgRating = activeItems.length > 0 ? Number((activeItems.reduce((acc, i) => acc + i.rating, 0) / activeItems.length).toFixed(2)) : 0;

      return res.status(200).json({
        summary: {
          totalMovies: movies.length,
          totalBooks: books.length,
          averageRating: avgRating,
          totalFavorites: favorites.length
        },
        recentMovies: movies.slice(0, 6),
        recentBooks: books.slice(0, 6),
        charts: {
          typeDistribution: [{ name: 'Movies', value: movies.length }, { name: 'Books', value: books.length }],
          genreDistribution: [{ name: 'Sci-Fi', count: 3 }, { name: 'Self-Help', count: 1 }],
          ratingDistribution: [{ rating: '4 Star', count: 1 }, { rating: '5 Star', count: 3 }]
        }
      });
    }

    const totalMovies = await LibraryItem.countDocuments({ createdBy: req.user._id, type: 'Movie', deleted: false });
    const totalBooks = await LibraryItem.countDocuments({ createdBy: req.user._id, type: 'Book', deleted: false });
    const totalFavorites = await LibraryItem.countDocuments({ createdBy: req.user._id, favorite: true, deleted: false });

    const avgRatingAgg = await LibraryItem.aggregate([
      { $match: { createdBy: req.user._id, deleted: false } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgRatingAgg.length > 0 ? Number(avgRatingAgg[0].avgRating.toFixed(2)) : 0;

    const recentMovies = await LibraryItem.find({ createdBy: req.user._id, type: 'Movie', deleted: false }).sort({ createdAt: -1 }).limit(6);
    const recentBooks = await LibraryItem.find({ createdBy: req.user._id, type: 'Book', deleted: false }).sort({ createdAt: -1 }).limit(6);

    const typeDistribution = [
      { name: 'Movies', value: totalMovies },
      { name: 'Books', value: totalBooks }
    ];

    const genreDistributionAgg = await LibraryItem.aggregate([
      { $match: { createdBy: req.user._id, deleted: false } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const genreDistribution = genreDistributionAgg.map(item => ({ name: item._id, count: item.count }));

    const ratingDistributionAgg = await LibraryItem.aggregate([
      { $match: { createdBy: req.user._id, deleted: false } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const ratingDistribution = ratingDistributionAgg.map(item => ({ rating: `${item._id} Star`, count: item.count }));

    return res.status(200).json({
      summary: { totalMovies, totalBooks, averageRating, totalFavorites },
      recentMovies,
      recentBooks,
      charts: { typeDistribution, genreDistribution, ratingDistribution }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving library statistics', error: error.message });
  }
};

// @desc    Add review for an item
// @route   POST /api/items/:id/reviews
const addItemReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const itemId = req.params.id;

    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    if (!isMongoConnected()) {
      const item = memoryStore.items.find(i => i._id === itemId);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      const rev = { _id: `rev_${Date.now()}`, itemId, userId: req.user._id, rating: Number(rating), comment: comment.trim(), createdAt: new Date().toISOString() };
      memoryStore.reviews.unshift(rev);
      return res.status(200).json(rev);
    }

    const item = await LibraryItem.findOne({ _id: itemId, createdBy: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    let review = await Review.findOne({ itemId, userId: req.user._id });
    if (review) {
      review.rating = Number(rating);
      review.comment = comment.trim();
      await review.save();
    } else {
      review = await Review.create({ itemId, userId: req.user._id, rating: Number(rating), comment: comment.trim() });
    }
    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ message: 'Error saving review', error: error.message });
  }
};

// @desc    Get reviews for an item
// @route   GET /api/items/:id/reviews
const getItemReviews = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const revs = memoryStore.reviews.filter(r => r.itemId === req.params.id);
      return res.status(200).json(revs);
    }

    const reviews = await Review.find({ itemId: req.params.id }).populate('userId', 'name avatar').sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving reviews', error: error.message });
  }
};

// @desc    Import items in bulk
// @route   POST /api/items/import
const importItems = async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Payload must be a JSON array' });
    }

    const inserted = [];
    const skipped = [];
    const errors = [];

    for (let index = 0; index < items.length; index++) {
      const rawItem = items[index];
      const { cleanData, isValid, errors: validationErrors } = validateItemInput(rawItem);
      
      if (!isValid) {
        errors.push({ title: rawItem.title || `Item #${index + 1}`, errors: validationErrors });
        continue;
      }

      if (!isMongoConnected()) {
        const dup = memoryStore.items.find(i => i.type === cleanData.type && i.title.toLowerCase() === cleanData.title.toLowerCase() && !i.deleted);
        if (dup) {
          skipped.push({ title: cleanData.title, type: cleanData.type, reason: 'Duplicate item title' });
          continue;
        }
        const newObj = { _id: `mem_item_${Date.now()}_${index}`, ...cleanData, deleted: false, createdBy: req.user._id, createdAt: new Date().toISOString() };
        memoryStore.items.unshift(newObj);
        inserted.push(newObj);
        continue;
      }

      const isDuplicateInDB = await LibraryItem.findOne({
        createdBy: req.user._id,
        type: cleanData.type,
        deleted: false,
        title: { $regex: new RegExp(`^${cleanData.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
      });

      const isDuplicateInStaged = inserted.some(item => item.type === cleanData.type && item.title.toLowerCase() === cleanData.title.toLowerCase());

      if (isDuplicateInDB || isDuplicateInStaged) {
        skipped.push({ title: cleanData.title, type: cleanData.type, reason: 'Duplicate item title' });
        continue;
      }

      inserted.push({ ...cleanData, createdBy: req.user._id });
    }

    if (isMongoConnected() && inserted.length > 0) {
      await LibraryItem.insertMany(inserted);
      await logActivity(req.user._id, 'IMPORT_ITEMS', `Imported ${inserted.length} items from JSON`);
    } else if (inserted.length > 0) {
      logInMemoryActivity(req.user._id, 'IMPORT_ITEMS', `Imported ${inserted.length} items from JSON`);
    }

    return res.status(200).json({
      message: 'JSON import processing completed',
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      errorCount: errors.length,
      skipped,
      errors
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error importing library items', error: error.message });
  }
};

// @desc    Toggle favorite status of an item
// @route   PATCH /api/items/:id/favorite
const toggleFavorite = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const item = memoryStore.items.find(i => i._id === req.params.id && !i.deleted);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      item.favorite = typeof req.body.favorite === 'boolean' ? req.body.favorite : !item.favorite;
      logInMemoryActivity(req.user._id, 'FAVORITE_TOGGLE', `${item.favorite ? 'Marked' : 'Unmarked'} ${item.type} "${item.title}" as favorite`, item.title);
      return res.status(200).json({
        success: true,
        message: item.favorite ? 'Added to favorites' : 'Removed from favorites',
        data: item,
        ...item
      });
    }

    const item = await LibraryItem.findOne({ _id: req.params.id, createdBy: req.user._id, deleted: false });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.favorite = typeof req.body.favorite === 'boolean' ? req.body.favorite : !item.favorite;
    await item.save();

    await logActivity(
      req.user._id,
      'FAVORITE_TOGGLE',
      `${item.favorite ? 'Marked' : 'Unmarked'} ${item.type} "${item.title}" as favorite`
    );

    return res.status(200).json({
      success: true,
      message: item.favorite ? 'Added to favorites' : 'Removed from favorites',
      data: item,
      ...item.toObject()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating favorite status', error: error.message });
  }
};

// @desc    Get user favorite items grouped by type
// @route   GET /api/favorites
const getFavorites = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const favs = memoryStore.items.filter(i => i.favorite && !i.deleted);
      const movies = favs.filter(i => i.type === 'Movie');
      const books = favs.filter(i => i.type === 'Book');
      return res.status(200).json({
        success: true,
        message: 'Favorites retrieved successfully',
        data: { movies, books, totalFavorites: favs.length },
        movies,
        books,
        totalFavorites: favs.length
      });
    }

    const movies = await LibraryItem.find({ createdBy: req.user._id, favorite: true, type: 'Movie', deleted: false }).sort({ createdAt: -1 });
    const books = await LibraryItem.find({ createdBy: req.user._id, favorite: true, type: 'Book', deleted: false }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Favorites retrieved successfully',
      data: {
        movies,
        books,
        totalFavorites: movies.length + books.length
      },
      movies,
      books,
      totalFavorites: movies.length + books.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching favorites', error: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  restoreItem,
  getStats,
  addItemReview,
  getItemReviews,
  importItems,
  toggleFavorite,
  getFavorites
};
