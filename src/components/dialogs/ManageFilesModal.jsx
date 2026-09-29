import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { VIDEO_SOURCES_CONFIG } from '../../config/defaultCases';
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icon';

import { AnimatedButton } from '../common/AnimatedButton';

export const ManageFilesModal = () => {
  const {
    activeDialog,
    setActiveDialog,
    cases,
    media,
    setMediaSlot,
    removeMediaSlot,
    exportSetup,
    applyImportedSetup,
    resetToStarterSetup,
    importFolder,
    showToast
  } = useApp();

  const folderInputRef = useRef(null);
  const setupInputRef = useRef(null);
  const slotInputRefs = useRef({});

  const isOpen = activeDialog === 'manage';
  const onClose = () => setActiveDialog(null);

  const handleFolderChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      importFolder(e.target.files);
    }
  };

  const handleSetupChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Setup file too large. Please select a JSON under 2MB.');
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (window.confirm('Import this setup? It will update narratives, notes, and cues while keeping video selections.')) {
        applyImportedSetup(parsed);
      }
    } catch (err) {
      showToast('Could not import setup: ' + (err.message || 'Invalid JSON.'));
    }
  };

  const handleSlotFileChange = (caseId, slot, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaSlot(caseId, slot, file, 'picked', file.name);
    }
  };

  return (
    <Modal
      id="manage-dialog"
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Demo Files & Recordings"
      maxWidth="780px"
    >
      <div className="manage-dialog-body">
        <p className="dialog-lead">
          Connect local recorded demonstration videos or export/import customized presentation narratives.
        </p>

        <div className="manage-toolbar">
          <AnimatedButton
            variant="primary"
            size="sm"
            id="load-folder-button"
            onClick={() => folderInputRef.current?.click()}
          >
            <Icon name="folder" />
            <span>Load Video Folder</span>
          </AnimatedButton>
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            style={{ display: 'none' }}
            onChange={handleFolderChange}
          />

          <AnimatedButton
            variant="secondary"
            size="sm"
            id="export-button"
            onClick={exportSetup}
          >
            <Icon name="download" />
            <span>Export Setup JSON</span>
          </AnimatedButton>

          <AnimatedButton
            variant="secondary"
            size="sm"
            id="import-button"
            onClick={() => setupInputRef.current?.click()}
          >
            <Icon name="upload" />
            <span>Import Setup</span>
          </AnimatedButton>
          <input
            ref={setupInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleSetupChange}
          />

          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all five use cases to original starter narratives and talking points?')) {
                resetToStarterSetup();
              }
            }}
          >
            <Icon name="reset" />
            <span>Reset Narratives</span>
          </AnimatedButton>
        </div>

        <div className="manage-slots-section">
          <h4 className="section-title">Configured Video Slots (10 Total)</h4>
          <div className="manage-slots-list">
            {cases.map((c) => {
              const caseMedia = media[c.id] || {};
              const caseCfg = VIDEO_SOURCES_CONFIG.cases[c.id] || {};

              return (
                <div key={c.id} className="manage-case-block">
                  <div className="manage-case-title-row">
                    <Icon name={c.icon} />
                    <strong>{c.name}</strong>
                  </div>

                  <div className="manage-slots-pair">
                    {['original', 'output'].map((slot) => {
                      const slotCfg = caseCfg.slots?.[slot] || {};
                      const item = caseMedia[slot];
                      const slotKey = `${c.id}-${slot}`;

                      return (
                        <div key={slot} className="manage-slot-row">
                          <div className="manage-slot-info">
                            <span className="manage-slot-label">{slotCfg.label || slot}</span>
                            <span className="manage-slot-filename" title={item?.path || item?.name}>
                              {item?.name || 'No video assigned'}
                            </span>
                            <span className={`status-pill ${item?.url ? 'connected' : 'disconnected'}`}>
                              {item?.source === 'configured' ? 'DEFAULT' : (item?.url ? 'CUSTOM' : 'EMPTY')}
                            </span>
                          </div>

                          <div className="manage-slot-actions">
                            <button
                              type="button"
                              className="button ghost sm"
                              onClick={() => slotInputRefs.current[slotKey]?.click()}
                            >
                              Choose File
                            </button>
                            <input
                              ref={(el) => (slotInputRefs.current[slotKey] = el)}
                              type="file"
                              accept="video/mp4,video/webm,video/ogg"
                              style={{ display: 'none' }}
                              onChange={(e) => handleSlotFileChange(c.id, slot, e)}
                            />

                            {item?.url && (
                              <button
                                type="button"
                                className="button ghost icon-only sm"
                                onClick={() => removeMediaSlot(c.id, slot)}
                                title="Disconnect video"
                                aria-label="Disconnect video"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
