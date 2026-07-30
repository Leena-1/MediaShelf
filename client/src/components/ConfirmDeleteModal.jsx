import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName, itemType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-[#1a2336] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-gray-800 animate-fade-in">
        <div className="flex items-center space-x-3 text-red-500 mb-4">
          <FiAlertTriangle className="w-8 h-8 flex-shrink-0" />
          <h3 className="text-xl font-bold">Delete {itemType}?</h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{itemName}"</span>? This action is permanent and cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition-all active:scale-95 focus:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
