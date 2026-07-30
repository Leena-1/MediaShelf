import React, { useState, useEffect } from 'react';
import { getActivityLogs, clearActivityLogs } from '../services/api';
import { motion } from 'framer-motion';
import { FaHistory, FaTrash, FaSpinner } from 'react-icons/fa';
import { BiMoviePlay, BiBookOpen, BiStar, BiFolderPlus } from 'react-icons/bi';
import { MdDelete, MdRestore, MdOutlineLibraryAdd } from 'react-icons/md';
import toast from 'react-hot-toast';

const ACTION_ICONS = {
  CREATE_ITEM: MdOutlineLibraryAdd,
  UPDATE_ITEM: BiStar,
  TRASH_ITEM: MdDelete,
  RESTORE_ITEM: MdRestore,
  DELETE_ITEM: MdDelete,
  ADD_REVIEW: BiStar,
  UPDATE_REVIEW: BiStar,
  CREATE_COLLECTION: FaHistory,
  DELETE_COLLECTION: MdDelete,
  ADD_TO_COLLECTION: MdOutlineLibraryAdd,
  REMOVE_FROM_COLLECTION: MdDelete,
  IMPORT_ITEMS: MdOutlineLibraryAdd,
};

const ACTION_COLORS = {
  CREATE_ITEM: 'text-green-500 bg-green-50 dark:bg-green-950/30',
  UPDATE_ITEM: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
  TRASH_ITEM: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
  RESTORE_ITEM: 'text-teal-500 bg-teal-50 dark:bg-teal-950/30',
  DELETE_ITEM: 'text-red-500 bg-red-50 dark:bg-red-950/30',
  ADD_REVIEW: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
  CREATE_COLLECTION: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
  IMPORT_ITEMS: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
};

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getActivityLogs();
      setLogs(res.data);
    } catch (err) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClear = async () => {
    if (!window.confirm('Clear all activity logs?')) return;
    try {
      setClearing(true);
      await clearActivityLogs();
      setLogs([]);
      toast.success('Activity logs cleared');
    } catch (err) {
      toast.error('Failed to clear logs');
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/40 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-2xl">
            <FaHistory className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Activity Log</h2>
            <p className="text-xs text-gray-400 mt-0.5">{logs.length} recent actions</p>
          </div>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {clearing ? <FaSpinner className="animate-spin" /> : <FaTrash size={12} />}
            <span>Clear All</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FaHistory className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No activity yet</p>
          <p className="text-sm mt-1">Actions like adding, editing, and favoriting items will appear here.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {logs.map((log, idx) => {
            const Icon = ACTION_ICONS[log.action] || FaHistory;
            const colorClass = ACTION_COLORS[log.action] || 'text-gray-500 bg-gray-100 dark:bg-gray-800';
            return (
              <motion.div
                key={log._id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center space-x-4 p-4 bg-white dark:bg-[#151f32] rounded-xl border border-gray-100 dark:border-gray-800/50"
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.action.replace(/_/g, ' ')}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(log.createdAt)}</span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ActivityLogs;
