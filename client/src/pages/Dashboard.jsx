import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getStats, updateItem, deleteItem } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import StatsCharts from '../components/StatsCharts';
import LibraryItemCard from '../components/LibraryItemCard';
import LibraryItemDetailsModal from '../components/LibraryItemDetailsModal';
import LibraryItemFormModal from '../components/LibraryItemFormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { BiMoviePlay, BiBookOpen } from 'react-icons/bi';
import { FaStar, FaHeart, FaPlus, FaFilm, FaBookOpen, FaBrain, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStats();
      setStats(res.data);
    } catch {
      toast.error('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleToggleFavorite = async (item) => {
    try {
      const updated = { ...item, favorite: !item.favorite };
      await updateItem(item._id, updated);
      toast.success(updated.favorite ? '❤️ Added to favorites' : 'Removed from favorites');
      setStats(prev => {
        if (!prev) return prev;
        const delta = updated.favorite ? 1 : -1;
        const updateList = (list) => list.map(i => i._id === item._id ? { ...i, favorite: updated.favorite } : i);
        return {
          ...prev,
          summary: { ...prev.summary, totalFavorites: Math.max(0, prev.summary.totalFavorites + delta) },
          recentMovies: updateList(prev.recentMovies),
          recentBooks: updateList(prev.recentBooks),
        };
      });
      if (selectedItem?._id === item._id) setSelectedItem(p => ({ ...p, favorite: updated.favorite }));
      window.dispatchEvent(new Event('favorite_changed'));
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete._id);
      toast.success(`Moved "${itemToDelete.title}" to Trash`);
      setIsDeleteOpen(false);
      setItemToDelete(null);
      fetchStats();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-gray-800 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-gray-800 rounded-2xl" />)}
        </div>
        <div className="h-32 bg-slate-200 dark:bg-gray-800 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    summary = { totalMovies: 0, totalBooks: 0, averageRating: 0, totalFavorites: 0 },
    recentMovies = [],
    recentBooks = [],
    charts = { typeDistribution: [], genreDistribution: [], ratingDistribution: [] }
  } = stats || {};

  const RecentSection = ({ title, items, icon: Icon, accentClass, bgClass, linkTo }) => (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl ${bgClass} border border-slate-200 dark:border-gray-800/40`}>
            <Icon className={`w-4 h-4 ${accentClass}`} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
          <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <Link
          to={linkTo}
          className={`text-xs font-semibold ${accentClass} hover:underline flex items-center gap-1`}
        >
          View All <FaArrowRight size={10} />
        </Link>
      </div>

      {items.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {items.map(item => (
            <motion.div key={item._id} variants={cardVariants}>
              <LibraryItemCard
                item={item}
                onView={it => { setSelectedItem(it); setIsDetailsOpen(true); }}
                onEdit={it => { setSelectedItem(it); setIsEditOpen(true); }}
                onDelete={it => { setItemToDelete(it); setIsDeleteOpen(true); }}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#151f32] text-slate-400 shadow-sm">
          <Icon className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No {title.toLowerCase()} yet</p>
          <Link to="/add" className={`text-xs ${accentClass} hover:underline mt-1 inline-block`}>
            + Add {title === 'Recent Movies' ? 'Movie' : 'Book'}
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Welcome back, {firstName}! <span className="not-italic">👋</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Here's what's happening in your library today.
          </p>
        </div>
        <Link
          to="/add"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <FaPlus size={11} /><span>+ Add New Item</span>
        </Link>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard title="Total Movies" value={summary.totalMovies} icon={BiMoviePlay} gradient="from-blue-500 to-cyan-500" />
        <StatsCard title="Total Books" value={summary.totalBooks} icon={BiBookOpen} gradient="from-violet-500 to-purple-600" />
        <StatsCard title="Average Rating" value={summary.averageRating > 0 ? `${summary.averageRating}` : 'N/A'} icon={FaStar} gradient="from-amber-400 to-orange-500" />
        <div
          onClick={() => navigate('/favorites')}
          className="cursor-pointer"
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/favorites')}
          aria-label={`View ${summary.totalFavorites} favorites`}
        >
          <StatsCard title="Favorites" value={summary.totalFavorites} icon={FaHeart} gradient="from-rose-400 to-red-500" />
        </div>
      </div>

      {/* ── AI Banner Card (Reference Image Accurate) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#151f32] border border-slate-200 dark:border-gray-800/60 shadow-sm overflow-hidden relative"
      >
        {/* Background decorative element */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 right-20 w-24 h-24 bg-purple-50 dark:bg-purple-950/20 rounded-full blur-2xl pointer-events-none" />

        {/* Illustration */}
        <div className="flex-shrink-0 w-28 h-24 sm:w-36 sm:h-28 relative flex items-center justify-center">
          {/* Chart bars illustration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-2xl" />
          <div className="relative flex items-end gap-1.5 px-4 py-3 h-full w-full">
            {[40, 65, 45, 80, 55, 70].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-sm ${i % 3 === 0 ? 'bg-blue-500 dark:bg-blue-400' : i % 3 === 1 ? 'bg-indigo-400 dark:bg-indigo-300' : 'bg-purple-400 dark:bg-purple-300'}`}
                style={{ height: `${h}%` }}
              />
            ))}
            {/* Donut circle overlay */}
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full border-4 border-blue-500 dark:border-blue-400 border-t-purple-400 dark:border-t-purple-300" />
          </div>
          {/* Book/Star decorations */}
          <div className="absolute -bottom-1 -left-1 text-amber-400 text-lg">⭐</div>
          <div className="absolute -top-1 -right-1 text-blue-500 text-xs">✦</div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your library insights are waiting!
          </h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1.5 max-w-xl">
            Add more movies and books to unlock AI-powered analytics and personalized recommendations.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <button
              onClick={() => navigate('/ai')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-purple-600 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all"
            >
              <FaBrain className="w-3.5 h-3.5" />
              <span>✨ Analyze My Library</span>
            </button>
            <button
              onClick={() => navigate('/ai')}
              className="text-sm font-semibold text-blue-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              View Recommendations <FaArrowRight size={10} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Charts ── */}
      <StatsCharts data={charts} />

      {/* ── Recent Movies ── */}
      <RecentSection
        title="Recent Movies"
        items={recentMovies}
        icon={FaFilm}
        accentClass="text-blue-600 dark:text-blue-400"
        bgClass="bg-blue-50 dark:bg-blue-950/30"
        linkTo="/library"
      />

      {/* ── Divider ── */}
      <div className="border-t border-slate-200 dark:border-gray-800/60" />

      {/* ── Recent Books ── */}
      <RecentSection
        title="Recent Books"
        items={recentBooks}
        icon={FaBookOpen}
        accentClass="text-violet-600 dark:text-purple-400"
        bgClass="bg-violet-50 dark:bg-purple-950/30"
        linkTo="/library"
      />

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
        onSave={() => fetchStats()}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setItemToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.title}
        itemType={itemToDelete?.type}
      />
    </motion.div>
  );
};

export default Dashboard;
