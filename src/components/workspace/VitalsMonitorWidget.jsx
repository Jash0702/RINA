import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../common/Icon';

export const VitalsMonitorWidget = ({ isPlaying, currentTime }) => {
  const { activeCase } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [audioMuted, setAudioMuted] = useState(true);

  // Biological numeric state with dynamic variance
  const [hr, setHr] = useState(74);
  const [spo2, setSpo2] = useState(98);
  const [rr, setRr] = useState(18);
  const [nibpSys, setNibpSys] = useState(120);
  const [nibpDia, setNibpDia] = useState(80);
  const [temp, setTemp] = useState(37.1);
  const [etco2, setEtco2] = useState(38);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const sweepXRef = useRef(0);
  const timeStepRef = useRef(0);

  // Dynamic Case & Playback telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const isAgitated = activeCase.id === 'agitation' && currentTime > 4 && currentTime < 16;
      const isExtubation = activeCase.id === 'extubation' && currentTime > 6;

      const targetHr = isAgitated ? 98 : isExtubation ? 104 : 74;
      const targetRr = isAgitated ? 26 : isExtubation ? 28 : 18;
      const targetSpo2 = isExtubation ? 94 : 98;
      const targetSys = isAgitated ? 138 : 120;
      const targetDia = isAgitated ? 88 : 80;

      setHr(Math.round(targetHr + (Math.random() * 4 - 2)));
      setSpo2(Math.round(targetSpo2 + (Math.random() > 0.85 ? -1 : 0)));
      setRr(Math.round(targetRr + (Math.random() * 2 - 1)));
      setNibpSys(Math.round(targetSys + (Math.random() * 2 - 1)));
      setNibpDia(Math.round(targetDia + (Math.random() * 2 - 1)));
      setTemp(+(37.1 + (isAgitated ? 0.3 : 0) + (Math.random() * 0.1 - 0.05)).toFixed(1));
      setEtco2(Math.round((isExtubation ? 44 : 38) + (Math.random() * 2 - 1)));
    }, 1400);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, activeCase.id]);

  // High-Performance 60FPS CRT/LCD Sweep Oscilloscope Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 140);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 700;
      height = canvas.height = 140;
    };
    window.addEventListener('resize', handleResize);

    // Initial background grid
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, width, height);

    // Waveform baseline heights
    // Channel 1: ECG (height 0 -> 46)
    // Channel 2: SpO2 Pleth (height 47 -> 93)
    // Channel 3: Resp / CO2 (height 94 -> 140)
    const ch1Y = 24;
    const ch2Y = 70;
    const ch3Y = 116;

    const speed = 2.2; // sweep velocity
    const eraseWidth = 24;

    const render = () => {
      let x = sweepXRef.current;
      timeStepRef.current += 0.04;
      const t = timeStepRef.current;

      const isAgitated = activeCase.id === 'agitation' && currentTime > 4 && currentTime < 16;
      const hrSpeed = isAgitated ? 1.35 : 1.0;

      // 1. Erase ahead of the sweep beam with phosphor fade effect
      ctx.fillStyle = '#050a14';
      ctx.fillRect(x, 0, eraseWidth, height);

      // Draw faint medical grid behind in the erased area
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gy = 15; gy < height; gy += 15) {
        ctx.moveTo(x, gy);
        ctx.lineTo(x + eraseWidth, gy);
      }
      ctx.stroke();

      // Draw sweep beam laser head
      ctx.fillStyle = 'rgba(0, 230, 118, 0.35)';
      ctx.fillRect(x + eraseWidth - 2, 0, 2, 46);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.fillRect(x + eraseWidth - 2, 47, 2, 46);
      ctx.fillStyle = 'rgba(255, 214, 0, 0.35)';
      ctx.fillRect(x + eraseWidth - 2, 94, 2, 46);

      // 2. Synthesize Real-Time Mathematical Waveforms
      // A. ECG LEAD II (P-Q-R-S-T Complex)
      const ecgCycle = (t * 3.8 * hrSpeed) % (Math.PI * 2);
      let ecgVal = 0;
      if (ecgCycle > 0.8 && ecgCycle < 1.2) {
        // P-wave
        ecgVal = Math.sin((ecgCycle - 0.8) / 0.4 * Math.PI) * 3.5;
      } else if (ecgCycle >= 1.35 && ecgCycle < 1.45) {
        // Q-drop
        ecgVal = -4;
      } else if (ecgCycle >= 1.45 && ecgCycle < 1.6) {
        // R-spike
        ecgVal = 20;
      } else if (ecgCycle >= 1.6 && ecgCycle < 1.75) {
        // S-drop
        ecgVal = -6;
      } else if (ecgCycle > 2.0 && ecgCycle < 2.8) {
        // T-wave
        ecgVal = Math.sin((ecgCycle - 2.0) / 0.8 * Math.PI) * 6;
      }
      // Micro biological noise
      ecgVal += (Math.random() - 0.5) * 0.8;

      // B. SpO2 PLETHYSMOGRAM (Systolic rise + dicrotic notch rebound)
      const plethCycle = (t * 3.8 * hrSpeed - 0.6) % (Math.PI * 2);
      let plethVal = 0;
      if (plethCycle >= 0 && plethCycle < Math.PI * 1.2) {
        const norm = plethCycle / (Math.PI * 1.2);
        plethVal = Math.sin(norm * Math.PI) * 14;
        if (norm > 0.45 && norm < 0.7) {
          // Dicrotic notch
          plethVal += Math.sin((norm - 0.45) / 0.25 * Math.PI) * 3.2;
        }
      }

      // C. RESPIRATION WAVEFORM (Smooth sinusoidal capnography)
      const respVal = Math.sin(t * 1.1) * 12 + Math.sin(t * 2.2) * 2;

      // 3. Render Next Step Segment
      const nextX = (x + speed) % width;

      // Draw ECG (Green)
      ctx.beginPath();
      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 4;
      ctx.moveTo(x, ch1Y - ecgVal);
      ctx.lineTo(nextX, ch1Y - ecgVal);
      ctx.stroke();

      // Draw SpO2 (Cyan)
      ctx.beginPath();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 4;
      ctx.moveTo(x, ch2Y - plethVal);
      ctx.lineTo(nextX, ch2Y - plethVal);
      ctx.stroke();

      // Draw Resp (Yellow)
      ctx.beginPath();
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#ffd600';
      ctx.shadowBlur = 4;
      ctx.moveTo(x, ch3Y - respVal);
      ctx.lineTo(nextX, ch3Y - respVal);
      ctx.stroke();

      // Reset shadow for performance
      ctx.shadowBlur = 0;

      sweepXRef.current = nextX;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, activeCase.id, currentTime]);

  return (
    <section className="icu-monitor-console" aria-label="ICU Bedside Patient Monitor Console">
      {/* Top Monitor Status Bar */}
      <div className="icu-monitor-topbar">
        <div className="icu-topbar-left">
          <span className="icu-bed-label">BED 03</span>
          <span className="icu-patient-type">ADULT ICU • RM 204</span>
          <span className="icu-rhythm-pill">
            <span className="icu-pulse-dot" />
            NORMAL SINUS RHYTHM
          </span>
        </div>

        <div className="icu-topbar-center">
          <span className="icu-status-text">
            {isPlaying ? '● REALTIME CONTINUOUS TELEMETRY' : '⏸ PAUSED • STANDBY'}
          </span>
          <span className="icu-grid-scale">25mm/s • GAIN 10mm/mV</span>
        </div>

        <div className="icu-topbar-right">
          <button
            type="button"
            className="icu-action-icon-btn"
            onClick={() => setAudioMuted(!audioMuted)}
            title={audioMuted ? 'Unmute QRS beep' : 'Mute QRS beep'}
          >
            <Icon name={audioMuted ? 'volume-x' : 'volume-2'} />
          </button>
          <button
            type="button"
            className="icu-action-icon-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse monitor' : 'Expand monitor'}
            aria-expanded={isExpanded}
          >
            <Icon name={isExpanded ? 'compress' : 'expand'} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="icu-monitor-body">
          {/* Left: Continuous Oscilloscope Waveforms Screen */}
          <div className="icu-oscilloscope-screen">
            <canvas ref={canvasRef} className="icu-wave-canvas" />

            {/* Trace Overlay Watermarks */}
            <div className="icu-trace-watermark trace-ecg">
              <span className="trace-tag">ECG II</span>
              <span className="trace-gain">x1.0</span>
            </div>
            <div className="icu-trace-watermark trace-spo2">
              <span className="trace-tag">PLETH</span>
              <span className="trace-gain">SpO2</span>
            </div>
            <div className="icu-trace-watermark trace-resp">
              <span className="trace-tag">RESP</span>
              <span className="trace-gain">IMP</span>
            </div>
          </div>

          {/* Right: Authentic Clinical Numeric Vitals Blocks */}
          <div className="icu-parameters-column">
            {/* PARAMETER 1: ECG / HR */}
            <div className="icu-param-box param-ecg">
              <div className="param-header">
                <span className="param-title">HR</span>
                <span className="param-sub">BPM</span>
              </div>
              <div className="param-value-wrap">
                <span className="param-main-val">{hr}</span>
                <div className="param-extras">
                  <span className="param-mini">ST: +0.01</span>
                  <span className="param-mini">PVC: 0</span>
                </div>
              </div>
              <div className="param-limits">50 - 120</div>
            </div>

            {/* PARAMETER 2: SpO2 */}
            <div className="icu-param-box param-spo2">
              <div className="param-header">
                <span className="param-title">SpO2</span>
                <span className="param-sub">%</span>
              </div>
              <div className="param-value-wrap">
                <span className="param-main-val">{spo2}</span>
                <div className="param-extras">
                  <span className="param-mini">PI: 4.6%</span>
                  <span className="param-mini">PR: {hr}</span>
                </div>
              </div>
              <div className="param-limits">90 - 100</div>
            </div>

            {/* PARAMETER 3: NIBP Blood Pressure */}
            <div className="icu-param-box param-nibp">
              <div className="param-header">
                <span className="param-title">NIBP</span>
                <span className="param-sub">mmHg</span>
              </div>
              <div className="param-value-wrap">
                <span className="param-main-val nibp-val">
                  {nibpSys}/{nibpDia}
                </span>
                <div className="param-extras">
                  <span className="param-mini">MAP ({Math.round(nibpDia + (nibpSys - nibpDia) / 3)})</span>
                  <span className="param-mini">AUTO 15m</span>
                </div>
              </div>
              <div className="param-limits">90/60 - 140/90</div>
            </div>

            {/* PARAMETER 4: RESP & ETCO2 & TEMP */}
            <div className="icu-param-box param-resp">
              <div className="param-header">
                <span className="param-title">RESP</span>
                <span className="param-sub">/min</span>
              </div>
              <div className="param-value-wrap">
                <span className="param-main-val">{rr}</span>
                <div className="param-extras">
                  <span className="param-mini">EtCO2: {etco2}</span>
                  <span className="param-mini">TEMP: {temp}°C</span>
                </div>
              </div>
              <div className="param-limits">10 - 24</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
