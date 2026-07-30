import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  analyzeLibrary, 
  getAiRecommendations, 
  smartSearchAi, 
  generateItemDetails 
} from '../services/aiApi';
import LibraryItemCard from '../components/LibraryItemCard';
import toast from 'react-hot-toast';
import { 
  FaBrain, 
  FaMagic, 
  FaStar, 
  FaSearch, 
  FaCompass, 
  FaSpinner, 
  FaChartPie, 
  FaBookReader, 
  FaFilm, 
  FaLightbulb, 
  FaRedo,
  FaCheckCircle,
  FaArrowRight,
  FaTags,
  FaCopy
} from 'react-icons/fa';

export const AiCenter = () => {
  const [activeTab, setActiveTab] = useState('analyzer');

  // Analyzer State
  const [analyzerData, setAnalyzerData] = useState(null);
  const [loadingAnalyzer, setLoadingAnalyzer] = useState(false);

  // Recommendations State
  const [recData, setRecData] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Smart Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [mongoFilter, setMongoFilter] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Generator State
  const [genTitle, setGenTitle] = useState('');
  const [genType, setGenType] = useState('Movie');
  const [genResult, setGenResult] = useState(null);
  const [loadingGen, setLoadingGen] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setLoadingAnalyzer(true);
    try {
      const res = await analyzeLibrary();
      setAnalyzerData(res.data.data);
      toast.success('Library analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service is temporarily unavailable.');
    } finally {
      setLoadingAnalyzer(false);
    }
  };

  const handleRecommend = async () => {
    setLoadingRecs(true);
    try {
      const res = await getAiRecommendations();
      setRecData(res.data.data);
      toast.success('Generated fresh recommendations!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service is temporarily unavailable.');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSmartSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await smartSearchAi(searchQuery);
      setSearchResults(res.data.data);
      setMongoFilter(res.data.mongoFilter);
      toast.success(`Found ${res.data.count} matching item(s)`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI smart search failed.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!genTitle.trim()) return;
    setLoadingGen(true);
    try {
      const res = await generateItemDetails(genTitle, genType);
      setGenResult(res.data.data);
      toast.success('Metadata generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generator failed.');
    } finally {
      setLoadingGen(false);
    }
  };

  const sampleSearchQueries = [
    'Show thriller movies rated above 4 stars',
    'Books I plan to read or currently reading',
    'Science fiction movies released after 2010',
    'Christopher Nolan movies',
    'Self-help books with 5 stars'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <FaBrain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                AI Intelligence Center
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold uppercase tracking-wider">
                  Gemini AI
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Personalized analytics, smart recommendations, and natural language search derived from your library.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-[#131b2e] p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
          {[
            { id: 'analyzer', label: 'Library Analyzer', icon: FaChartPie },
            { id: 'recs', label: 'Recommendations', icon: FaCompass },
            { id: 'search', label: 'Smart Search', icon: FaSearch },
            { id: 'generator', label: 'Metadata Gen', icon: FaMagic },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-[#1d283f] text-blue-600 dark:text-purple-400 shadow-md border border-gray-100 dark:border-gray-700/50'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={isActive ? 'text-blue-500 dark:text-purple-400' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {/* ── TAB 1: LIBRARY ANALYZER ────────────────────────────────────── */}
        {activeTab === 'analyzer' && (
          <motion.div
            key="analyzer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Action Bar */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <FaStar /> AI Library Analyzer
                </h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Let Gemini analyze your catalog balance, watching/reading habits, ratings, and missing genres to deliver a comprehensive personal report.
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loadingAnalyzer}
                className="px-6 py-3.5 rounded-2xl bg-white text-gray-900 font-extrabold text-sm shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 whitespace-nowrap"
              >
                {loadingAnalyzer ? (
                  <>
                    <FaSpinner className="animate-spin text-blue-600" />
                    <span>Analyzing Library...</span>
                  </>
                ) : (
                  <>
                    <FaBrain className="text-purple-600" />
                    <span>{analyzerData ? 'Re-Analyze Library' : 'Analyze My Library'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Skeleton Loading */}
            {loadingAnalyzer && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-[#151f32] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loadingAnalyzer && !analyzerData && (
              <div className="text-center py-16 bg-white dark:bg-[#151f32] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 p-8">
                <div className="w-16 h-16 bg-blue-50 dark:bg-purple-950/40 text-blue-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  <FaChartPie />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Analysis Report Generated Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 mb-6">
                  Click "Analyze My Library" above to let Gemini parse your movies, books, genres, and ratings.
                </p>
                <button
                  onClick={handleAnalyze}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow"
                >
                  Analyze My Library
                </button>
              </div>
            )}

            {/* Analyzer Dashboard Cards */}
            {!loadingAnalyzer && analyzerData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white dark:bg-[#151f32] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="p-2 rounded-lg bg-blue-50 dark:bg-purple-950/40 text-blue-600 dark:text-purple-400">
                      <FaLightbulb />
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Executive Summary</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                    {analyzerData.summary}
                  </p>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Collection Balance */}
                  <div className="bg-white dark:bg-[#151f32] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FaChartPie className="text-blue-500" /> Collection Balance
                    </h4>
                    <p className="text-gray-900 dark:text-white font-semibold text-base">
                      {analyzerData.collectionBalance}
                    </p>
                  </div>

                  {/* Favorite Genres */}
                  <div className="bg-white dark:bg-[#151f32] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FaTags className="text-purple-500" /> Top Favorite Genres
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analyzerData.favoriteGenres?.map((g, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-purple-950/50 text-blue-600 dark:text-purple-300 font-semibold text-xs border border-blue-100 dark:border-purple-800/40">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highest Rated & Least Explored */}
                  <div className="bg-white dark:bg-[#151f32] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Highest Rated Genre</span>
                      <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">{analyzerData.highestRatedGenre}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Least Explored Genre</span>
                      <span className="text-sm font-bold text-amber-500 dark:text-amber-400">{analyzerData.leastExploredGenre}</span>
                    </div>
                  </div>

                  {/* Reading Habit */}
                  <div className="bg-white dark:bg-[#151f32] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FaBookReader className="text-indigo-500" /> Reading Habits
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {analyzerData.readingHabit}
                    </p>
                  </div>

                  {/* Watching Habit */}
                  <div className="bg-white dark:bg-[#151f32] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FaFilm className="text-rose-500" /> Watching Habits
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {analyzerData.watchingHabit}
                    </p>
                  </div>

                  {/* Missing Genres */}
                  <div className="bg-white dark:bg-[#151f32] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FaCompass className="text-cyan-500" /> Recommended Genres to Explore
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analyzerData.missingGenres?.map((mg, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium">
                          {mg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interesting Facts */}
                {analyzerData.interestingFacts?.length > 0 && (
                  <div className="bg-white dark:bg-[#151f32] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaStar className="text-amber-400" /> Interesting Library Insights
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analyzerData.interestingFacts.map((fact, idx) => (
                        <li key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1b253b] border border-gray-100 dark:border-gray-800/80 text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2.5">
                          <FaCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── TAB 2: PERSONALIZED RECOMMENDATIONS ───────────────────────── */}
        {activeTab === 'recs' && (
          <motion.div
            key="recs"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151f32] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaCompass className="text-purple-500" /> AI Tailored Recommendations
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  5 Movies & 5 Books custom-matched to your favorite authors, directors, and genres.
                </p>
              </div>
              <button
                onClick={handleRecommend}
                disabled={loadingRecs}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 justify-center whitespace-nowrap"
              >
                {loadingRecs ? <FaSpinner className="animate-spin" /> : <FaRedo />}
                <span>{recData ? 'Refresh Recommendations' : 'Recommend For Me'}</span>
              </button>
            </div>

            {/* Loading */}
            {loadingRecs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-[#151f32] h-64 rounded-2xl animate-pulse border border-gray-200 dark:border-gray-800" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loadingRecs && !recData && (
              <div className="text-center py-16 bg-white dark:bg-[#151f32] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 p-8">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  <FaCompass />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Recommendations Generated Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 mb-6">
                  Click "Recommend For Me" to get 10 curated suggestions based on your library ratings.
                </p>
                <button
                  onClick={handleRecommend}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow"
                >
                  Recommend For Me
                </button>
              </div>
            )}

            {/* Recommendation Cards */}
            {!loadingRecs && recData && (
              <div className="space-y-8">
                {/* Movies Section */}
                {recData.movies?.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaFilm className="text-blue-500" /> Movie Recommendations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {recData.movies.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#151f32] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group">
                          <div className="h-32 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/30 flex items-center justify-center relative overflow-hidden">
                            <FaFilm className="text-4xl text-blue-500/40" />
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {item.confidence}% Match
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-purple-400">
                              {item.genre}
                            </span>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 leading-snug">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Books Section */}
                {recData.books?.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaBookReader className="text-purple-500" /> Book Recommendations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {recData.books.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#151f32] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group">
                          <div className="h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/30 flex items-center justify-center relative overflow-hidden">
                            <FaBookReader className="text-4xl text-purple-500/40" />
                            <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {item.confidence}% Match
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              {item.genre}
                            </span>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 leading-snug">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB 3: SMART SEARCH ────────────────────────────────────────── */}
        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search Input Box */}
            <div className="bg-white dark:bg-[#151f32] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaSearch className="text-blue-500" /> AI Natural Language Search
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ask Gemini in plain English. Gemini converts your sentence into a precise MongoDB query JSON to filter your library.
                </p>
              </div>

              <form onSubmit={handleSmartSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. 'Show thriller movies rated above 4 stars' or 'Books I haven't finished'"
                  className="w-full pl-12 pr-32 py-4 text-sm sm:text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <button
                  type="submit"
                  disabled={loadingSearch || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center gap-1.5 shadow"
                >
                  {loadingSearch ? <FaSpinner className="animate-spin" /> : <span>AI Search</span>}
                </button>
              </form>

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-gray-400 font-semibold self-center">Try asking:</span>
                {sampleSearchQueries.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(promptText);
                    }}
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-purple-950/40 dark:hover:text-purple-400 transition-colors"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Mongo Query Inspection */}
            {mongoFilter && (
              <div className="bg-gray-900 text-gray-200 p-4 rounded-2xl text-xs font-mono border border-gray-800 flex items-center justify-between">
                <div className="space-x-2">
                  <span className="text-purple-400 font-bold">Generated Mongo Filter JSON:</span>
                  <code>{JSON.stringify(mongoFilter)}</code>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {loadingSearch && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-[#151f32] h-72 rounded-2xl animate-pulse border border-gray-200 dark:border-gray-800" />
                ))}
              </div>
            )}

            {!loadingSearch && searchResults && (
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#151f32] rounded-3xl border border-gray-200 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No items in your library match this query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.map((item) => (
                      <LibraryItemCard key={item._id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB 4: METADATA GENERATOR ──────────────────────────────────── */}
        {activeTab === 'generator' && (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="bg-white dark:bg-[#151f32] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaMagic className="text-purple-500" /> AI Description & Tag Generator
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter any Movie or Book title and let Gemini instantly write descriptions, select genres, tag keywords, and generate taglines.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="flex gap-3">
                  {['Movie', 'Book'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setGenType(t)}
                      className={`px-5 py-2 text-xs font-bold rounded-xl border transition-all ${
                        genType === t
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={genTitle}
                    onChange={(e) => setGenTitle(e.target.value)}
                    placeholder={`e.g. ${genType === 'Movie' ? 'Oppenheimer' : '1984'}`}
                    className="flex-1 px-4 py-3 text-sm sm:text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loadingGen || !genTitle.trim()}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingGen ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                    <span>Generate</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Result Box */}
            {genResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#151f32] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {genResult.genre}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(genResult, null, 2));
                      toast.success('Copied to clipboard!');
                    }}
                    className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center gap-1"
                  >
                    <FaCopy /> Copy Metadata
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tagline / Summary</h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white italic">"{genResult.summary}"</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Generated Description</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{genResult.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommended Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {genResult.tags?.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-purple-950/40 text-blue-600 dark:text-purple-300 font-medium text-xs border border-blue-100 dark:border-purple-800/40">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AiCenter;
