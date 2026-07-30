import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';

export const MainLayout = ({ globalSearch, setGlobalSearch }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] text-gray-950 dark:text-gray-100 transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-gray-400">Loading MediaShelf...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar onSearchChange={setGlobalSearch} searchValue={globalSearch} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <ScrollToTop />
    </div>
  );
};

export default MainLayout;
