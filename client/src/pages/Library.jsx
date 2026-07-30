import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LibrarySection from '../components/LibrarySection';
import { getItems } from '../services/api';
import { exportLibraryToJSON, exportLibraryToCSV, parseAndValidateJSONFile } from '../utils/exportImport';
import { importItems } from '../services/api';
import { FaDownload, FaUpload, FaFileCsv } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useState } from 'react';

export const Library = ({ globalSearch, setGlobalSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);

  // Sync URL query search with global state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch) {
      setGlobalSearch(urlSearch);
      navigate('/library', { replace: true });
    }
  }, [location.search, setGlobalSearch, navigate]);

  const handleFavoriteChange = useCallback(() => {
    window.dispatchEvent(new Event('favorite_changed'));
  }, []);

  const handleExportJSON = async () => {
    try {
      const res = await getItems({ limit: 10000, deleted: false });
      const itemsList = res.data.items || res.data;
      if (!itemsList || itemsList.length === 0) {
        toast.error('Library is empty. Nothing to export.');
        return;
      }
      exportLibraryToJSON(itemsList);
      toast.success('Library exported to JSON successfully!');
    } catch {
      toast.error('Failed to export library JSON.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await getItems({ limit: 10000, deleted: false });
      const itemsList = res.data.items || res.data;
      if (!itemsList || itemsList.length === 0) {
        toast.error('Library is empty. Nothing to export.');
        return;
      }
      exportLibraryToCSV(itemsList);
      toast.success('Library exported to CSV successfully!');
    } catch {
      toast.error('Failed to export library CSV.');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const parsedData = await parseAndValidateJSONFile(file);
      const res = await importItems(parsedData);
      const { insertedCount, skippedCount, errorCount } = res.data;
      if (insertedCount > 0) toast.success(`Imported ${insertedCount} items!`);
      if (skippedCount > 0) toast.error(`Skipped ${skippedCount} duplicates.`);
      if (errorCount > 0) toast.error(`${errorCount} items had errors.`);
      // Force sections to refresh by toggling global search
      setGlobalSearch('');
    } catch (err) {
      toast.error(err.message || 'Failed to import JSON data.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800/40 pb-6">
        <div>
          <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">
            Library Catalog
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse your collection — Movies and Books displayed separately.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <label className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151f32] text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isImporting ? 'opacity-50' : ''}`}>
            <FaUpload size={12} />
            <span>{isImporting ? 'Importing...' : 'Import JSON'}</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={isImporting} />
          </label>
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white text-xs font-semibold shadow-md hover:scale-[1.01] transition-all"
            title="Export library as JSON file"
          >
            <FaDownload size={12} />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
            title="Export library as CSV spreadsheet"
          >
            <FaFileCsv size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── MOVIES always first ─── */}
      <LibrarySection
        type="Movie"
        globalSearch={globalSearch}
        onFavoriteChange={handleFavoriteChange}
      />

      {/* ─── Divider ─── */}
      <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-800" />

      {/* ─── BOOKS always second ─── */}
      <LibrarySection
        type="Book"
        globalSearch={globalSearch}
        onFavoriteChange={handleFavoriteChange}
      />
    </motion.div>
  );
};

export default Library;
