# RINA Vision App (React + Vite)

A modern, high-performance React conversion of the **RINA Vision App** ICU Clinical Vision Demonstration platform built with **Vite**, **React 18**, and **Vanilla CSS tokens**.

---

## 🚀 Key Features Preserved & Enhanced

- **Identical Visual & Interactive Experience**: 100% fidelity to the original Liquid Glass dark design system, typography, colors, borders, and animations.
- **5 Clinical Use Cases**:
  1. Hyperactive Delirium (Dual Positive / Negative Case comparison)
  2. Risk Seatbelt Monitoring (Input vs Model Inference Output)
  3. Pressure Injury Risk (Input vs Model Inference Output)
  4. Bed Fall Risk (Input vs Model Inference Output)
  5. Tube Extubation (Model Inference Output vs Rule Based Vital Data Alerts)
- **Synchronized & Independent Video Looping**: Dual-player synchronizer with automatic boundary alignment, rate adjustment, and loop synchronization.
- **Presenter Cues & Notes**: Bookmark key video moments, add timestamped presentation cues, and edit presenter notes.
- **Narrative Editor**: In-app modal to customize clinical summaries, signals, model outputs, and presentation steps.
- **Setup Export & Import**: Save custom setups to JSON and restore them anytime.
- **Extensible Theming Architecture**: CSS variable tokens configured for Dark (default), Light, and Custom Color schemes with zero friction.
- **Comprehensive Keyboard Shortcuts**:
  - `1 - 5`: Switch between use cases
  - `Space`: Master play/pause
  - `Left / Right`: Seek backward / forward 5s
  - `F`: Toggle presentation mode
  - `Esc`: Close modals / exit presentation view

---

## 📂 Project Structure

```text
RINA_React/
├── public/                     # Static media, videos, icons, and starter setups
│   ├── videos/                 # 16 recorded MP4 / WebM clinical demonstration videos
│   ├── starter-setup.json      # Default setup configuration
│   └── rina_logo.svg           # Brand vector logo
├── src/
│   ├── assets/                 # SVGs and images
│   ├── config/
│   │   ├── defaultCases.js     # Default clinical case definitions & metadata
│   │   └── videoSources.js     # Video slot mappings & defaults
│   ├── context/
│   │   ├── AppContext.jsx      # Global state (cases, activeIndex, media, sync, dialogs)
│   │   └── ThemeContext.jsx    # Theme state (light / dark / custom themes)
│   ├── hooks/
│   │   ├── useVideoPlayback.js # Dual-video sync, master/slave sync, timeline scrubbing
│   │   └── useKeyboardShortcuts.js # Global keyboard shortcut listener
│   ├── components/
│   │   ├── common/             # Icon, Toast, Modal
│   │   ├── header/             # Topbar, Watermelon HUD, Clock
│   │   ├── sidebar/            # Sidebar navigation with 5 case buttons
│   │   ├── workspace/          # HeroBanner, VideoPlayerGrid, VideoCard, TransportControls, BriefPanel
│   │   └── dialogs/            # ManageFilesModal, EditNarrativeModal, CueModal, HelpModal
│   ├── styles/
│   │   ├── tokens.css          # CSS Variables (Liquid Glass design tokens)
│   │   ├── main.css            # Complete styling
│   │   └── themes.css          # Theme hooks
│   ├── App.jsx                 # Main application layout
│   └── main.jsx                # React entrypoint
├── index.html                  # Root HTML template with SVG symbols
├── vite.config.js              # Vite configuration
├── package.json                # Project dependencies
├── launch_demo.py              # Zero-dependency Python localhost streaming launcher
└── Start_Demo.bat              # 1-click Windows launcher
```

---

## 🛠️ How to Run

### Option 1: Vite Dev Server (Standard React Workflow)
```powershell
# From the RINA_React folder:
pnpm dev
# Or with npm:
npm run dev
```

### Option 2: Build Production Bundle & Preview
```powershell
pnpm build
pnpm preview
```

### Option 3: Double-Click `Start_Demo.bat` or Python Launcher
```powershell
python launch_demo.py
```
