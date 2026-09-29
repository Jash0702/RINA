import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const CueModal = () => {
  const {
    activeDialog,
    setActiveDialog,
    cases,
    setCases,
    pendingCueIndex,
    markDirty,
    showToast
  } = useApp();

  const isOpen = activeDialog === 'cue';
  const onClose = () => setActiveDialog(null);

  const [timestamp, setTimestamp] = useState('0.0');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLabel('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const timeNum = Number(timestamp);
    const labelTrimmed = label.trim();

    if (!Number.isFinite(timeNum) || timeNum < 0 || !labelTrimmed) {
      showToast('Enter a valid timestamp and cue description.');
      return;
    }

    const updated = [...cases];
    const targetCues = [...(updated[pendingCueIndex].cues || [])];
    targetCues.push({ time: timeNum, label: labelTrimmed });
    targetCues.sort((a, b) => a.time - b.time);

    updated[pendingCueIndex] = { ...updated[pendingCueIndex], cues: targetCues };
    setCases(updated);
    markDirty();
    onClose();
    showToast('Presenter cue added.');
  };

  return (
    <Modal
      id="cue-dialog"
      isOpen={isOpen}
      onClose={onClose}
      title="Add Presenter Cue"
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} className="dialog-form" id="cue-form">
        <div className="form-group">
          <label htmlFor="cue-time">Timestamp (seconds into recording)</label>
          <input
            id="cue-time"
            type="number"
            step="0.1"
            min="0"
            max="86400"
            className="input-text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cue-text">Cue Description</label>
          <input
            id="cue-text"
            type="text"
            placeholder="e.g. Patient sits up or vital anomaly starts"
            className="input-text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="dialog-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            Add Cue
          </button>
        </div>
      </form>
    </Modal>
  );
};
