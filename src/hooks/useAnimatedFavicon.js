import { useEffect } from 'react';
import faviconFrames from '../assets/faviconFrames.json';

/**
 * Hook to continuously animate the browser tab favicon across Chrome, Edge, and Firefox.
 * Modern browsers freeze APNG/GIF favicons by default, so cycling frames in JS ensures smooth 60/20fps animation.
 */
export const useAnimatedFavicon = (frameInterval = 50) => {
  useEffect(() => {
    if (!faviconFrames || faviconFrames.length === 0) return;

    let frameIndex = 0;
    let link = document.querySelector("link[rel~='icon']");

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const intervalId = setInterval(() => {
      frameIndex = (frameIndex + 1) % faviconFrames.length;
      link.href = faviconFrames[frameIndex];
    }, frameInterval);

    return () => clearInterval(intervalId);
  }, [frameInterval]);
};
