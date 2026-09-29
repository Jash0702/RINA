import React from 'react';
import { useApp } from '../../context/AppContext';
import { VideoCard } from './VideoCard';

export const VideoPlayerGrid = ({ originalRef, outputRef, isPlaying, onTogglePlay }) => {
  const { viewMode } = useApp();

  return (
    <section className={`video-grid layout-${viewMode}`} id="video-grid" aria-label="Video playback cards">
      {(viewMode !== 'focus2') && (
        <VideoCard
          slot="original"
          videoRef={originalRef}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
        />
      )}

      {(viewMode !== 'focus1') && (
        <VideoCard
          slot="output"
          videoRef={outputRef}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
        />
      )}
    </section>
  );
};
