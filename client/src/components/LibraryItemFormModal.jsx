import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateItem, uploadPoster } from '../services/api';
import toast from 'react-hot-toast';
import { FaTimes, FaSpinner, FaFileUpload } from 'react-icons/fa';

const STATUSES = ['Plan to Watch', 'Watching', 'Completed', 'On Hold'];

export const LibraryItemFormModal = ({ isOpen, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: 'Movie', title: '', genre: '', authorOrDirector: '',
    rating: 3, releaseYear: new Date().getFullYear(),
    description: '', poster: '', status: 'Plan to Watch',
    tags: [], favorite: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type || 'Movie',
        title: item.title || '',
        genre: item.genre || '',
        authorOrDirector: item.authorOrDirector || '',
        rating: item.rating || 3,
        releaseYear: item.releaseYear || new Date().getFullYear(),
        description: item.description || '',
        poster: item.poster || item.posterUrl || '',
        status: item.status || 'Plan to Watch',
        tags: item.tags || [],
        favorite: item.favorite || false
      });
      setErrors({});
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.genre.trim()) e.genre = 'Genre is required';
    if (!formData.authorOrDirector.trim()) e.authorOrDirector = 'Required';
    if (!formData.description.trim()) e.description = 'Description is required';
    const r = Number(formData.rating);
    if (isNaN(r) || r < 1 || r > 5) e.rating = 'Must be 1-5';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('poster', file);
      const res = await uploadPoster(data);
      const uploadedUrl = res.data.data?.url || res.data.url;
      setFormData(prev => ({ ...prev, poster: uploadedUrl }));
      toast.success('Poster image uploaded!');
    } catch (err) {
      toast.error('Failed to upload image file.');
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput('');
  };

  const removeTag = (tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await updateItem(item._id, formData);
      toast.success('Item updated successfully!');
      onSave(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (name) =>
    `w-full px-4 py-2 text-sm rounded-xl border ${errors[name] ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 transition-all`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-[#151f32] rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-gray-800 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-800/40 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit {formData.type}</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Title</label>
                <input name="title" type="text" value={formData.title} onChange={handleChange} className={fieldClass('title')} placeholder="Title" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Genre</label>
                  <input name="genre" type="text" value={formData.genre} onChange={handleChange} className={fieldClass('genre')} placeholder="Genre" />
                  {errors.genre && <p className="text-red-500 text-xs mt-1">{errors.genre}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Rating</label>
                  <select name="rating" value={formData.rating} onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151f32] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500">
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{formData.type === 'Movie' ? 'Director' : 'Author'}</label>
                  <input name="authorOrDirector" type="text" value={formData.authorOrDirector} onChange={handleChange} className={fieldClass('authorOrDirector')} />
                  {errors.authorOrDirector && <p className="text-red-500 text-xs mt-1">{errors.authorOrDirector}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Year</label>
                  <input name="releaseYear" type="number" value={formData.releaseYear} onChange={handleChange} className={fieldClass('releaseYear')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151f32] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Poster Image</label>
                    <label className="text-[11px] text-blue-600 dark:text-purple-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      {isUploading ? <FaSpinner className="animate-spin" /> : <FaFileUpload size={10} />}
                      <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                    </label>
                  </div>
                  <input name="poster" type="text" value={formData.poster} onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none" placeholder="https://... or /uploads/..." />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tags</label>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none" />
                  <button type="button" onClick={addTag} className="px-3 py-1.5 text-xs rounded-xl bg-blue-50 dark:bg-purple-950/30 text-blue-600 dark:text-purple-400 font-semibold">Add</button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-purple-950/30 text-blue-600 dark:text-purple-400 text-[11px] font-semibold">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><FaTimes size={8} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={`${fieldClass('description')} resize-none`} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="flex items-center space-x-3">
                <input type="checkbox" id="editFavorite" name="favorite" checked={formData.favorite} onChange={handleChange} className="w-4 h-4 rounded" />
                <label htmlFor="editFavorite" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none">Mark as Favorite</label>
              </div>
            </form>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-gray-800/40 bg-slate-50 dark:bg-[#131b2c] flex-shrink-0">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button type="submit" onClick={handleSubmit} disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white shadow-md hover:scale-[1.02] transition-all disabled:opacity-55">
                {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LibraryItemFormModal;
