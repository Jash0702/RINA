import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';

export const VitalsMonitorWidget = ({ isPlaying, currentTime }) => {
  const { activeCase } = useApp();
  const [hr, setHr] = useState(74);
  const [spo2, setSpo2] = useState(98);
  const [rr, setRr] = useState(18);
  const [isExpanded, setIsExpanded] = useState(true);

  // Subtle realistic biological telemetry fluctuation during playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      // If agitation case and time is near peak movement, elevate heart rate
      const isAgitated = activeCase.id === 'agitation' && currentTime > 5 && currentTime < 15;
      const baseHr = isAgitated ? 96 : 74;
      setHr(Math.round(baseHr + (Math.random() * 4 - 2)));
      setSpo2(Math.round(98 + (Math.random() > 0.8 ? -1 : 0)));
      setRr(Math.round((isAgitated ? 24 : 18) + (Math.random() * 2 - 1)));
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, activeCase.id]);

  return (
    <section className="vitals-widget-card" aria-label="Real-time ICU Bedside Vitals Telemetry">
      <div className="vitals-widget-header">
        <div className="vitals-header-left">
          <div className="vitals-status-indicator">
            <span className={`vitals-live-dot ${isPlaying ? 'active' : ''}`} />
            <span className="vitals-title">ICU BEDSIDE VITALS TELEMETRY</span>
          </div>
          <span className="vitals-location-badge">ICU • BED 03</span>
        </div>

        <div className="vitals-header-right">
          <span className="vitals-latency-chip">
            <Icon name="sync" />
            <span>REALTIME • 12ms</span>
          </span>
          <button
            type="button"
            className="vitals-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse vitals' : 'Expand vitals'}
            aria-expanded={isExpanded}
          >
            <Icon name={isExpanded ? 'compress' : 'expand'} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="vitals-grid-content">
          {/* VITAL 1: ECG / HEART RATE */}
          <div className="vital-channel vital-channel-ecg">
            <div className="vital-meta">
              <div className="vital-label-wrap">
                <span className="vital-lead">ECG LEAD II</span>
                <span className="vital-name">HEART RATE</span>
              </div>
              <div className="vital-value-group">
                <span className="vital-number ecg-num">{hr}</span>
                <span className="vital-unit">BPM</span>
              </div>
            </div>
            <div className="vital-wave-viewport">
              <svg className="vital-wave-svg" viewBox="0 0 240 36" preserveAspectRatio="none">
                <path
                  className={`vital-wave-path ecg-wave-path ${isPlaying ? 'playing' : ''}`}
                  d="M 0 18 L 30 18 L 38 18 L 44 8 L 50 28 L 56 4 L 62 32 L 68 14 L 74 20 L 80 18 L 120 18 L 128 18 L 134 8 L 140 28 L 146 4 L 152 32 L 158 14 L 164 20 L 170 18 L 240 18"
                />
              </svg>
              {isPlaying && <div className="vital-wave-sweep ecg-sweep" />}
            </div>
          </div>

          {/* VITAL 2: SPO2 / PLETH */}
          <div className="vital-channel vital-channel-spo2">
            <div className="vital-meta">
              <div className="vital-label-wrap">
                <span className="vital-lead">PLETH</span>
                <span className="vital-name">SpO2 OXYGEN</span>
              </div>
              <div className="vital-value-group">
                <span className="vital-number spo2-num">{spo2}</span>
                <span className="vital-unit">%</span>
              </div>
            </div>
            <div className="vital-wave-viewport">
              <svg className="vital-wave-svg" viewBox="0 0 240 36" preserveAspectRatio="none">
                <path
                  className={`vital-wave-path spo2-wave-path ${isPlaying ? 'playing' : ''}`}
                  d="M 0 22 C 20 22, 28 6, 36 6 C 44 6, 52 26, 60 22 C 80 22, 88 6, 96 6 C 104 6, 112 26, 120 22 C 140 22, 148 6, 156 6 C 164 6, 172 26, 180 22 C 200 22, 208 6, 216 6 C 224 6, 232 26, 240 22"
                />
              </svg>
              {isPlaying && <div className="vital-wave-sweep spo2-sweep" />}
            </div>
          </div>

          {/* VITAL 3: RESPIRATION RATE */}
          <div className="vital-channel vital-channel-rr">
            <div className="vital-meta">
              <div className="vital-label-wrap">
                <span className="vital-lead">RESP</span>
                <span className="vital-name">RESPIRATION</span>
              </div>
              <div className="vital-value-group">
                <span className="vital-number rr-num">{rr}</span>
                <span className="vital-unit">/min</span>
              </div>
            </div>
            <div className="vital-wave-viewport">
              <svg className="vital-wave-svg" viewBox="0 0 240 36" preserveAspectRatio="none">
                <path
                  className={`vital-wave-path rr-wave-path ${isPlaying ? 'playing' : ''}`}
                  d="M 0 20 Q 30 6, 60 20 T 120 20 T 180 20 T 240 20"
                />
              </svg>
              {isPlaying && <div className="vital-wave-sweep rr-sweep" />}
            </div>
          </div>

          {/* VITAL 4: MOTOR ACTIVITY INDEX */}
          <div className="vital-channel vital-channel-motion">
            <div className="vital-meta">
              <div className="vital-label-wrap">
                <span className="vital-lead">MOTION SENSOR</span>
                <span className="vital-name">MOTOR ACTIVITY</span>
              </div>
              <div className="vital-value-group">
                <span className="vital-number motion-num">
                  {activeCase.id === 'agitation' && currentTime > 5 && currentTime < 15 ? '7.8' : '2.1'}
                </span>
                <span className="vital-unit">/10</span>
              </div>
            </div>
            <div className="vital-meter-wrapper">
              <div
                className={`vital-energy-bar ${activeCase.id === 'agitation' && currentTime > 5 && currentTime < 15 ? 'high' : 'normal'}`}
                style={{
                  width: `${activeCase.id === 'agitation' && currentTime > 5 && currentTime < 15 ? 78 : 22}%`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
