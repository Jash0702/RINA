import { useEffect, useState } from 'react';

/**
 * Generates smooth 60fps ECG waveform favicon frames dynamically on an offscreen canvas.
 * - System theme is dark (black browser tab bar): White pulse waveform (#FFFFFF) for maximum contrast.
 * - System theme is light (white browser tab bar): Black pulse waveform (#000000) for maximum contrast.
 */
function generateFramesForColor(color) {
  if (typeof document === 'undefined') return [];

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const points = [
    { x: 4, y: 32 },
    { x: 14, y: 32 },
    { x: 17, y: 27 },
    { x: 21, y: 32 },
    { x: 26, y: 32 },
    { x: 29, y: 40 },
    { x: 34, y: 8 },
    { x: 40, y: 56 },
    { x: 44, y: 28 },
    { x: 47, y: 32 },
    { x: 51, y: 25 },
    { x: 55, y: 32 },
    { x: 60, y: 32 },
  ];

  // Calculate cumulative distances along the path
  const distances = [0];
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.hypot(dx, dy);
    distances.push(totalLength);
  }

  function getPointAt(dist) {
    if (dist <= 0) return points[0];
    if (dist >= totalLength) return points[points.length - 1];
    for (let i = 1; i < distances.length; i++) {
      if (dist <= distances[i]) {
        const segLen = distances[i] - distances[i - 1];
        const t = (dist - distances[i - 1]) / segLen;
        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
        };
      }
    }
    return points[points.length - 1];
  }

  const frameCount = 24;
  const frames = [];
  const trailLength = totalLength * 0.45;

  for (let f = 0; f < frameCount; f++) {
    ctx.clearRect(0, 0, size, size);

    const headDist = (f / frameCount) * (totalLength + trailLength);
    const tailDist = Math.max(0, headDist - trailLength);
    const effectiveHead = Math.min(totalLength, headDist);

    if (effectiveHead > tailDist) {
      ctx.save();
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;

      ctx.beginPath();
      const startPt = getPointAt(tailDist);
      ctx.moveTo(startPt.x, startPt.y);

      for (let i = 0; i < points.length; i++) {
        if (distances[i] > tailDist && distances[i] < effectiveHead) {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }

      const endPt = getPointAt(effectiveHead);
      ctx.lineTo(endPt.x, endPt.y);
      ctx.stroke();

      // Bright sweep head dot
      if (headDist <= totalLength) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else {
      // Subtle resting baseline between cycles
      ctx.save();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.moveTo(4, 32);
      ctx.lineTo(60, 32);
      ctx.stroke();
      ctx.restore();
    }

    frames.push(canvas.toDataURL('image/png'));
  }

  return frames;
}

const framesCache = {
  dark: null,
  light: null,
};

// Background Web Worker script to bypass Chrome/Firefox background tab throttling
const workerCode = `
  let intervalId = null;
  self.onmessage = function(e) {
    if (e.data.action === 'start') {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(function() {
        self.postMessage('tick');
      }, e.data.interval || 50);
    } else if (e.data.action === 'stop') {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    }
  };
`;

export const useAnimatedFavicon = (frameInterval = 50) => {
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default fallback to dark system theme
  });

  // Real-time listener for user's OS / system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsSystemDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Animate favicon frames based strictly on system theme with Web Worker unthrottled timer
  useEffect(() => {
    const color = isSystemDark ? '#FFFFFF' : '#000000';
    const cacheKey = isSystemDark ? 'dark' : 'light';

    if (!framesCache[cacheKey]) {
      framesCache[cacheKey] = generateFramesForColor(color);
    }

    const currentFrames = framesCache[cacheKey];
    if (!currentFrames || currentFrames.length === 0) return;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const startTime = Date.now();
    let worker = null;
    let fallbackIntervalId = null;
    let workerUrl = null;

    const updateFrame = () => {
      // Wall-clock timestamp ensures exact smooth speed even when switching tabs
      const elapsed = Date.now() - startTime;
      const frameIndex = Math.floor(elapsed / frameInterval) % currentFrames.length;
      link.href = currentFrames[frameIndex];
    };

    // Set initial frame immediately
    updateFrame();

    try {
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);
      worker.onmessage = updateFrame;
      worker.postMessage({ action: 'start', interval: frameInterval });
    } catch (e) {
      // Fallback timer if Web Workers are restricted
      fallbackIntervalId = setInterval(updateFrame, frameInterval);
    }

    // Instant sync whenever user switches back to this tab
    const handleVisibilityChange = () => {
      updateFrame();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (worker) {
        worker.postMessage({ action: 'stop' });
        worker.terminate();
      }
      if (workerUrl) {
        URL.revokeObjectURL(workerUrl);
      }
      if (fallbackIntervalId) {
        clearInterval(fallbackIntervalId);
      }
    };
  }, [isSystemDark, frameInterval]);
};
