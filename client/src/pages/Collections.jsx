import React, { useState, useEffect } from 'react';
import { getCollections, createCollection, deleteCollection, removeFromCollection, getItems } from '../services/api';
import LibraryItemCard from '../components/LibraryItemCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFolder, FaPlus, FaTrash, FaFolderOpen, FaFilm, FaBookOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCollection, setActiveCollection] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await getCollections();
      setCollections(res.data);
      if (activeCollection) {
        const updatedActive = res.data.find(c => c._id === activeCollection._id);
        setActiveCollection(updatedActive || null);
      }
    } catch (err) {
      toast.error('Failed to load collections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await createCollection({ name, description });
      toast.success(`Collection "${res.data.name}" created!`);
      setName('');
      setDescription('');
      setShowForm(false);
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create collection');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this collection? The items inside will not be deleted.')) return;

    try {
      await deleteCollection(id);
      toast.success('Collection deleted');
      if (activeCollection && activeCollection._id === id) {
        setActiveCollection(null);
      }
      fetchCollections();
    } catch (err) {
      toast.error('Failed to delete collection');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!activeCollection) return;
    try {
      await removeFromCollection(activeCollection._id, itemId);
      toast.success('Item removed from collection');
      fetchCollections();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  if (loading && collections.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Separate collection items into Movies and Books
  const activeMovies = activeCollection?.items?.filter(item => item.type === 'Movie') || [];
  const activeBooks = activeCollection?.items?.filter(item => item.type === 'Book') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800/40 pb-6">
        <div>
          <h2 className="font-sans font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">
            My Collections
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize your media items into custom collections.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-650 dark:to-indigo-650 text-white font-semibold text-sm shadow-md hover:scale-[1.01] transition-all"
        >
          <FaPlus size={12} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Creation Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-[#151f32] p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm max-w-lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Collection Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science Fiction Novels"
                required
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary (optional)"
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-purple-600 text-white font-semibold text-xs shadow-sm hover:scale-[1.01]"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-300 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid of collections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((col) => (
          <div
            key={col._id}
            onClick={() => setActiveCollection(col)}
            className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm relative group flex items-start justify-between ${
              activeCollection?._id === col._id
                ? 'bg-blue-50/50 dark:bg-purple-950/20 border-blue-200 dark:border-purple-800'
                : 'bg-white dark:bg-[#151f32] border-gray-150 dark:border-gray-800/45 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100/50 dark:bg-purple-900/30 text-blue-600 dark:text-purple-400 rounded-2xl">
                {activeCollection?._id === col._id ? <FaFolderOpen size={22} /> : <FaFolder size={22} />}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base truncate max-w-[160px]">{col.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{col.items?.length || 0} items</p>
                {col.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{col.description}</p>}
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(col._id, e)}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-450 hover:text-red-500 transition-colors"
              title="Delete Collection"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}
        {collections.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            You don't have any collections yet. Click "New Collection" to get started!
          </div>
        )}
      </div>

      {/* Viewing items inside active collection (STRICTLY SEPARATED) */}
      {activeCollection && (
        <div className="border-t border-gray-100 dark:border-gray-800/40 pt-8 mt-8 space-y-8 animate-fade-in">
          <div className="border-b border-gray-150 dark:border-gray-800/50 pb-4">
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white">
              Collection: {activeCollection.name}
            </h3>
            {activeCollection.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeCollection.description}</p>
            )}
          </div>

          {/* 🎬 Movies Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-850 pb-2">
              <FaFilm className="text-blue-500 dark:text-purple-400" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Movies ({activeMovies.length})</h4>
            </div>
            {activeMovies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {activeMovies.map(movie => (
                  <div key={movie._id} className="relative group/card">
                    <LibraryItemCard
                      item={movie}
                      onView={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onToggleFavorite={() => {}}
                    />
                    <button
                      onClick={() => handleRemoveItem(movie._id)}
                      className="absolute top-3 left-3 z-10 px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-450 dark:text-gray-500">No movies in this collection.</p>
            )}
          </div>

          {/* 📚 Books Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-850 pb-2">
              <FaBookOpen className="text-blue-500 dark:text-purple-400" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Books ({activeBooks.length})</h4>
            </div>
            {activeBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {activeBooks.map(book => (
                  <div key={book._id} className="relative group/card">
                    <LibraryItemCard
                      item={book}
                      onView={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onToggleFavorite={() => {}}
                    />
                    <button
                      onClick={() => handleRemoveItem(book._id)}
                      className="absolute top-3 left-3 z-10 px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-450 dark:text-gray-500">No books in this collection.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
