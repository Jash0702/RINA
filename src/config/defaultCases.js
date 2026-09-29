// Default clinical demonstration cases
export const DEFAULT_CASES = [
  {
    id: 'agitation',
    icon: 'agitation',
    name: 'Hyperactive Delirium – Patient Agitation',
    navSubtitle: 'Dual positive / negative comparison',
    subtitle: 'Real-Time Restlessness & Agitation Detection',
    overview: 'Detects restlessness, repeated limb movement, attempts to sit up, and unusual agitation patterns using computer vision and behavioral analysis.',
    howItWorks: 'Analyzes video in real-time to identify patient movement patterns and behavioral cues associated with delirium and agitation.',
    signals: ['Agitated movement', 'Restlessness cues', 'Posture shifts', 'Bed-rail interaction'],
    output: 'Agitation detected • Motion trend elevated • Alert status: High • Nurse notification suggested.',
    modelOutputList: [
      { id: '1', type: 'alert', icon: 'alert', label: 'Agitation detected', status: 'critical', highlight: true },
      { id: '2', type: 'trend', icon: 'trend', label: 'Motion trend elevated', status: 'elevated' },
      { id: '3', type: 'status', icon: 'chart', label: 'Alert status: High', value: 'High', status: 'high' },
      { id: '4', type: 'action', icon: 'mail', label: 'Nurse notification suggested', status: 'info' }
    ],
    scope: 'Demonstration only. Visual cues alone do not replace clinical delirium screening tools (CAM-ICU / ICDSC) or bedside nursing evaluation.',
    steps: [
      { title: 'Examine baseline', text: 'Observe the calm baseline behavior in the negative case player.' },
      { title: 'Compare hyperactive cues', text: 'Contrast with motor agitation markers detected in the positive case player.' },
      { title: 'Evaluate latency & stability', text: 'Inspect continuous temporal model stability without false triggers.' }
    ],
    notes: 'Key talking points:\n- Explain the clinical significance of early hyperactive delirium identification.\n- Note that positive and negative cases may have different durations; sync is disabled by default.',
    cues: [
      { time: 2.5, label: 'Early agitation markers emerge' },
      { time: 8.0, label: 'Peak movement burst' }
    ]
  },
  {
    id: 'seatbelt',
    icon: 'belt',
    name: 'Seatbelt Risk Monitoring',
    navSubtitle: 'Safety belt detection & compliance',
    subtitle: 'Continuous Restraint & Belt Adherence Tracking',
    overview: 'Monitors patient restraint and safety belt compliance in real-time to detect unfastened buckles, improper placement, or torso displacement.',
    howItWorks: 'Continuously detects safety belt strap geometry, buckle engagement status, and patient torso orientation using object detection and pose estimation.',
    signals: ['Belt strap detection', 'Buckle engagement', 'Patient torso posture', 'Displacement alert'],
    output: 'Seatbelt unbuckled / displaced • Torso posture displacement • Alert status: High • Bedside reminder triggered.',
    modelOutputList: [
      { id: '1', type: 'alert', icon: 'alert', label: 'Seatbelt unfastened / displaced', status: 'critical', highlight: true },
      { id: '2', type: 'trend', icon: 'trend', label: 'Torso posture displacement detected', status: 'elevated' },
      { id: '3', type: 'status', icon: 'chart', label: 'Alert status: High', value: 'High', status: 'high' },
      { id: '4', type: 'action', icon: 'mail', label: 'Bedside reminder triggered', status: 'info' }
    ],
    scope: 'Non-interfering vision monitoring. Intended as an assistive layer, not a replacement for physical nursing checks.',
    steps: [
      { title: 'Verify belt visibility', text: 'Check detection robustness across varying lighting and blanket coverage.' },
      { title: 'Observe state transition', text: 'Track inference response when belt buckle is released or shifted.' },
      { title: 'Check paired timing', text: 'With sync enabled, both players stay locked across the entire cycle.' }
    ],
    notes: 'Emphasize that synchronized playback is enabled by default to evaluate exact frame-by-frame model responsiveness.',
    cues: [
      { time: 3.0, label: 'Belt detected securely' },
      { time: 7.5, label: 'Patient shifts position' }
    ]
  },
  {
    id: 'pressure',
    icon: 'pressure',
    name: 'Pressure Injury Due to Prolonged Sleep',
    navSubtitle: 'Turn compliance & posture monitoring',
    subtitle: 'Patient Turn Compliance & Position Duration Tracking',
    overview: 'Tracks continuous patient orientation, bed turn adherence, and prolonged immobility to prevent hospital-acquired pressure ulcers.',
    howItWorks: 'Monitors patient posture classification (supine, left/right lateral) and logs timestamped position changes to guide regular turning schedules.',
    signals: ['Left / Right / Supine posture', 'Immobility duration timer', 'Repositioning event detection', 'Pressure relief angle'],
    output: 'Immobility threshold reached (>2h) • Turn overdue on left lateral position • Alert status: Moderate • Repositioning prompt sent.',
    modelOutputList: [
      { id: '1', type: 'alert', icon: 'alert', label: 'Prolonged immobility threshold reached (>2h)', status: 'critical', highlight: true },
      { id: '2', type: 'trend', icon: 'trend', label: 'Lateral turn schedule overdue', status: 'elevated' },
      { id: '3', type: 'status', icon: 'chart', label: 'Alert status: Moderate', value: 'Moderate', status: 'moderate' },
      { id: '4', type: 'action', icon: 'mail', label: 'Repositioning schedule prompt sent', status: 'info' }
    ],
    scope: 'Assists nursing staff with protocol adherence. Does not assess tissue viability or skin condition directly.',
    steps: [
      { title: 'Confirm posture classification', text: 'Review accurate identification of lateral vs supine positions.' },
      { title: 'Validate repositioning detection', text: 'Observe event logging when patient is turned by care team.' },
      { title: 'Review compliance reporting', text: 'Discuss integration with clinical care workflows.' }
    ],
    notes: 'Highlight how automated posture classification reduces documentation burden for nursing staff.',
    cues: [
      { time: 1.5, label: 'Lateral turn initialized' },
      { time: 5.0, label: 'Stable lateral positioning reached' }
    ]
  },
  {
    id: 'fall',
    icon: 'fall',
    name: 'Bed Fall Risk',
    navSubtitle: 'Bed exit & rail egress alerts',
    subtitle: 'Bed-Exit Attempt & Rail Egress Prevention',
    overview: 'Identifies pre-fall egress behaviors including edge proximity, limb extrusion over bed rails, and sudden unassisted sitting transitions.',
    howItWorks: 'Analyzes spatial zone boundaries around the bed perimeter and detects body keypoint trajectory towards unassisted bed exit.',
    signals: ['Edge proximity', 'Limb over rail', 'Sitting up transition', 'High-risk egress zone'],
    output: 'Bed perimeter breach detected • Limb over bed rail egress attempt • Alert status: Critical • Immediate nurse dispatch alert sent.',
    modelOutputList: [
      { id: '1', type: 'alert', icon: 'alert', label: 'Bed perimeter breach detected', status: 'critical', highlight: true },
      { id: '2', type: 'trend', icon: 'trend', label: 'Limb over rail / exit attempt in progress', status: 'elevated' },
      { id: '3', type: 'status', icon: 'chart', label: 'Alert status: Critical', value: 'Critical', status: 'critical' },
      { id: '4', type: 'action', icon: 'mail', label: 'Immediate nurse dispatch alert sent', status: 'info' }
    ],
    scope: 'Provides proactive alert signals. Fall prevention requires immediate physical bedside response.',
    steps: [
      { title: 'Pre-egress posture change', text: 'Detect patient transitioning from lying to sitting up.' },
      { title: 'Perimeter breach detection', text: 'Trigger cautionary overlay as limb crosses virtual bed boundary.' },
      { title: 'High-risk alert confirmation', text: 'Demonstrate escalation before patient leaves bed surface.' }
    ],
    notes: 'Emphasize early predictive alerts compared to conventional pressure-mat alarms.',
    cues: [
      { time: 2.0, label: 'Patient sits upright' },
      { time: 6.0, label: 'Edge proximity alert triggered' }
    ]
  },
  {
    id: 'ventilator',
    icon: 'airway',
    name: 'Ventilator Alerts & Tube Extubation Risk',
    navSubtitle: 'Data alerts & extubation risk',
    subtitle: 'Extubation Risk & Rule-Based Vital Data Alerts',
    overview: 'Detects accidental endotracheal tube (ETT) displacement, hand-to-airway reach attempts, and correlates with ventilator pressure drop alerts.',
    howItWorks: 'Correlates computer vision tracking of hand-to-face vectors with real-time rule-based vital data anomalies (ETCO2, RR spikes, pressure dips).',
    signals: ['Hand-to-tube proximity', 'Visible tube pulling motion', 'ETCo2 & Respiratory rate alerts', 'Airway vector tracking'],
    output: 'Hand-to-tube proximity detected • Elevated self-extubation risk • Alert status: Critical • Emergency airway alert to care team.',
    modelOutputList: [
      { id: '1', type: 'alert', icon: 'alert', label: 'Hand-to-tube proximity detected', status: 'critical', highlight: true },
      { id: '2', type: 'trend', icon: 'trend', label: 'High risk of accidental self-extubation', status: 'elevated' },
      { id: '3', type: 'status', icon: 'chart', label: 'Alert status: Critical', value: 'Critical', status: 'critical' },
      { id: '4', type: 'action', icon: 'mail', label: 'Emergency airway team notification', status: 'info' }
    ],
    scope: 'Demonstration and research visualization. Has no live ventilator connection and must not replace bedside clinical monitors.',
    steps: [
      { title: 'Identify data sources', text: 'Distinguish camera vision annotations from recorded ventilator parameter plots.' },
      { title: 'Replay combined output', text: 'Review temporal alignment of physical hand movement and vital parameter anomalies.' },
      { title: 'Evaluate clinical workflow', text: 'Discuss nurse notification and intervention workflows.' }
    ],
    notes: 'Clarify that this demo demonstrates multi-modal signal fusion: vision cues plus physiological telemetry.',
    cues: [
      { time: 3.5, label: 'Hand touches airway tube' },
      { time: 9.0, label: 'Vital alert triggered' }
    ]
  }
];

