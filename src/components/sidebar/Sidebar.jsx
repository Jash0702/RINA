import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';

export const Sidebar = () => {
  const { cases, activeIndex, selectCase } = useApp();

  return (
    <aside className="sidebar" aria-label="Use case navigation">
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
  );
};
