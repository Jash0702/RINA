import React from 'react';
import { HeroBanner } from './HeroBanner';
import { VideoPlayerGrid } from './VideoPlayerGrid';
import { VitalsMonitorWidget } from './VitalsMonitorWidget';
import { TransportControls } from './TransportControls';
import { BriefPanel } from './BriefPanel';
import { useVideoPlayback } from '../../hooks/useVideoPlayback';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const Workspace = () => {
  const {
    originalRef,
    outputRef,
    isPlaying,
    currentTime,
    duration,
    togglePlayback,
    restartPlayback,
    seek,
    setIsScrubbing
  } = useVideoPlayback();

  // Register global shortcuts
  useKeyboardShortcuts({
    togglePlayback,
    seek,
    currentTime
  });

  return (
    <main className="workspace" role="main">
      <HeroBanner />

      <VideoPlayerGrid
        originalRef={originalRef}
        outputRef={outputRef}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayback}
      />

      <VitalsMonitorWidget
        isPlaying={isPlaying}
        currentTime={currentTime}
      />

      <TransportControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={togglePlayback}
        onRestart={restartPlayback}
        onSeek={seek}
        setIsScrubbing={setIsScrubbing}
      />

      <BriefPanel onSeek={seek} />
    </main>
  );
};
