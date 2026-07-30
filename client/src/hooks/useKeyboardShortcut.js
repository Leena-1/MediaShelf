import { useEffect } from 'react';

export const useKeyboardShortcut = (targetKey, callback) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only trigger if targetKey matches and the user isn't typing in an input/textarea
      if (
        event.key === targetKey &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetKey, callback]);
};
export default useKeyboardShortcut;
