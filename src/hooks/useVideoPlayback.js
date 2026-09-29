import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export const useVideoPlayback = () => {
  const { activeCase, syncEnabled, media, speed, showToast } = useApp();

  const originalRef = useRef(null);
  const outputRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [slotStatus, setSlotStatus] = useState({
    original: { ready: false, duration: 0, currentTime: 0, error: null },
    output: { ready: false, duration: 0, currentTime: 0, error: null }
  });

  const activeMedia = media[activeCase.id] || {};
  const origUrl = activeMedia.original?.url || '';
  const outUrl = activeMedia.output?.url || '';

  // Get active video elements that are ready
  const getReadyVideos = useCallback(() => {
    const list = [];
    if (originalRef.current && origUrl) list.push(originalRef.current);
    if (outputRef.current && outUrl) list.push(outputRef.current);
    return list;
  }, [origUrl, outUrl]);

  const masterVideo = useCallback(() => {
    return originalRef.current || outputRef.current || null;
  }, []);

  // Update speed
  useEffect(() => {
    if (originalRef.current) originalRef.current.playbackRate = speed;
    if (outputRef.current) outputRef.current.playbackRate = speed;
  }, [speed]);

  // Handle case change: bind media & attempt autoplay
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);

    const timer = setTimeout(() => {
      const v1 = originalRef.current;
      const v2 = outputRef.current;
      if (v1) { v1.currentTime = 0; v1.playbackRate = speed; }
      if (v2) { v2.currentTime = 0; v2.playbackRate = speed; }

      const promises = [];
      if (v1 && origUrl) promises.push(v1.play().catch(() => {}));
      if (v2 && outUrl) promises.push(v2.play().catch(() => {}));

      Promise.all(promises).then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [activeCase.id, origUrl, outUrl, speed]);

  // Main animation frame tick for sync & timeline tracking
  useEffect(() => {
    let animId;

    const tick = () => {
      const v1 = originalRef.current;
      const v2 = outputRef.current;

      const d1 = v1 && Number.isFinite(v1.duration) ? v1.duration : 0;
      const d2 = v2 && Number.isFinite(v2.duration) ? v2.duration : 0;

      let calcDuration = 0;
      if (syncEnabled) {
        calcDuration = d1 && d2 ? Math.min(d1, d2) : (d1 || d2 || 0);
      } else {
        calcDuration = d1 || d2 || 0;
      }
      setDuration(calcDuration);

      if (!isScrubbing) {
        const master = v1 && origUrl ? v1 : (v2 && outUrl ? v2 : null);
        if (master) {
          setCurrentTime(master.currentTime);
        }
      }

      // Synchronized loop check
      if (syncEnabled && isPlaying && d1 > 0 && d2 > 0) {
        const loopBoundary = Math.min(d1, d2);
        if ((v1 && v1.currentTime >= loopBoundary - 0.08) ||
            (v2 && v2.currentTime >= loopBoundary - 0.08)) {
          if (v1) v1.currentTime = 0;
          if (v2) v2.currentTime = 0;
        }

        // Keep slave in sync with master if drift > 0.35s
        if (v1 && v2 && Math.abs(v1.currentTime - v2.currentTime) > 0.35) {
          v2.currentTime = v1.currentTime;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [syncEnabled, isPlaying, isScrubbing, origUrl, outUrl]);

  // Play / Pause controls
  const playAll = useCallback(() => {
    const v1 = originalRef.current;
    const v2 = outputRef.current;
    const promises = [];
    if (v1 && origUrl) promises.push(v1.play());
    if (v2 && outUrl) promises.push(v2.play());

    Promise.all(promises).then(() => {
      setIsPlaying(true);
    }).catch(err => {
      showToast('Autoplay restricted by browser. Click Play to start.');
      setIsPlaying(false);
    });
  }, [origUrl, outUrl, showToast]);

  const pauseAll = useCallback(() => {
    if (originalRef.current) originalRef.current.pause();
    if (outputRef.current) outputRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pauseAll();
    } else {
      playAll();
    }
  }, [isPlaying, pauseAll, playAll]);

  const restartPlayback = useCallback(() => {
    pauseAll();
    if (originalRef.current) originalRef.current.currentTime = 0;
    if (outputRef.current) outputRef.current.currentTime = 0;
    setCurrentTime(0);
  }, [pauseAll]);

  const seek = useCallback((targetTime) => {
    const maxDur = duration || 100;
    const clamped = Math.max(0, Math.min(targetTime, maxDur));
    if (originalRef.current) originalRef.current.currentTime = clamped;
    if (outputRef.current && syncEnabled) outputRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration, syncEnabled]);

  return {
    originalRef,
    outputRef,
    isPlaying,
    currentTime,
    duration,
    isScrubbing,
    setIsScrubbing,
    playAll,
    pauseAll,
    togglePlayback,
    restartPlayback,
    seek,
    masterVideo,
    origUrl,
    outUrl
  };
};
