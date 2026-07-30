import React from 'react';
import { FaStar, FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import { BiMoviePlay, BiBookOpen, BiCalendar, BiUser } from 'react-icons/bi';

export const LibraryItemDetailsModal = ({ isOpen, onClose, item, onToggleFavorite }) => {
  if (!isOpen || !item) return null;

  const { title, type, genre, authorOrDirector, rating, releaseYear, description, posterUrl, favorite, createdAt } = item;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFallbackGradient = () => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-400 to-teal-600',
      'from-amber-400 to-orange-600',
      'from-rose-400 to-red-600'
    ];
    return gradients[title.length % gradients.length];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-[#151f32] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-gray-800 animate-fade-in flex flex-col md:flex-row h-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white md:bg-gray-100 md:dark:bg-gray-800 md:text-gray-500 md:hover:text-gray-700 md:dark:hover:text-white transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        {/* Left: Poster Side */}
        <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 dark:bg-gray-900 flex-shrink-0 relative">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
              className="w-full h-full object-cover"
            />
          ) : null}
          <div
            style={{ display: posterUrl ? 'none' : 'flex' }}
            className={`w-full h-full bg-gradient-to-br ${getFallbackGradient()} flex flex-col items-center justify-center p-6 text-center text-white`}
          >
            {type === 'Movie' ? (
              <BiMoviePlay className="w-16 h-16 opacity-80 mb-2" />
            ) : (
              <BiBookOpen className="w-16 h-16 opacity-80 mb-2" />
            )}
            <span className="font-sans font-bold text-lg leading-snug drop-shadow-sm select-none">
              {title}
            </span>
          </div>
        </div>

        {/* Right: Info Side */}
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header tags */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-purple-950/30 text-blue-600 dark:text-purple-400">
                {type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {genre}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {title}
            </h3>

            {/* Rating Stars */}
            <div className="flex items-center space-x-1 mb-6">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar
                  key={i}
                  className={`w-5 h-5 ${
                    i < rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                ({rating}/5)
              </span>
            </div>

            {/* Director / Author & Release Year Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2.5 text-gray-600 dark:text-gray-350 text-sm">
                <BiUser className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{type === 'Movie' ? 'Director' : 'Author'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{authorOrDirector}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 text-gray-600 dark:text-gray-350 text-sm">
                <BiCalendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Release Year</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{releaseYear}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Description</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-gray-800/40 pt-4 mt-4">
            <span className="text-[11px] text-gray-400">
              Added: {formatDate(createdAt)}
            </span>

            {/* Favorite toggle button */}
            <button
              onClick={() => onToggleFavorite(item)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-250 dark:border-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none"
            >
              {favorite ? (
                <>
                  <FaHeart className="text-red-500" />
                  <span className="text-red-500">Favorited</span>
                </>
              ) : (
                <>
                  <FaRegHeart className="text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Add Favorite</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LibraryItemDetailsModal;
