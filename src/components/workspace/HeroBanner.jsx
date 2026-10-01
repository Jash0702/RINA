import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';

import { AnimatedButton } from '../common/AnimatedButton';

export const HeroBanner = () => {
  const {
    activeCase,
    activeIndex,
    cases,
    viewMode,
    setViewMode,
    briefVisible,
    setBriefVisible,
    syncEnabled,
    configuredMode,
    media
  } = useApp();

  const caseMedia = media[activeCase.id] || {};
  const readyCount = (caseMedia.original?.url ? 1 : 0) + (caseMedia.output?.url ? 1 : 0);

  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const updateSlider = () => {
    const activeEl = tabRefs.current[viewMode];
    if (activeEl && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const left = elRect.left - containerRect.left;
      const width = elRect.width;
      setSliderStyle({
        left,
        width,
        opacity: 1
      });
    }
  };

  useLayoutEffect(() => {
    updateSlider();
  }, [viewMode]);

  useEffect(() => {
    // Initial delay to ensure DOM fonts and layouts are settled
    const timeout = setTimeout(updateSlider, 50);
    window.addEventListener('resize', updateSlider);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateSlider);
    };
  }, [viewMode]);

  return (
    <section className="wm-hero" id="wm-hero" aria-label={`Use case ${activeIndex + 1} of ${cases.length}: ${activeCase.name}`}>
      <div className="wm-hero-top-row">
        <div className="wm-hero-copy">
          <div className="wm-hero-kicker">
            <span className="wm-hero-pill">PROTOCOL {String(activeIndex + 1).padStart(2, '0')} / {String(cases.length).padStart(2, '0')}</span>
            <span className="wm-hero-category">ICU CLINICAL MONITORING</span>
          </div>
          <h2 className="wm-hero-title">{activeCase.name}</h2>
          <p className="wm-hero-subtitle">{activeCase.subtitle}</p>
        </div>

        <div className="wm-workspace-tools">
          <div className="wm-view-tools">
            <span className="wm-tool-label">Layout Mode</span>
            <div className="wm-view-switch-animated" ref={containerRef} role="group" aria-label="Player layout modes">
              {/* Dynamic Sliding Glider Pill */}
              <div
                className="switch-slider-pill"
                style={{
                  transform: `translateX(${sliderStyle.left}px)`,
                  width: `${sliderStyle.width}px`,
                  opacity: sliderStyle.opacity
                }}
                aria-hidden="true"
              />

              <button
                ref={(el) => (tabRefs.current['compare'] = el)}
                type="button"
                className={`switch-tab ${viewMode === 'compare' ? 'active' : ''}`}
                onClick={() => setViewMode('compare')}
                title="Side-by-side comparison"
              >
                <Icon name="compare" />
                <span>Compare</span>
              </button>
              <button
                ref={(el) => (tabRefs.current['stack'] = el)}
                type="button"
                className={`switch-tab ${viewMode === 'stack' ? 'active' : ''}`}
                onClick={() => setViewMode('stack')}
                title="Vertical stacked layout"
              >
                <Icon name="stack" />
                <span>Stack</span>
              </button>
              <button
                ref={(el) => (tabRefs.current['focus1'] = el)}
                type="button"
                className={`switch-tab ${viewMode === 'focus1' ? 'active' : ''}`}
                onClick={() => setViewMode('focus1')}
                title="Focus on slot 1"
              >
                <span>P1 Only</span>
              </button>
              <button
                ref={(el) => (tabRefs.current['focus2'] = el)}
                type="button"
                className={`switch-tab ${viewMode === 'focus2' ? 'active' : ''}`}
                onClick={() => setViewMode('focus2')}
                title="Focus on slot 2"
              >
                <span>P2 Only</span>
              </button>
            </div>
          </div>

          <AnimatedButton
            variant="secondary"
            size="sm"
            id="wm-brief-toggle"
            onClick={() => setBriefVisible(!briefVisible)}
            ariaExpanded={briefVisible}
          >
            <Icon name="notes" />
            <span>{briefVisible ? 'Hide Narrative' : 'Show Narrative'}</span>
          </AnimatedButton>
        </div>
      </div>

      <div className="wm-hero-context-bar" aria-label="Current case status">
        <div className="wm-context-chip">
          <span className={`hud-dot ${readyCount === 2 ? 'ready' : 'partial'}`} />
          <span className="wm-chip-label">RECORDINGS:</span>
          <strong className="wm-chip-value">{readyCount} / 2 CONNECTED</strong>
          <span className="wm-chip-detail">({readyCount === 2 ? 'Paired stream ready' : 'Awaiting files'})</span>
        </div>

        <div className="wm-context-chip">
          <span className={`hud-dot ${syncEnabled ? 'synced' : 'indep'}`} />
          <span className="wm-chip-label">PLAYBACK:</span>
          <strong className="wm-chip-value">{syncEnabled ? 'SYNCHRONIZED LOOP' : 'INDEPENDENT'}</strong>
        </div>

        <div className="wm-context-chip">
          <span className="wm-chip-badge">{activeCase.id}</span>
          <span className="wm-chip-label">SCOPE:</span>
          <strong className="wm-chip-value">{activeCase.navSubtitle}</strong>
        </div>
      </div>
    </section>
  );
};
