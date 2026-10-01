import React from 'react';
import { useApp, fmt } from '../../context/AppContext';
import { Icon } from '../common/Icon';

import { AnimatedButton } from '../common/AnimatedButton';

export const BriefPanel = ({ onSeek }) => {
  const {
    activeCase,
    activeTab,
    setActiveTab,
    briefVisible,
    setActiveDialog,
    setPendingEditIndex,
    setPendingCueIndex,
    activeIndex,
    cases,
    setCases,
    markDirty,
    showToast
  } = useApp();

  if (!briefVisible) return null;

  const handleNotesChange = (e) => {
    const val = e.target.value.slice(0, 12000);
    const updated = [...cases];
    updated[activeIndex] = { ...updated[activeIndex], notes: val };
    setCases(updated);
    markDirty();
  };

  const handleOpenEdit = () => {
    setPendingEditIndex(activeIndex);
    setActiveDialog('edit');
  };

  const handleOpenAddCue = () => {
    setPendingCueIndex(activeIndex);
    setActiveDialog('cue');
  };

  const handleDeleteCue = (cueIdx) => {
    const updated = [...cases];
    const targetCues = [...(updated[activeIndex].cues || [])];
    targetCues.splice(cueIdx, 1);
    updated[activeIndex] = { ...updated[activeIndex], cues: targetCues };
    setCases(updated);
    markDirty();
    showToast('Presenter cue removed.');
  };

  return (
    <section className="brief" id="brief-panel" aria-label="Narrative and clinical details">
      <div className="brief-header">
        <nav className="brief-tabs" role="tablist" aria-label="Narrative details">
          <button
            type="button"
            role="tab"
            className={`brief-tab ${activeTab === 'overview' ? 'active' : ''}`}
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            <Icon name="logo" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            role="tab"
            className={`brief-tab ${activeTab === 'signals' ? 'active' : ''}`}
            aria-selected={activeTab === 'signals'}
            onClick={() => setActiveTab('signals')}
          >
            <Icon name="video" />
            <span>Signals & Telemetry</span>
          </button>

          <button
            type="button"
            role="tab"
            className={`brief-tab ${activeTab === 'scope' ? 'active' : ''}`}
            aria-selected={activeTab === 'scope'}
            onClick={() => setActiveTab('scope')}
          >
            <Icon name="alert" />
            <span>Clinical Scope</span>
          </button>

          <button
            type="button"
            role="tab"
            className={`brief-tab ${activeTab === 'cues' ? 'active' : ''}`}
            aria-selected={activeTab === 'cues'}
            onClick={() => setActiveTab('cues')}
          >
            <Icon name="cue" />
            <span>Cues ({activeCase.cues?.length || 0})</span>
          </button>

          <button
            type="button"
            role="tab"
            className={`brief-tab ${activeTab === 'notes' ? 'active' : ''}`}
            aria-selected={activeTab === 'notes'}
            onClick={() => setActiveTab('notes')}
          >
            <Icon name="notes" />
            <span>Presenter Notes</span>
          </button>
        </nav>

        <div className="brief-actions">
          <AnimatedButton
            variant="secondary"
            size="sm"
            id="edit-brief-button"
            onClick={handleOpenEdit}
            title="Edit narrative, signals, and talking points"
          >
            <Icon name="edit" />
            <span>Edit Narrative</span>
          </AnimatedButton>
        </div>
      </div>

      <div className="brief-body">
        {activeTab === 'overview' && (
          <div className="brief-tab-panel overview-panel" role="tabpanel">
            {/* Intelligence Details Triple-Grid (From Reference UI) */}
            <div className="intelligence-grid">
              
              {/* BLOCK 1: USE CASE OVERVIEW */}
              <div className="info-card overview-card">
                <div className="info-card-header">
                  <div className="info-card-title-group">
                    <span className="info-card-icon overview-icon">
                      <Icon name="info" />
                    </span>
                    <h3>Use Case Overview</h3>
                  </div>
                  <span className="card-live-chip">LIVE PROTOCOL</span>
                </div>
                <h4 className="usecase-highlight-title" id="overview-title">
                  {activeCase.name}
                </h4>
                <p className="usecase-description" id="overview-desc">
                  {activeCase.overview}
                </p>
              </div>

              {/* BLOCK 2: MODEL OUTPUT */}
              <div className="info-card output-card">
                <div className="info-card-header">
                  <div className="info-card-title-group">
                    <span className="info-card-icon gear-icon">
                      <Icon name="gear" />
                    </span>
                    <h3>Model Output</h3>
                  </div>
                  <span className="model-arch-badge">YOLOv11-ICU • REALTIME</span>
                </div>

                <div className="output-details-box" id="output-details-box">
                  {activeCase.modelOutputList?.map((item, idx) => (
                    <div key={item.id || idx} className={`output-item item-type-${item.type}`}>
                      <span className={`output-icon-badge badge-${item.type}`}>
                        <Icon name={item.icon || (item.type === 'alert' ? 'bell' : item.type === 'trend' ? 'trend' : item.type === 'status' ? 'chart' : 'mail')} />
                      </span>
                      <span className={`output-text ${item.highlight ? 'alert-text' : ''}`}>
                        {item.type === 'status' ? (
                          <>
                            Alert status: <strong className={`status-highlight status-${item.status || 'high'}`}>{item.value || 'High'}</strong>
                          </>
                        ) : (
                          item.label
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BLOCK 3: HOW IT WORKS */}
              <div className="info-card how-card">
                <div className="info-card-header">
                  <div className="info-card-title-group">
                    <span className="info-card-icon bulb-icon">
                      <Icon name="bulb" />
                    </span>
                    <h3>How It Works</h3>
                  </div>
                  <span className="how-badge">DETECTION METHODOLOGY</span>
                </div>
                <p className="usecase-description" id="how-desc">
                  {activeCase.howItWorks}
                </p>
                <div className="model-signals-preview">
                  {activeCase.signals?.map((sig, idx) => (
                    <span key={idx} className="model-signal-pill">
                      <Icon name="check" />
                      <span>{sig}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>
            
            {/* Clinical Presentation Sequence */}
            <div className="presentation-steps">
              <div className="steps-header-row">
                <h4 className="steps-title">Clinical Presentation Sequence</h4>
                <span className="steps-badge">3-PHASE PROTOCOL</span>
              </div>
              
              <div className="steps-grid bento-steps-grid">
                {activeCase.steps?.map((step, idx) => (
                  <div key={idx} className="bento-step-card">
                    <div className="bento-step-glow" />
                    <div className="bento-step-top">
                      <span className="bento-step-num">STEP 0{idx + 1}</span>
                      <span className="bento-phase-tag">{idx === 0 ? 'IDENTIFY' : idx === 1 ? 'ANALYZE' : 'INTERVENE'}</span>
                    </div>
                    <div className="bento-step-content">
                      <strong className="bento-step-heading">{step.title}</strong>
                      <p className="bento-step-text">{step.text}</p>
                    </div>
                    <div className="bento-step-footer">
                      <span className="bento-footer-dot" />
                      <span className="bento-footer-label">Clinical Phase Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="brief-tab-panel signals-panel" role="tabpanel">
            <div className="signals-section">
              <div className="section-title-row">
                <h4 className="section-title">Monitored Clinical Signals & Telemetry</h4>
                <span className="signals-active-count">{activeCase.signals?.length || 0} ACTIVE TRACKERS</span>
              </div>
              <div className="signals-chips bento-signals-grid">
                {activeCase.signals?.map((sig, idx) => (
                  <div key={idx} className="signal-chip-bento">
                    <div className="signal-chip-top">
                      <span className="signal-status-dot" />
                      <span className="signal-chip-title">{sig}</span>
                    </div>
                    <div className="signal-meter-wrap">
                      <div className="signal-meter-bar" style={{ width: `${88 + (idx * 3) % 11}%` }} />
                    </div>
                    <div className="signal-chip-foot">
                      <span className="signal-conf">Confidence: {(97.4 + (idx * 0.7) % 2.5).toFixed(1)}%</span>
                      <span className="signal-fps">60 FPS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="output-section">
              <h4 className="section-title">Expected Inference Annotations & Bounding Logic</h4>
              <div className="output-box bento-output-box">
                <div className="output-accent-glow" />
                <div className="output-box-header">
                  <span className="output-model-badge">YOLOv11-ICU • RESNET-3D</span>
                  <span className="output-sync-badge">LOW LATENCY</span>
                </div>
                <p className="output-content-text">{activeCase.output}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scope' && (
          <div className="brief-tab-panel scope-panel" role="tabpanel">
            <div className="scope-alert-card">
              <div className="scope-icon-wrap">
                <Icon name="alert" />
              </div>
              <div className="scope-text">
                <h4 className="scope-heading">Clinical Scope & Operational Boundaries</h4>
                <p className="scope-body">{activeCase.scope}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cues' && (
          <div className="brief-tab-panel cues-panel" role="tabpanel">
            <div className="cues-header">
              <span className="cues-title">Timestamped Presenter Cues</span>
              <AnimatedButton
                variant="secondary"
                size="sm"
                id="add-cue-button"
                onClick={handleOpenAddCue}
              >
                <Icon name="cue" />
                <span>Add Cue</span>
              </AnimatedButton>
            </div>

            <div className="cues-list">
              {(!activeCase.cues || activeCase.cues.length === 0) ? (
                <p className="empty-cues-text">No presenter cues added yet. Click &quot;Add Cue&quot; to bookmark a key moment.</p>
              ) : (
                activeCase.cues.map((cue, idx) => (
                  <div key={idx} className="cue-item">
                    <button
                      type="button"
                      className="cue-jump-btn"
                      onClick={() => onSeek(cue.time)}
                      title={`Jump to ${fmt(cue.time)}`}
                    >
                      <span className="cue-timestamp">{fmt(cue.time)}</span>
                      <span className="cue-label">{cue.label}</span>
                    </button>
                    <button
                      type="button"
                      className="button ghost icon-only sm cue-delete-btn"
                      onClick={() => handleDeleteCue(idx)}
                      title="Delete cue"
                      aria-label={`Delete cue at ${fmt(cue.time)}`}
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="brief-tab-panel notes-panel" role="tabpanel">
            <label htmlFor="presenter-notes" className="notes-label">
              Presenter Talking Points (Session Notes)
            </label>
            <textarea
              id="presenter-notes"
              className="notes-textarea"
              rows={5}
              value={activeCase.notes || ''}
              onChange={handleNotesChange}
              placeholder="Enter presentation notes, clinical talking points, and reminders for this use case..."
            />
          </div>
        )}
      </div>
    </section>
  );
};
