import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createItem, uploadPoster } from '../services/api';
import { generateItemDetails } from '../services/aiApi';
import LibraryItemCard from '../components/LibraryItemCard';
import toast from 'react-hot-toast';
import { FaSpinner, FaPlus, FaTimes, FaFileUpload, FaMagic } from 'react-icons/fa';

const STATUSES = ['Plan to Watch', 'Watching', 'Completed', 'On Hold'];

export const AddItem = () => {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    type: 'Movie',
    title: '',
    genre: '',
    authorOrDirector: '',
    rating: 3,
    releaseYear: currentYear,
    description: '',
    poster: '',
    status: 'Plan to Watch',
    tags: [],
    favorite: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errors, setErrors] = useState({});

  const handleAiGenerate = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title first to generate AI details.');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await generateItemDetails(formData.title, formData.type);
      const data = res.data.data;
      setFormData(prev => ({
        ...prev,
        genre: data.genre || prev.genre,
        description: data.description || prev.description,
        tags: data.tags?.length ? [...new Set([...prev.tags, ...data.tags])] : prev.tags
      }));
      toast.success('✨ Generated details with AI!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.genre.trim()) e.genre = 'Genre is required';
    if (!formData.authorOrDirector.trim()) e.authorOrDirector = `${formData.type === 'Movie' ? 'Director' : 'Author'} is required`;
    if (!formData.description.trim()) e.description = 'Description is required';
    const r = Number(formData.rating);
    if (isNaN(r) || r < 1 || r > 5) e.rating = 'Rating must be 1-5';
    const y = Number(formData.releaseYear);
    if (isNaN(y) || y < 1800 || y > currentYear + 5) e.releaseYear = `Year must be 1800–${currentYear + 5}`;
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
      toast.success('Poster image uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload poster file.');
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below.'); return; }
    setIsSubmitting(true);
    try {
      await createItem(formData);
      toast.success(`✅ ${formData.type} saved to your library!`);
      setFormData({
        type: formData.type,
        title: '', genre: '', authorOrDirector: '',
        rating: 3, releaseYear: currentYear,
        description: '', poster: '',
        status: 'Plan to Watch', tags: [], favorite: false
      });
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (name) =>
    `w-full px-4 py-2.5 text-sm rounded-xl border ${errors[name] ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'} bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 transition-all`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="border-b border-gray-100 dark:border-gray-800/40 pb-6 mb-8">
        <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">Add Media Item</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Expand your personal library catalog.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form: 7 cols */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151f32] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-gray-800/60 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Item Type</span>
              <div className="flex bg-slate-50 dark:bg-gray-800 p-1.5 rounded-xl border border-slate-200 dark:border-gray-800 w-fit">
                {['Movie', 'Book'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: t, authorOrDirector: '' }))}
                    className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                      formData.type === t
                        ? t === 'Movie' ? 'bg-blue-600 text-white shadow' : 'bg-purple-600 text-white shadow'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGeneratingAi || !formData.title.trim()}
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingAi ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                  <span>Generate with AI</span>
                </button>
              </div>
              <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder={formData.type === 'Movie' ? 'e.g. Interstellar' : 'e.g. The Hobbit'} className={fieldClass('title')} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Genre</label>
                <input name="genre" type="text" value={formData.genre} onChange={handleChange} placeholder="e.g. Science Fiction" className={fieldClass('genre')} />
                {errors.genre && <p className="text-red-500 text-xs mt-1">{errors.genre}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Rating (1-5)</label>
                <select name="rating" value={formData.rating} onChange={handleChange} className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151f32] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500">
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} {r === 1 ? 'Star' : 'Stars'}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  {formData.type === 'Movie' ? 'Director' : 'Author'}
                </label>
                <input name="authorOrDirector" type="text" value={formData.authorOrDirector} onChange={handleChange}
                  placeholder={formData.type === 'Movie' ? 'e.g. Christopher Nolan' : 'e.g. J.R.R. Tolkien'}
                  className={fieldClass('authorOrDirector')} />
                {errors.authorOrDirector && <p className="text-red-500 text-xs mt-1">{errors.authorOrDirector}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Release Year</label>
                <input name="releaseYear" type="number" value={formData.releaseYear} onChange={handleChange} placeholder="e.g. 2014" className={fieldClass('releaseYear')} />
                {errors.releaseYear && <p className="text-red-500 text-xs mt-1">{errors.releaseYear}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151f32] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Poster Image</label>
                    <label className="text-xs text-blue-600 dark:text-purple-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      {isUploading ? <FaSpinner className="animate-spin" /> : <FaFileUpload size={11} />}
                      <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                    </label>
                  </div>
                  <input name="poster" type="text" value={formData.poster} onChange={handleChange} placeholder="https://... or /uploads/..." className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 transition-all" />
                </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tags</label>
              <div className="flex gap-2">
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Type tag and press Enter"
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button type="button" onClick={addTag} className="px-4 py-2 text-sm rounded-xl bg-blue-50 dark:bg-purple-950/30 text-blue-600 dark:text-purple-400 font-semibold hover:bg-blue-100 transition-colors">Add</button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-purple-950/30 text-blue-600 dark:text-purple-400 text-xs font-semibold">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><FaTimes size={9} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                placeholder="Brief summary..."
                className={`${fieldClass('description')} resize-none`} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="flex items-center space-x-3">
              <input type="checkbox" id="favorite" name="favorite" checked={formData.favorite} onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="favorite" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none">Add to Favorites</label>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-650 dark:to-indigo-650 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-55">
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <><FaPlus size={12} /><span>Save to Library</span></>}
            </button>
          </form>
        </div>

        {/* Live Preview: 5 cols */}
        <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-24">
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Live Preview</span>
          <div className="max-w-sm mx-auto">
            <LibraryItemCard
              item={{
                title: formData.title || 'Untitled',
                type: formData.type,
                genre: formData.genre || 'Genre',
                authorOrDirector: formData.authorOrDirector || (formData.type === 'Movie' ? 'Director' : 'Author'),
                rating: Number(formData.rating) || 3,
                releaseYear: formData.releaseYear || currentYear,
                poster: formData.poster,
                status: formData.status,
                favorite: formData.favorite,
                tags: formData.tags
              }}
              onView={() => {}} onEdit={() => {}} onDelete={() => {}} onToggleFavorite={() => {}}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AddItem;
