import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaHeart, FaRegHeart, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { BiMoviePlay, BiBookOpen } from 'react-icons/bi';

const GRADIENTS = [
  ['from-blue-500 to-indigo-600', 'bg-blue-500'],
  ['from-purple-500 to-pink-600', 'bg-purple-500'],
  ['from-emerald-400 to-teal-600', 'bg-emerald-500'],
  ['from-amber-400 to-orange-600', 'bg-amber-500'],
  ['from-rose-400 to-red-600', 'bg-rose-500'],
  ['from-cyan-400 to-blue-600', 'bg-cyan-500'],
  ['from-violet-500 to-purple-700', 'bg-violet-500'],
];

const STATUS_COLORS = {
  'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Watching': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Plan to Watch': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'On Hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export const LibraryItemCard = React.memo(({ item, onView, onEdit, onDelete, onToggleFavorite }) => {
  const { title, type, genre, authorOrDirector, rating, releaseYear, poster, favorite, status } = item;
  const [imgError, setImgError] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const gradientPair = GRADIENTS[title.length % GRADIENTS.length];
  const gradient = gradientPair[0];

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} className={`w-3 h-3 ${i < rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
    ));

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 600);
    onToggleFavorite(item);
  };

  const showFallback = !poster || imgError;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col w-full h-[410px] rounded-2xl bg-white dark:bg-[#1a2336] overflow-hidden border border-slate-200 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all"
    >
      {/* Poster / Fallback */}
      <div className="relative w-full h-[210px] flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900">
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-2.5 right-2.5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-sm transition-all focus:outline-none"
        >
          <AnimatePresence mode="wait">
            {favorite ? (
              <motion.div
                key="heart-filled"
                initial={{ scale: 0.5 }}
                animate={{ scale: heartAnimating ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                <FaHeart className="w-4 h-4 text-red-500" />
              </motion.div>
            ) : (
              <motion.div key="heart-empty" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <FaRegHeart className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Type Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center space-x-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold">
          {type === 'Movie' ? <BiMoviePlay className="w-3 h-3" /> : <BiBookOpen className="w-3 h-3" />}
          <span>{type}</span>
        </div>

        {/* Poster image */}
        {!showFallback && (
          <img
            src={poster}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Fallback — FIXED: icon always visible on gradient bg with white circular bg behind it */}
        {showFallback && (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3 p-4`}>
            {/* White circular container ensures icon is ALWAYS visible regardless of gradient color */}
            <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/40">
              {type === 'Movie'
                ? <BiMoviePlay className="w-7 h-7 text-white drop-shadow-md" />
                : <BiBookOpen className="w-7 h-7 text-white drop-shadow-md" />
              }
            </div>
            <span className="font-bold text-sm text-white text-center leading-tight line-clamp-2 drop-shadow">
              {title}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-grow p-4">
        {/* Genre + Status Row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-purple-950/30 text-blue-600 dark:text-purple-400 max-w-[100px] truncate">
            {genre}
          </span>
          {status && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || STATUS_COLORS['Plan to Watch']}`}>
              {status}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1" title={title}>
          {title}
        </h4>

        {/* Author/Director */}
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
          <span className="opacity-70">{type === 'Movie' ? 'Dir: ' : 'By: '}</span>
          {authorOrDirector}
        </p>

        {/* Stars + Year */}
        <div className="flex items-center justify-between mt-auto mb-3">
          <div className="flex space-x-0.5">{renderStars(rating)}</div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{releaseYear}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 border-t border-gray-100 dark:border-gray-800/40 pt-3">
          <button
            onClick={() => onView(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-purple-950/20 hover:text-blue-600 dark:hover:text-purple-400 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <FaEye size={11} /><span>View</span>
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
            title="Edit"
          >
            <FaEdit size={11} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Delete"
          >
            <FaTrash size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

LibraryItemCard.displayName = 'LibraryItemCard';
export default LibraryItemCard;
