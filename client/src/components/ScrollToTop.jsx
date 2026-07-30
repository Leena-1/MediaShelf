import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-600 text-white shadow-lg hover:shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none"
      aria-label="Scroll to top"
    >
      <FaArrowUp size={18} />
    </button>
  );
};

export default ScrollToTop;
