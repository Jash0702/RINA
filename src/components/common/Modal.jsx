import React, { useEffect, useRef } from 'react';

export const Modal = ({ id, isOpen, onClose, title, children, maxWidth = '640px' }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        document.body.classList.add('modal-open');
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.body.classList.remove('modal-open');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      id={id}
      ref={dialogRef}
      className="dialog-shell"
      style={{ maxWidth }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="dialog-content">
        <header className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
};
