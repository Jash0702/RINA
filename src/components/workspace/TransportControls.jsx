import React from 'react';
import { useApp, fmt } from '../../context/AppContext';
import { Icon } from '../common/Icon';

export const TransportControls = ({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onRestart,
  onSeek,
  setIsScrubbing
}) => {
  const {
    activeIndex,
    activeCase,
    cases,
    selectCase,
    syncEnabled,
    toggleSync,
    speed,
    setSpeed,
    togglePresentation,
    isPresentation
  } = useApp();

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const cues = activeCase?.cues || [];

  const handleTimelineInput = (e) => {
    setIsScrubbing(true);
    const val = Number(e.target.value);
    onSeek(val);
  };

  const handleTimelineChange = (e) => {
    setIsScrubbing(false);
    const val = Number(e.target.value);
    onSeek(val);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="transport" role="region" aria-label="Shared video playback controls">
      <div className="transport-row main-controls">
        <div className="transport-group playback-buttons">
          <button
            type="button"
            className="button ghost icon-only"
            id="previous-case"
            onClick={() => selectCase(activeIndex - 1)}
            aria-label="Previous case"
            title="Previous case (Left Arrow outside scrubber)"
          >
            <Icon name="reset" style={{ transform: 'scaleX(-1)' }} />
          </button>

          <button
            type="button"
            className="button primary play-button"
            id="play-button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title="Play / Pause (Space)"
          >
            <Icon name={isPlaying ? 'pause' : 'play'} />
          </button>

          <button
            type="button"
            className="button ghost icon-only"
            id="reset-button"
            onClick={onRestart}
            aria-label="Restart from beginning"
            title="Restart playback from 00:00"
          >
            <Icon name="reset" />
          </button>

          <button
            type="button"
            className="button ghost icon-only"
            id="next-case"
            onClick={() => selectCase(activeIndex + 1)}
            aria-label="Next case"
            title="Next case"
          >
            <Icon name="play" />
          </button>
        </div>

        <div className="transport-group timeline-group">
          <span className="time-display current" id="current-time">
            {fmt(currentTime)}
          </span>

          <div className="timeline-container">
            <input
              type="range"
              id="timeline"
              className="timeline-slider"
              min="0"
              max={duration || 100}
              step="0.05"
              value={currentTime || 0}
              onInput={handleTimelineInput}
              onChange={handleTimelineChange}
              onBlur={() => setIsScrubbing(false)}
              aria-label="Video position"
              style={{ '--progress': `${progressPercent}%` }}
            />

            {/* Glowing Presenter Cue Markers on Scrubber */}
            {duration > 0 && cues.map((cue, idx) => {
              const cuePos = (cue.time / duration) * 100;
              return (
                <button
                  key={idx}
                  type="button"
                  className="timeline-cue-marker"
                  style={{ left: `${Math.min(Math.max(cuePos, 0), 100)}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(cue.time);
                  }}
                  title={`Jump to Cue: ${cue.label} (${fmt(cue.time)})`}
                  aria-label={`Cue: ${cue.label} at ${fmt(cue.time)}`}
                >
                  <span className="cue-marker-pin" />
                  <span className="cue-marker-tooltip">{cue.label}</span>
                </button>
              );
            })}
          </div>

          <span className="time-display duration" id="duration-time">
            {fmt(duration)}
          </span>
        </div>

        <div className="transport-group secondary-controls">
          <button
            type="button"
            className={`button ${syncEnabled ? 'active' : 'secondary'} sync-btn`}
            id="sync-button"
            onClick={toggleSync}
            aria-pressed={syncEnabled}
            title="Toggle synchronized paired loop"
          >
            <Icon name={syncEnabled ? 'sync' : 'sync-off'} />
            <span>{syncEnabled ? 'SYNC ON' : 'SYNC OFF'}</span>
          </button>

          <div className="speed-wrap">
            <select
              id="speed-select"
              className="speed-selector"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label="Playback speed"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
          </div>

          <button
            type="button"
            className="button ghost icon-only"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            title="Toggle fullscreen view"
          >
            <Icon name="expand" />
          </button>
        </div>
      </div>
    </div>
  );
};
