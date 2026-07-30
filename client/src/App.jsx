import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Favorites from './pages/Favorites';
import AddItem from './pages/AddItem';
import Collections from './pages/Collections';
import ActivityLogs from './pages/ActivityLogs';
import AiCenter from './pages/AiCenter';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const [globalSearch, setGlobalSearch] = useState('');
  const { theme } = useContext(ThemeContext);

  return (
    <Router>
      <Routes>
        {/* Public Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes under MainLayout */}
        <Route element={<MainLayout globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />}>
          <Route path="/" element={<Dashboard />} />
          <Route 
            path="/library" 
            element={
              <Library 
                globalSearch={globalSearch} 
                setGlobalSearch={setGlobalSearch} 
              />
            } 
          />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/ai" element={<AiCenter />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/activity" element={<ActivityLogs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#151f32' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#1e293b',
            border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e5e7eb',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '12px'
          }
        }} 
      />
    </Router>
  );
}

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
