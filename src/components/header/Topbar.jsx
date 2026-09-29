import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../common/Icon';
import rtwoLogo from '../../assets/rtwo-logo.svg';

import { AnimatedButton } from '../common/AnimatedButton';

export const Topbar = () => {
  const {
    activeIndex,
    cases,
    syncEnabled,
    configuredMode,
    timeString,
    togglePresentation,
    isPresentation,
    setActiveDialog,
    media,
    activeCase
  } = useApp();

  const { theme, toggleTheme } = useTheme();

  const caseMedia = media[activeCase.id] || {};
  const readyCount = (caseMedia.original?.url ? 1 : 0) + (caseMedia.output?.url ? 1 : 0);

  return (
    <header className="topbar" role="banner">
      <div className="brand">
        <div className="brand-logo-wrap" title="Rtwo Healthcare Solutions">
          <img src={rtwoLogo} alt="Rtwo Healthcare Solutions" className="brand-logo rtwo-logo-img" height="38" />
          <div className="brand-pulse-glow" />
        </div>
        <div className="header-divider" />
        <div className="brand-copy">
          <div className="brand-title-wrap">
            <h1 className="brand-title">RINA</h1>
            <span className="brand-badge">NURSING ASSISTANT</span>
          </div>
          <p className="brand-subtitle">Real-Time Intelligent Nursing Assistant</p>
        </div>
      </div>

      <div className="wm-hud rina-identity">
        <div className="wm-hud-item ecg-hud-item">
          <div className="ecg-waveform-wrap">
            <svg className="ecg-svg" viewBox="0 0 120 24" aria-hidden="true">
              <path
                className="ecg-path"
                d="M 0 12 L 15 12 L 22 12 L 28 3 L 34 21 L 40 8 L 46 16 L 52 12 L 68 12 L 74 12 L 80 3 L 86 21 L 92 8 L 98 16 L 104 12 L 120 12"
              />
            </svg>
            <div className="ecg-sweep-line" />
          </div>
          <span className="ecg-rate">74 <small>BPM</small></span>
        </div>

        <div className="wm-hud-item">
          <span className="wm-hud-label">CASE</span>
          <span className="wm-hud-value" id="wm-case-readout">
            <span className="hud-val-accent">{String(activeIndex + 1).padStart(2, '0')}</span> / {String(cases.length).padStart(2, '0')}
          </span>
        </div>
        <div className="wm-hud-item">
          <span className="wm-hud-label">MEDIA</span>
          <span className="wm-hud-value" id="wm-media-readout">
            <span className={`hud-dot ${readyCount === 2 ? 'ready' : 'partial'}`} />
            {readyCount} / 2
          </span>
        </div>
        <div className="wm-hud-item">
          <span className="wm-hud-label">SYNC</span>
          <span className="wm-hud-value" id="wm-sync-readout">
            <span className={`hud-dot ${syncEnabled ? 'synced' : 'indep'}`} />
            {syncEnabled ? 'SYNCED' : 'INDEPENDENT'}
          </span>
        </div>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        <div className="topbar-clock-wrap">
          <span className="clock-pulse-dot" />
          <span className="topbar-clock" id="clock" aria-label="Current time">
            {timeString}
          </span>
        </div>

        <AnimatedButton
          variant="secondary"
          size="md"
          id="present-button"
          onClick={togglePresentation}
          ariaPressed={isPresentation}
          title="Toggle presentation view (F)"
        >
          <Icon name={isPresentation ? 'compress' : 'expand'} />
          <span>{isPresentation ? 'Exit' : 'Present'}</span>
          <kbd className="key-hint">F</kbd>
        </AnimatedButton>

        <AnimatedButton
          variant="secondary"
          size="md"
          id="manage-mobile-button"
          onClick={() => setActiveDialog('manage')}
          title="Manage media files & recordings"
        >
          <Icon name="folder" />
          <span>Files</span>
        </AnimatedButton>

        <button
          type="button"
          className="button ghost icon-only"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>

        <button
          type="button"
          className="button ghost icon-only"
          id="help-button"
          onClick={() => setActiveDialog('help')}
          aria-label="Help & Keyboard Shortcuts"
          title="Help & Shortcuts (?)"
        >
          <Icon name="help" />
        </button>
      </div>
    </header>
  );
};
