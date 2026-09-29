import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_CASES, VIDEO_SOURCES_CONFIG } from '../config/defaultCases';

const AppContext = createContext();

export const fmt = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const n = Math.floor(seconds);
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = n % 60;
  return (h ? String(h).padStart(2, '0') + ':' : '') +
    String(m).padStart(2, '0') + ':' +
    String(s).padStart(2, '0');
};

export const basename = (path) => String(path || '').split(/[\\/]/).pop();

export const AppProvider = ({ children }) => {
  // Case State
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem('rina_custom_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return DEFAULT_CASES.map(def => {
          const found = parsed.find(p => p.id === def.id);
          if (found) {
            return {
              ...def,
              notes: found.notes !== undefined ? found.notes : def.notes,
              cues: found.cues || def.cues
            };
          }
          return def;
        });
      } catch (e) { /* ignore */ }
    }
    return JSON.parse(JSON.stringify(DEFAULT_CASES));
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('compare'); // 'compare' | 'stack' | 'focus1' | 'focus2'
  const [briefVisible, setBriefVisible] = useState(true);

  // Sync state per case
  const [syncPreferences, setSyncPreferences] = useState(() => {
    return Object.fromEntries(DEFAULT_CASES.map(c => [
      c.id,
      VIDEO_SOURCES_CONFIG.cases[c.id]?.syncDefault ?? true
    ]));
  });

  const activeCase = cases[activeIndex] || cases[0];
  const syncEnabled = syncPreferences[activeCase.id] ?? true;

  // Media files dictionary { [caseId]: { original: MediaObj, output: MediaObj } }
  const [media, setMedia] = useState(() => {
    return Object.fromEntries(DEFAULT_CASES.map(c => {
      const cfg = VIDEO_SOURCES_CONFIG.cases[c.id] || {};
      const origPath = cfg.slots?.original?.path || '';
      const outPath = cfg.slots?.output?.path || '';
      return [
        c.id,
        {
          original: {
            name: basename(origPath),
            url: `videos/${basename(origPath)}`,
            source: 'configured',
            path: origPath
          },
          output: {
            name: basename(outPath),
            url: `videos/${basename(outPath)}`,
            source: 'configured',
            path: outPath
          }
        }
      ];
    }));
  });

  const [configuredMode, setConfiguredMode] = useState('standalone'); // 'launcher' | 'standalone'
  const [configuredAvailability, setConfiguredAvailability] = useState(new Map());
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const [isPresentation, setIsPresentation] = useState(false);
  const [sessionDirty, setSessionDirty] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Dialogs: 'manage' | 'edit' | 'help' | 'cue' | null
  const [activeDialog, setActiveDialog] = useState(null);
  const [pendingEditIndex, setPendingEditIndex] = useState(0);
  const [pendingCueIndex, setPendingCueIndex] = useState(0);

  // Clock
  const [timeString, setTimeString] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync HUD hero progress
  useEffect(() => {
    const progress = `${((activeIndex + 1) / cases.length) * 100}%`;
    document.documentElement.style.setProperty('--wm-progress', progress);
  }, [activeIndex, cases.length]);

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  }, []);

  const markDirty = useCallback(() => {
    setSessionDirty(true);
  }, []);

  const selectCase = useCallback((idx) => {
    const total = cases.length;
    const nextIdx = ((idx % total) + total) % total;
    setActiveIndex(nextIdx);
  }, [cases.length]);

  const toggleSync = useCallback(() => {
    setSyncPreferences(prev => {
      const current = prev[activeCase.id] ?? true;
      const next = !current;
      showToast(next ? 'Sync enabled for this use case.' : 'Independent playback enabled.');
      return { ...prev, [activeCase.id]: next };
    });
  }, [activeCase.id, showToast]);

  const togglePresentation = useCallback(() => {
    setIsPresentation(prev => {
      const next = !prev;
      if (next) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        document.body.classList.add('presentation');
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        document.body.classList.remove('presentation');
      }
      return next;
    });
  }, []);

  // Setup Export & Import
  const exportSetup = useCallback(() => {
    const exportData = {
      schema: 'icu-vision-setup',
      version: 1,
      cases: cases.map(c => ({
        id: c.id,
        name: c.name,
        subtitle: c.subtitle,
        overview: c.overview,
        signals: c.signals,
        output: c.output,
        scope: c.scope,
        steps: c.steps,
        notes: c.notes,
        cues: c.cues || []
      })),
      fileHints: Object.fromEntries(cases.map(c => [
        c.id,
        {
          original: media[c.id]?.original?.name || '',
          output: media[c.id]?.output?.name || ''
        }
      ]))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rina-setup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Setup exported successfully.');
  }, [cases, media, showToast]);

  const applyImportedSetup = useCallback((data) => {
    if (!data || !Array.isArray(data.cases)) {
      showToast('Invalid setup file format.');
      return;
    }
    const merged = cases.map(existing => {
      const match = data.cases.find(c => c.id === existing.id);
      if (!match) return existing;
      return {
        ...existing,
        name: match.name || existing.name,
        subtitle: match.subtitle || existing.subtitle,
        overview: match.overview || existing.overview,
        signals: match.signals || existing.signals,
        output: match.output || existing.output,
        scope: match.scope || existing.scope,
        steps: match.steps || existing.steps,
        notes: match.notes !== undefined ? match.notes : existing.notes,
        cues: match.cues || []
      };
    });
    setCases(merged);
    localStorage.setItem('rina_custom_cases', JSON.stringify(merged));
    markDirty();
    showToast('Setup imported. Narratives, notes, and cues updated.');
  }, [cases, markDirty, showToast]);

  const resetToStarterSetup = useCallback(() => {
    setCases(JSON.parse(JSON.stringify(DEFAULT_CASES)));
    localStorage.removeItem('rina_custom_cases');
    showToast('Reset to original starter narratives and cues.');
  }, [showToast]);

  const setMediaSlot = useCallback((caseId, slot, fileOrUrl, source = 'picked', path = '') => {
    let url = '';
    let name = '';
    if (typeof fileOrUrl === 'string') {
      url = fileOrUrl;
      name = basename(fileOrUrl);
    } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
      url = URL.createObjectURL(fileOrUrl);
      name = fileOrUrl.name || 'custom_video.mp4';
    }

    setMedia(prev => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        [slot]: { name, url, source, path: path || name }
      }
    }));
    markDirty();
    showToast(`Assigned ${name} to ${slot === 'original' ? 'Slot 1' : 'Slot 2'}.`);
  }, [markDirty, showToast]);

  const removeMediaSlot = useCallback((caseId, slot) => {
    setMedia(prev => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        [slot]: null
      }
    }));
    markDirty();
    showToast(`Disconnected video from ${slot === 'original' ? 'Slot 1' : 'Slot 2'}.`);
  }, [markDirty, showToast]);

  const importFolder = useCallback((files) => {
    if (!files || !files.length) return;
    let matched = 0;
    const fileList = Array.from(files);

    cases.forEach(c => {
      const cfg = VIDEO_SOURCES_CONFIG.cases[c.id];
      if (!cfg) return;

      ['original', 'output'].forEach(slot => {
        const slotPath = cfg.slots[slot]?.path || '';
        const targetFilename = basename(slotPath).toLowerCase();
        const found = fileList.find(f => {
          const name = f.name.toLowerCase();
          return name === targetFilename || f.webkitRelativePath?.toLowerCase().endsWith(targetFilename);
        });

        if (found) {
          setMediaSlot(c.id, slot, found, 'folder', found.webkitRelativePath || found.name);
          matched++;
        }
      });
    });

    if (matched > 0) {
      showToast(`Matched ${matched} demo videos from folder.`);
    } else {
      showToast('No matching demo video filenames found in selected folder.');
    }
  }, [cases, setMediaSlot, showToast]);

  return (
    <AppContext.Provider value={{
      cases,
      setCases,
      activeIndex,
      setActiveIndex,
      selectCase,
      activeCase,
      activeTab,
      setActiveTab,
      viewMode,
      setViewMode,
      briefVisible,
      setBriefVisible,
      syncPreferences,
      setSyncPreferences,
      syncEnabled,
      toggleSync,
      media,
      setMediaSlot,
      removeMediaSlot,
      configuredMode,
      setConfiguredMode,
      configuredAvailability,
      setConfiguredAvailability,
      toastMessage,
      showToast,
      isPresentation,
      togglePresentation,
      sessionDirty,
      markDirty,
      speed,
      setSpeed,
      activeDialog,
      setActiveDialog,
      pendingEditIndex,
      setPendingEditIndex,
      pendingCueIndex,
      setPendingCueIndex,
      timeString,
      exportSetup,
      applyImportedSetup,
      resetToStarterSetup,
      importFolder
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
