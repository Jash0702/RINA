import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const EditNarrativeModal = () => {
  const {
    activeDialog,
    setActiveDialog,
    cases,
    setCases,
    pendingEditIndex,
    markDirty,
    showToast
  } = useApp();

  const isOpen = activeDialog === 'edit';
  const onClose = () => setActiveDialog(null);

  const targetCase = cases[pendingEditIndex] || cases[0];

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    overview: '',
    signals: '',
    output: '',
    scope: '',
    steps: [
      { title: '', text: '' },
      { title: '', text: '' },
      { title: '', text: '' }
    ]
  });

  useEffect(() => {
    if (targetCase && isOpen) {
      setFormData({
        name: targetCase.name || '',
        subtitle: targetCase.subtitle || '',
        overview: targetCase.overview || '',
        signals: Array.isArray(targetCase.signals) ? targetCase.signals.join(', ') : '',
        output: targetCase.output || '',
        scope: targetCase.scope || '',
        steps: targetCase.steps && targetCase.steps.length === 3 ? [
          { ...targetCase.steps[0] },
          { ...targetCase.steps[1] },
          { ...targetCase.steps[2] }
        ] : [
          { title: '', text: '' },
          { title: '', text: '' },
          { title: '', text: '' }
        ]
      });
    }
  }, [targetCase, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subtitle.trim() || !formData.overview.trim()) {
      showToast('Please fill in title, subtitle, and overview.');
      return;
    }

    const updated = [...cases];
    updated[pendingEditIndex] = {
      ...updated[pendingEditIndex],
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim(),
      overview: formData.overview.trim(),
      signals: formData.signals.split(',').map(s => s.trim()).filter(Boolean),
      output: formData.output.trim(),
      scope: formData.scope.trim(),
      steps: formData.steps.map(s => ({
        title: s.title.trim(),
        text: s.text.trim()
      }))
    };

    setCases(updated);
    markDirty();
    onClose();
    showToast('Narrative updated. Export setup JSON to save changes to disk.');
  };

  return (
    <Modal
      id="edit-dialog"
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Narrative · ${targetCase.name}`}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} className="dialog-form" id="edit-form">
        <div className="form-group">
          <label htmlFor="edit-name">Case Title</label>
          <input
            id="edit-name"
            type="text"
            className="input-text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-subtitle">Subtitle / Category</label>
          <input
            id="edit-subtitle"
            type="text"
            className="input-text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-overview">Clinical Overview Summary</label>
          <textarea
            id="edit-overview"
            className="input-textarea"
            rows={4}
            value={formData.overview}
            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-signals">Monitored Signals (comma separated)</label>
          <input
            id="edit-signals"
            type="text"
            className="input-text"
            value={formData.signals}
            onChange={(e) => setFormData({ ...formData, signals: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-output">Expected Inference Annotations</label>
          <textarea
            id="edit-output"
            className="input-textarea"
            rows={2}
            value={formData.output}
            onChange={(e) => setFormData({ ...formData, output: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-scope">Clinical Scope & Boundaries Disclaimer</label>
          <textarea
            id="edit-scope"
            className="input-textarea"
            rows={2}
            value={formData.scope}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Presentation Steps (1 - 3)</label>
          <div className="steps-edit-grid">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="step-edit-card">
                <span className="step-index-tag">Step {idx + 1}</span>
                <input
                  type="text"
                  placeholder="Step Heading"
                  className="input-text sm"
                  value={formData.steps[idx]?.title || ''}
                  onChange={(e) => {
                    const next = [...formData.steps];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setFormData({ ...formData, steps: next });
                  }}
                />
                <textarea
                  placeholder="Step description..."
                  className="input-textarea sm"
                  rows={2}
                  value={formData.steps[idx]?.text || ''}
                  onChange={(e) => {
                    const next = [...formData.steps];
                    next[idx] = { ...next[idx], text: e.target.value };
                    setFormData({ ...formData, steps: next });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="dialog-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            Save Narrative
          </button>
        </div>
      </form>
    </Modal>
  );
};
