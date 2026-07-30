import React from 'react';
import { motion } from 'framer-motion';
import { BiSearchAlt } from 'react-icons/bi';
import { FaFilm, FaBookOpen, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export const EmptyState = ({ message, type = 'search', onReset, itemType }) => {
  const getIcon = () => {
    if (type === 'search') return <BiSearchAlt className="w-10 h-10" />;
    if (itemType === 'Movie') return <FaFilm className="w-10 h-10" />;
    if (itemType === 'Book') return <FaBookOpen className="w-10 h-10" />;
    return <FaHeart className="w-10 h-10" />;
  };

  const getDefaultMessage = () => {
    if (type === 'search') return "No results found. Try adjusting your search or filters.";
    if (itemType === 'Movie') return "No Movies Found. Start building your movie collection!";
    if (itemType === 'Book') return "No Books Found. Start building your book collection!";
    return "Nothing here yet.";
  };

  const iconBg = itemType === 'Movie'
    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400'
    : itemType === 'Book'
    ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-500 dark:text-purple-400'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#151f32] my-6"
    >
      <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-5 ${iconBg}`}>
        {getIcon()}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {type === 'library' && itemType === 'Movie' ? 'No Movies Found' :
         type === 'library' && itemType === 'Book' ? 'No Books Found' :
         'No Items Found'}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm text-sm leading-relaxed">
        {message || getDefaultMessage()}
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        {onReset && (
          <button
            onClick={onReset}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white text-sm font-medium shadow-md hover:scale-[1.02] transition-all"
          >
            Reset Filters
          </button>
        )}
        {type === 'library' && (
          <Link
            to="/add"
            className="px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {itemType === 'Movie' ? '+ Add Movie' : itemType === 'Book' ? '+ Add Book' : '+ Add Item'}
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
