import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const HelpModal = () => {
  const { activeDialog, setActiveDialog } = useApp();

  const isOpen = activeDialog === 'help';
  const onClose = () => setActiveDialog(null);

  return (
    <Modal
      id="help-dialog"
      isOpen={isOpen}
      onClose={onClose}
      title="RINA Vision App · Help & Keyboard Shortcuts"
      maxWidth="620px"
    >
      <div className="help-dialog-body">
        <section className="shortcuts-section">
          <h4 className="section-title">Keyboard Navigation</h4>
          <table className="shortcuts-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><kbd>1</kbd> &ndash; <kbd>5</kbd></td>
                <td>Select clinical use case 1 through 5 and auto-start playback</td>
              </tr>
              <tr>
                <td><kbd>Space</kbd></td>
                <td>Toggle play / pause on active recordings</td>
              </tr>
              <tr>
                <td><kbd>&larr;</kbd> / <kbd>&rarr;</kbd></td>
                <td>Seek backward / forward 5 seconds</td>
              </tr>
              <tr>
                <td><kbd>F</kbd></td>
                <td>Toggle presentation mode &amp; fullscreen</td>
              </tr>
              <tr>
                <td><kbd>Esc</kbd></td>
                <td>Dismiss any open dialog modal or exit presentation view</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="playback-notes-section">
          <h4 className="section-title">Playback &amp; Synchronization Guide</h4>
          <ul className="help-bullet-list">
            <li>
              <strong>Sync Mode:</strong> In paired cases (Seatbelt, Pressure Injury, Bed Fall Risk), the two players share a single timeline and automatically loop together at the end of the shorter recording.
            </li>
            <li>
              <strong>Independent Mode:</strong> In dual-patient or rule-alert cases (Hyperactive Delirium, Tube Extubation), recordings loop independently at their native durations.
            </li>
            <li>
              <strong>Manage Files:</strong> Load your local videos folder or individual files at any time via the Files menu.
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  );
};
