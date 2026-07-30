import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getItems, updateItem, deleteItem } from '../services/api';
import LibraryItemCard from './LibraryItemCard';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import LibraryItemDetailsModal from './LibraryItemDetailsModal';
import LibraryItemFormModal from './LibraryItemFormModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilm, FaBookOpen, FaSortAmountDown } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const LibrarySection = ({
  type,           // 'Movie' | 'Book'
  globalSearch,   // string passed from parent/navbar
  onFavoriteChange // callback to refresh navbar badge count
}) => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Independent filter/sort/page state per section
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = { type, page, limit, sort, deleted: false };
      if (globalSearch) params.search = globalSearch;
      if (genre) params.genre = genre;
      if (rating) params.rating = rating;
      if (year) params.year = year;

      const res = await getItems(params);
      setItems(res.data.items);
      setTotalItems(res.data.totalItems);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error(`Failed to load ${type}s`);
    } finally {
      setLoading(false);
    }
  }, [type, globalSearch, genre, rating, year, sort, page, limit]);

  useEffect(() => {
    setPage(1); // Reset page on search/filter change
  }, [globalSearch, genre, rating, year, sort]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggleFavorite = useCallback(async (item) => {
    try {
      const nextFavState = !item.favorite;
      await toggleFavorite(item._id, nextFavState);
      toast.success(nextFavState ? '❤️ Added to favorites' : 'Removed from favorites');
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, favorite: nextFavState } : i));
      if (selectedItem?._id === item._id) setSelectedItem(prev => ({ ...prev, favorite: nextFavState }));
      if (onFavoriteChange) onFavoriteChange();
    } catch {
      toast.error('Failed to update favorite');
    }
  }, [selectedItem, onFavoriteChange]);

  const handleEditSave = useCallback((updatedItem) => {
    setItems(prev => prev.map(i => i._id === updatedItem._id ? updatedItem : i));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      const res = await deleteItem(itemToDelete._id);
      if (res.data.softDeleted) {
        toast.success(`Moved "${itemToDelete.title}" to Trash`);
      } else {
        toast.success(`"${itemToDelete.title}" permanently deleted`);
      }
      setIsDeleteOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const resetFilters = useCallback(() => {
    setGenre('');
    setRating('');
    setYear('');
    setSort('newest');
    setPage(1);
  }, []);

  const isFiltered = useMemo(() => genre || rating || year, [genre, rating, year]);

  const SectionIcon = type === 'Movie' ? FaFilm : FaBookOpen;
  const sectionLabel = type === 'Movie' ? 'Movies' : 'Books';
  const accentClass = type === 'Movie'
    ? 'text-blue-600 dark:text-blue-400'
    : 'text-purple-600 dark:text-purple-400';
  const bgAccentClass = type === 'Movie'
    ? 'bg-blue-50 dark:bg-blue-950/30'
    : 'bg-purple-50 dark:bg-purple-950/30';

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-2 border-gray-100 dark:border-gray-800/50 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${bgAccentClass}`}>
            <SectionIcon className={`w-5 h-5 ${accentClass}`} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {sectionLabel}
              <span className="ml-2 text-sm font-normal text-gray-400">({totalItems})</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2336] text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="ratingHigh">Highest Rating</option>
            <option value="ratingLow">Lowest Rating</option>
            <option value="titleAZ">Title A-Z</option>
            <option value="titleZA">Title Z-A</option>
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              showFilters || isFiltered
                ? `${bgAccentClass} ${accentClass} border-transparent`
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2336] text-gray-600 dark:text-gray-300'
            }`}
          >
            <FiFilter size={12} />
            <span>Filter{isFiltered ? ' (Active)' : ''}</span>
          </button>

          {isFiltered && (
            <button onClick={resetFilters} className="text-xs text-red-400 hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white dark:bg-[#151f32] rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Genre</label>
                <input
                  type="text"
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  placeholder="e.g. Sci-Fi, Drama"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151f32] text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="">All Ratings</option>
                  {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="e.g. 2020"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: limit > 4 ? 4 : limit }).map((_, i) => (
            <div key={i} className="h-[420px] bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item._id} variants={cardVariants} layout>
                  <LibraryItemCard
                    item={item}
                    onView={it => { setSelectedItem(it); setIsDetailsOpen(true); }}
                    onEdit={it => { setSelectedItem(it); setIsEditOpen(true); }}
                    onDelete={it => { setItemToDelete(it); setIsDeleteOpen(true); }}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={l => { setLimit(l); setPage(1); }}
          />
        </>
      ) : (
        <EmptyState
          type={globalSearch || isFiltered ? 'search' : 'library'}
          message={
            globalSearch
              ? `No ${sectionLabel} matching "${globalSearch}"`
              : isFiltered
              ? `No ${sectionLabel} match the selected filters`
              : `Your ${sectionLabel} collection is empty.`
          }
          onReset={isFiltered || globalSearch ? resetFilters : null}
          itemType={type}
        />
      )}

      {/* Modals */}
      <LibraryItemDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedItem(null); }}
        item={selectedItem}
        onToggleFavorite={handleToggleFavorite}
      />
      <LibraryItemFormModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedItem(null); }}
        item={selectedItem}
        onSave={handleEditSave}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setItemToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.title}
        itemType={itemToDelete?.type}
      />
    </section>
  );
};

export default LibrarySection;
