import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VIDEO_SOURCES_CONFIG } from '../../config/defaultCases';
import { Icon } from '../common/Icon';

export const VideoCard = ({ slot, videoRef, isPlaying, onTogglePlay }) => {
  const { activeCase, media, setMediaSlot, removeMediaSlot } = useApp();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasError, setHasError] = useState(false);

  const caseCfg = VIDEO_SOURCES_CONFIG.cases[activeCase.id] || {};
  const slotCfg = caseCfg.slots?.[slot] || { label: slot === 'original' ? 'Slot 1' : 'Slot 2', tag: 'STREAM' };

  const currentMedia = media[activeCase.id]?.[slot];
  const videoUrl = currentMedia?.url || '';
  const videoName = currentMedia?.name || 'No video assigned';
  const isConfigured = currentMedia?.source === 'configured';

  useEffect(() => {
    setHasError(false);
  }, [videoUrl, activeCase.id]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setMediaSlot(activeCase.id, slot, file, 'picked', file.name);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaSlot(activeCase.id, slot, file, 'picked', file.name);
    }
  };

  return (
    <article
      className={`video-card ${isDragOver ? 'dragover' : ''}`}
      id={`${slot}-card`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-tag">{slotCfg.tag}</span>
          <h3 className="card-label" id={`${slot}-label`}>{slotCfg.label}</h3>
        </div>
        <div className="card-status-group">
          <span className="source-pill" title={videoName}>
            {videoUrl ? (isConfigured ? 'CONFIGURED' : 'LOCAL FILE') : 'NO MEDIA'}
          </span>
          <button
            type="button"
            className="button ghost icon-only sm"
            onClick={() => fileInputRef.current?.click()}
            title="Replace video file"
            aria-label={`Replace ${slotCfg.label} file`}
          >
            <Icon name="upload" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
      </div>

      <div className="player-wrap">
        {videoUrl ? (
          <video
            ref={videoRef}
            id={`${slot}-video`}
            src={videoUrl}
            playsInline
            muted
            loop
            preload="auto"
            crossOrigin="anonymous"
            onError={() => setHasError(true)}
            onClick={onTogglePlay}
            tabIndex={0}
          />
        ) : (
          <div className="empty-video-placeholder">
            <Icon name="video" />
            <p>No video connected</p>
            <button
              type="button"
              className="button secondary sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Video
            </button>
          </div>
        )}

        {hasError && (
          <div className="video-error-overlay">
            <Icon name="alert" />
            <p>Could not play video</p>
            <button
              type="button"
              className="button ghost sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose alternative file
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
