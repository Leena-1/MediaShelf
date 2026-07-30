import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({ currentPage, totalPages, limit, onPageChange, onLimitChange }) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
            currentPage === i
              ? 'bg-blue-600 dark:bg-purple-650 text-white shadow-md'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 focus:outline-none'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-150 dark:border-gray-800/40 pt-6 mt-6">
      
      {/* Page Limit Selector */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Show</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151f32] text-gray-700 dark:text-gray-300 font-semibold focus:outline-none"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>items per page</span>
      </div>

      {/* Page Navigation buttons */}
      {totalPages > 1 ? (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
            aria-label="Previous Page"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          
          {renderPageNumbers()}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
            aria-label="Next Page"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Page Count Info */}
      <div className="text-xs text-gray-450 dark:text-gray-500 font-medium">
        Page {currentPage} of {totalPages || 1}
      </div>
    </div>
  );
};

export default Pagination;
