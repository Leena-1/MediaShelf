import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { getItems, getFavorites, logoutUser } from '../services/api';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { FiSun, FiMoon, FiSearch, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { FaHeart, FaPlus, FaBrain } from 'react-icons/fa';
import { BiLibrary, BiMoviePlay, BiBookOpen } from 'react-icons/bi';
import { MdDashboard } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = ({ onSearchChange, searchValue }) => {
  const { toggleTheme, isDark } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue || '');
  const [favCount, setFavCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useKeyboardShortcut('/', () => {
    if (searchInputRef.current) searchInputRef.current.focus();
  });

  useEffect(() => {
    setLocalSearch(searchValue || '');
  }, [searchValue]);

  const fetchFavCount = useCallback(async () => {
    try {
      const res = await getFavorites();
      const count = res.data.data?.totalFavorites ?? res.data.totalFavorites ?? 0;
      setFavCount(count);
    } catch {
      setFavCount(0);
    }
  }, []);

  useEffect(() => {
    if (user) fetchFavCount();
  }, [user, fetchFavCount]);

  // Listen for favorite_changed events dispatched from any page
  useEffect(() => {
    const handler = () => fetchFavCount();
    window.addEventListener('favorite_changed', handler);
    return () => window.removeEventListener('favorite_changed', handler);
  }, [fetchFavCount]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/library') {
      navigate(`/library`);
    }
    if (onSearchChange) onSearchChange(localSearch);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (location.pathname === '/library' && onSearchChange) onSearchChange(val);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore error on logout call
    }
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: MdDashboard },
    { to: '/library', label: 'Library', icon: BiLibrary },
    { to: '/ai', label: 'AI Center', icon: FaBrain },
    { to: '/add', label: 'Add Item', icon: FaPlus },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2 flex-shrink-0">
            <BiLibrary className="w-7 h-7 text-blue-600 dark:text-purple-500" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              MediaShelf
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-purple-950/30 text-blue-600 dark:text-purple-400 border border-blue-100 dark:border-purple-900/40 shadow-sm'
                      : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/40'
                  }`
                }
              >
                <Icon size={14} />
                <span>{label}</span>
              </NavLink>
            ))}

            {/* Favorites with badge */}
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-500'
                    : 'text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10'
                }`
              }
            >
              <FaHeart size={12} />
              <span>Favorites</span>
              {favCount > 0 && (
                <motion.span
                  key={favCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold"
                >
                  {favCount > 99 ? '99+' : favCount}
                </motion.span>
              )}
            </NavLink>
          </div>

          {/* Search + Actions */}
          <div className="hidden md:flex items-center space-x-3 flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder="Search... (Press /)"
                className="w-full pl-9 pr-10 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#131b2e] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-gray-900 dark:text-white transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="w-4 h-4" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="text-[10px] text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1">
                  /
                </kbd>
              </div>
            </form>
          </div>

          {/* Right: Theme + User */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1a2336] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              aria-label="Toggle theme"
            >
              {isDark
                ? <FiSun className="w-4 h-4 text-amber-400" />
                : <FiMoon className="w-4 h-4 text-blue-600" />}
            </button>

            {/* User Avatar + Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(s => !s)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-blue-200 dark:border-purple-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-purple-500 dark:to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1a2336] border border-slate-200 dark:border-gray-800 rounded-xl shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <NavLink to="/collections" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Collections
                      </NavLink>
                      <NavLink to="/activity" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Activity Logs
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <FiLogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(o => !o)}
              className="p-2 rounded-lg md:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
            >
              {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a]"
          >
            <div className="px-4 pt-3 pb-4 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative mb-2">
                <input
                  type="text"
                  value={localSearch}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#131b2e] text-gray-900 dark:text-white focus:outline-none"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiSearch className="w-4 h-4" />
                </div>
              </form>

              {[...navLinks, { to: '/favorites', label: `Favorites${favCount > 0 ? ` (${favCount})` : ''}`, icon: FaHeart }].map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-blue-50 dark:bg-purple-950/20 text-blue-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'
                    }`
                  }
                >
                  <Icon size={14} /><span>{label}</span>
                </NavLink>
              ))}

              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <FiLogOut size={14} /><span>Logout</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
