import React, { useState, useEffect } from 'react';
import { getFavorites, toggleFavorite, deleteItem } from '../services/api';
import LibraryItemCard from '../components/LibraryItemCard';
import LibraryItemDetailsModal from '../components/LibraryItemDetailsModal';
import LibraryItemFormModal from '../components/LibraryItemFormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaHeart, FaFilm, FaBookOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export const Favorites = () => {
  const [favMovies, setFavMovies] = useState([]);
  const [favBooks, setFavBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavorites();
      const movies = res.data.data?.movies || res.data.movies || [];
      const books = res.data.data?.books || res.data.books || [];
      setFavMovies(movies);
      setFavBooks(books);
    } catch (err) {
      toast.error('Failed to load favorite items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (item) => {
    try {
      await toggleFavorite(item._id, false);
      toast.success(`Removed "${item.title}" from favorites`);

      // Animate out of list instantly
      if (item.type === 'Movie') {
        setFavMovies((prev) => prev.filter((i) => i._id !== item._id));
      } else {
        setFavBooks((prev) => prev.filter((i) => i._id !== item._id));
      }

      // Dispatch global storage event to update navbar count badge
      window.dispatchEvent(new Event('favorite_changed'));
    } catch (err) {
      toast.error('Failed to remove favorite');
    }
  };

  const handleEditSave = (updatedItem) => {
    fetchFavorites();
  };

  const handleDeleteTrigger = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete._id);
      toast.success(`${itemToDelete.type} deleted successfully`);
      setIsDeleteOpen(false);
      setItemToDelete(null);
      fetchFavorites();
      window.dispatchEvent(new Event('favorite_changed'));
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800/40 pb-6">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl">
          <FaHeart className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="font-sans font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">
            Favorite Items
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your personal collection of highly-rated books and movies.
          </p>
        </div>
      </div>

      {/* 🎬 Favorite Movies Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-150 dark:border-gray-800/50 pb-2">
          <FaFilm className="text-blue-500 dark:text-purple-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Favorite Movies ({favMovies.length})
          </h3>
        </div>

        {favMovies.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {favMovies.map((movie) => (
                <motion.div key={movie._id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.9 }}>
                  <LibraryItemCard
                    item={movie}
                    onView={(it) => {
                      setSelectedItem(it);
                      setIsDetailsOpen(true);
                    }}
                    onEdit={(it) => {
                      setSelectedItem(it);
                      setIsEditOpen(true);
                    }}
                    onDelete={handleDeleteTrigger}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#151f32] rounded-2xl border border-dashed border-gray-200 dark:border-gray-850/60 text-gray-400">
            <FaFilm className="w-10 h-10 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold">No Favorite Movies Yet</p>
            <Link to="/library" className="text-xs text-blue-500 dark:text-purple-450 hover:underline mt-2 inline-block">
              Browse library to add favorites
            </Link>
          </div>
        )}
      </div>

      {/* 📚 Favorite Books Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-150 dark:border-gray-800/50 pb-2">
          <FaBookOpen className="text-blue-500 dark:text-purple-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Favorite Books ({favBooks.length})
          </h3>
        </div>

        {favBooks.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {favBooks.map((book) => (
                <motion.div key={book._id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.9 }}>
                  <LibraryItemCard
                    item={book}
                    onView={(it) => {
                      setSelectedItem(it);
                      setIsDetailsOpen(true);
                    }}
                    onEdit={(it) => {
                      setSelectedItem(it);
                      setIsEditOpen(true);
                    }}
                    onDelete={handleDeleteTrigger}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#151f32] rounded-2xl border border-dashed border-gray-200 dark:border-gray-850/60 text-gray-400">
            <FaBookOpen className="w-10 h-10 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold">No Favorite Books Yet</p>
            <Link to="/library" className="text-xs text-blue-500 dark:text-purple-450 hover:underline mt-2 inline-block">
              Browse library to add favorites
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      <LibraryItemDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onToggleFavorite={handleToggleFavorite}
      />

      <LibraryItemFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSave={handleEditSave}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.title}
        itemType={itemToDelete?.type}
      />
      
    </div>
  );
};

export default Favorites;
