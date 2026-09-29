import React from 'react';
import { Topbar } from './components/header/Topbar';
import { Sidebar } from './components/sidebar/Sidebar';
import { Workspace } from './components/workspace/Workspace';
import { Toast } from './components/common/Toast';
import { ManageFilesModal } from './components/dialogs/ManageFilesModal';
import { EditNarrativeModal } from './components/dialogs/EditNarrativeModal';
import { CueModal } from './components/dialogs/CueModal';
import { HelpModal } from './components/dialogs/HelpModal';
import { useApp } from './context/AppContext';
import { useAnimatedFavicon } from './hooks/useAnimatedFavicon';

export const App = () => {
  const { isPresentation } = useApp();

  // Enable live smooth browser tab favicon animation (ECG pulse motion)
  useAnimatedFavicon(60);

  return (
    <div className={`app-shell ${isPresentation ? 'presentation' : ''}`}>
      <Topbar />
      <div className="layout-body">
        <Sidebar />
        <Workspace />
      </div>

      {/* Option 4: Ambient Liquid Glass Light Orbs */}
      <div className="liquid-ambient-bg" aria-hidden="true">
        <div className="ambient-orb orb-cyan" />
        <div className="ambient-orb orb-emerald" />
        <div className="ambient-orb orb-blue" />
        <div className="ambient-orb orb-violet" />
      </div>

      {/* Modals & Dialogs */}
      <ManageFilesModal />
      <EditNarrativeModal />
      <CueModal />
      <HelpModal />

      {/* Floating Toast System */}
      <Toast />
    </div>
  );
};

export default App;