export const VIDEO_SOURCES_CONFIG = {
  schema: 'icu-vision-video-sources',
  version: 1,
  root: 'videos',
  cases: {
    agitation: {
      syncDefault: false,
      slots: {
        original: {
          label: 'Positive Case',
          tag: 'POSITIVE CASE',
          path: 'videos/++ve_hyperactive_modeloutput.mp4',
          filename: '++ve_hyperactive_modeloutput.mp4'
        },
        output: {
          label: 'Negative Case',
          tag: 'NEGATIVE CASE',
          path: 'videos/--ve_hyperactive_modeloutput.mp4',
          filename: '--ve_hyperactive_modeloutput.mp4'
        }
      }
    },
    seatbelt: {
      syncDefault: true,
      slots: {
        original: {
          label: 'Input',
          tag: 'SOURCE RECORDING',
          path: 'videos/Seatbelt_Orginal.mp4',
          filename: 'Seatbelt_Orginal.mp4'
        },
        output: {
          label: 'Model Inference Output',
          tag: 'MODEL INFERENCE',
          path: 'videos/Seatbelt_ModelOutput.mp4',
          filename: 'Seatbelt_ModelOutput.mp4'
        }
      }
    },
    pressure: {
      syncDefault: true,
      slots: {
        original: {
          label: 'Input',
          tag: 'SOURCE RECORDING',
          path: 'videos/Pressureinjury_Orginal.mp4',
          filename: 'Pressureinjury_Orginal.mp4'
        },
        output: {
          label: 'Model Inference Output',
          tag: 'MODEL INFERENCE',
          path: 'videos/PressureInjury_ModelOutput.mp4',
          filename: 'PressureInjury_ModelOutput.mp4'
        }
      }
    },
    fall: {
      syncDefault: true,
      slots: {
        original: {
          label: 'Input',
          tag: 'SOURCE RECORDING',
          path: 'videos/BedFall_Orginal.mp4',
          filename: 'BedFall_Orginal.mp4'
        },
        output: {
          label: 'Model Inference Output',
          tag: 'MODEL INFERENCE',
          path: 'videos/BedFallRisk_ModelOutput.mp4',
          filename: 'BedFallRisk_ModelOutput.mp4'
        }
      }
    },
    ventilator: {
      syncDefault: false,
      slots: {
        original: {
          label: 'Model Inference Output',
          tag: 'MODEL INFERENCE',
          path: 'videos/TubeExtubation_ModelOutput.mp4',
          filename: 'TubeExtubation_ModelOutput.mp4'
        },
        output: {
          label: 'Rule Based Vital Data Alerts',
          tag: 'VITAL DATA',
          path: 'videos/ETCo2Vitals.mp4',
          filename: 'ETCo2Vitals.mp4'
        }
      }
    }
  }
};
