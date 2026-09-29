import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const useKeyboardShortcuts = ({ togglePlayback, seek, currentTime }) => {
  const {
    cases,
    selectCase,
    togglePresentation,
    activeDialog,
    setActiveDialog
  } = useApp();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if inside editable input/textarea
      const target = event.target;
      if (
        target.closest('input, textarea, select, [contenteditable="true"]') ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.repeat
      ) {
        return;
      }

      // Escape key closes modal or presentation mode
      if (event.key === 'Escape') {
        if (activeDialog) {
          event.preventDefault();
          setActiveDialog(null);
          return;
        }
      }

      // If modal is open, prevent other global shortcuts
      if (activeDialog) return;

      // Number keys 1-5: Select use case
      if (/^[1-5]$/.test(event.key)) {
        event.preventDefault();
        selectCase(Number(event.key) - 1);
        return;
      }

      // Space: Play / Pause
      if (event.code === 'Space' && !target.closest('button, a')) {
        event.preventDefault();
        togglePlayback();
        return;
      }

      // Arrow keys Left / Right: Seek -5s / +5s
      if (['ArrowLeft', 'ArrowRight'].includes(event.key) && !target.closest('[role="tablist"]')) {
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 5 : -5;
        seek(Math.max(0, currentTime + delta));
        return;
      }

      // 'F': Toggle presentation mode
      if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        togglePresentation();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cases.length, selectCase, togglePlayback, seek, currentTime, togglePresentation, activeDialog, setActiveDialog]);
};
