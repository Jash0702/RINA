import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="toast show" id="toast" role="status" aria-live="polite">
      {toastMessage}
    </div>
  );
};
