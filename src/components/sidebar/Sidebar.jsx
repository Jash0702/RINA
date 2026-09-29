import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';

export const Sidebar = () => {
  const { cases, activeIndex, selectCase, activeCase } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* -------------------------------------------------------------
          1. DESKTOP SIDEBAR (Visible on screens > 900px)
          ------------------------------------------------------------- */}
      <aside className="sidebar desktop-sidebar" aria-label="Use case navigation">
        <div className="wm-sidebar-header">
          <span className="wm-kicker">Clinical Use Cases</span>
          <span className="wm-sidebar-count">5 ACTIVE</span>
        </div>

        <nav className="case-list" role="tablist" aria-orientation="vertical">
          {cases.map((c, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`case-tab-${c.id}`}
                aria-selected={isActive}
                aria-controls={`case-panel-${c.id}`}
                className={`case-item ${isActive ? 'active' : ''}`}
                onClick={() => selectCase(idx)}
              >
                {/* Vengence UI Ambient Inner Glow */}
                <div className="case-ambient-glow" aria-hidden="true" />

                {/* Vengence UI Sweeping Border Shine */}
                <div className="case-border-beam" aria-hidden="true" />

                <div className="case-index-badge">
                  <span>{String(idx + 1).padStart(2, '0')}</span>
                </div>

                <div className="case-icon-box">
                  <Icon name={c.icon} />
                </div>

                <div className="case-info">
                  <div className="case-name-row">
                    <span className="case-name">{c.name}</span>
                    {isActive && (
                      <span className="case-live-pill">
                        <span className="case-live-dot" />
                        <span>LIVE</span>
                      </span>
                    )}
                  </div>
                  <span className="case-desc">{c.navSubtitle}</span>
                </div>

                <div className="case-active-indicator" />
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-footnote">
            <div className="sidebar-brand-pill">
              <Icon name="logo" />
              <span>RINA ICU Intelligence</span>
            </div>
            <div className="sidebar-footer-quote">
              <span className="quote-text">“AI for a Safer, Healthier Tomorrow”</span>
            </div>
          </div>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          2. MOBILE CASE TRIGGER PILL (Visible only on screens <= 900px)
          ------------------------------------------------------------- */}
      <div className="mobile-case-trigger-bar" aria-label="Mobile use case selector">
        <button
          type="button"
          className="mobile-case-trigger-btn"
          onClick={() => setIsDrawerOpen(true)}
          aria-expanded={isDrawerOpen}
          aria-haspopup="dialog"
        >
          <div className="mobile-trigger-left">
            <span className="mobile-trigger-tag">USE CASE 0{activeIndex + 1} / 05</span>
            <div className="mobile-trigger-name-group">
              <div className="mobile-trigger-icon">
                <Icon name={activeCase.icon} />
              </div>
              <span className="mobile-trigger-title">{activeCase.name}</span>
            </div>
          </div>

          <div className="mobile-trigger-right">
            <span className="mobile-trigger-live-chip">
              <span className="mobile-live-dot" />
              <span>LIVE</span>
            </span>
            <div className="mobile-trigger-chevron-box">
              <Icon name="chevron-down" />
            </div>
          </div>
        </button>
      </div>

      {/* -------------------------------------------------------------
          3. OPTION 1: iOS-STYLE MOBILE BOTTOM SHEET DRAWER
          ------------------------------------------------------------- */}
      {isDrawerOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Select clinical use case"
        >
          <div
            className="mobile-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag/Swipe Handle */}
            <div className="mobile-drawer-handle-bar" />

            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-title-group">
                <h3 className="mobile-drawer-title">Clinical Use Cases</h3>
                <span className="mobile-drawer-count">5 ACTIVE PROTOCOLS</span>
              </div>
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close use cases drawer"
              >
                <Icon name="close" />
              </button>
            </div>

            {/* List of Case Cards */}
            <div className="mobile-drawer-list">
              {cases.map((c, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`mobile-drawer-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      selectCase(idx);
                      setIsDrawerOpen(false);
                    }}
                  >
                    <div className="drawer-item-badge">0{idx + 1}</div>

                    <div className="drawer-item-icon">
                      <Icon name={c.icon} />
                    </div>

                    <div className="drawer-item-info">
                      <div className="drawer-item-top">
                        <span className="drawer-item-name">{c.name}</span>
                        {isActive && (
                          <span className="drawer-active-pill">
                            <span className="drawer-live-dot" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </div>
                      <span className="drawer-item-sub">{c.navSubtitle}</span>
                    </div>

                    {isActive && (
                      <div className="drawer-item-check">
                        <Icon name="check" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
