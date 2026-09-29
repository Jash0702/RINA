# Changelog - RINA React Conversion

## [1.0.0] - 2026-09-28

### Converted to React + Vite
- **Modernized Architecture**: Migrated monolithic vanilla HTML/CSS/JS into clean, modular React 18 functional components with hooks and context.
- **State Management**: Implemented `AppContext` managing active use cases, media slots, synchronized looping, presentation mode, presenter notes, and interactive dialogs.
- **Component Decomposition**:
  - `Topbar`: Brand identity, Watermelon HUD readouts (`01/05`, `2/2 MEDIA`, `SYNCED`, `LOCAL DEMO`), live clock, presentation mode toggle, files and help modals.
  - `Sidebar`: Case selection list with icons, numbers, labels, active indicator, and bottom badge.
  - `HeroBanner`: Use case header, progress indicator, live context metrics, view mode switcher (Compare, Stack, Focus P1, Focus P2), narrative visibility toggle.
  - `VideoPlayerGrid` & `VideoCard`: Dual video card players with tags, labels, status pills, drag-and-drop file targets, replace/disconnect buttons, and playback overlays.
  - `TransportControls`: Play/pause, restart, time scrubber, timestamp displays, sync mode toggle, speed selector, fullscreen toggle.
  - `BriefPanel`: Tabbed clinical panel (Overview, Signals & Inference, Clinical Scope, Presenter Cues with jump buttons, Presenter Notes textarea, and Edit Narrative button).
  - `Modals`: `ManageFilesModal`, `EditNarrativeModal`, `CueModal`, `HelpModal`.
- **Theme Support**: Extracted CSS variables into `tokens.css` and `themes.css` with `ThemeContext` enabling light/dark and custom theme extension.
- **Assets & Media**: Copied all 16 demo videos and images to `public/videos/` and `src/assets/`.
- **Launcher**: Added `launch_demo.py` and `Start_Demo.bat` for zero-install offline demonstrations.
