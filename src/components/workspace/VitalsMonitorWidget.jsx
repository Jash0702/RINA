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
  const stateRef = useRef({
    isPlaying,
    currentTime,
    caseId: activeCase.id
  });

  // Keep stateRef up to date without triggering canvas re-renders
  useEffect(() => {
    stateRef.current = {
      isPlaying,
      currentTime,
      caseId: activeCase.id
    };
  }, [isPlaying, currentTime, activeCase.id]);

  // Periodic subtle realistic physiological telemetry drift
  useEffect(() => {
    const interval = setInterval(() => {
      const { caseId, currentTime: currTime } = stateRef.current;
      const isAgitated = caseId === 'agitation' && currTime > 4 && currTime < 16;
      const isExtubation = caseId === 'extubation' && currTime > 6;

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
  }, []);

  // Continuous Full-Buffer Oscilloscope Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 140);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const newWidth = canvas.parentElement.clientWidth || 800;
      if (newWidth !== width) {
        width = canvas.width = newWidth;
        height = canvas.height = 140;
        initBuffers(width);
      }
    };
    window.addEventListener('resize', handleResize);

    // Baseline horizontal track offsets
    const ch1Y = 24;  // ECG Lead II
    const ch2Y = 70;  // SpO2 Pleth
    const ch3Y = 116; // Resp / CO2

    // Circular data buffers for continuous sweep plotting
    let ecgBuffer = new Float32Array(width);
    let spo2Buffer = new Float32Array(width);
    let respBuffer = new Float32Array(width);

    const initBuffers = (w) => {
      ecgBuffer = new Float32Array(w);
      spo2Buffer = new Float32Array(w);
      respBuffer = new Float32Array(w);

      // Pre-fill with baseline values so monitor is active on initial load
      for (let i = 0; i < w; i++) {
        const t = i * 0.04;
        const ecgCycle = (t * 3.6) % (Math.PI * 2);
        let e = 0;
        if (ecgCycle > 0.8 && ecgCycle < 1.2) e = Math.sin((ecgCycle - 0.8) / 0.4 * Math.PI) * 3.5;
        else if (ecgCycle >= 1.35 && ecgCycle < 1.45) e = -4;
        else if (ecgCycle >= 1.45 && ecgCycle < 1.6) e = 20;
        else if (ecgCycle >= 1.6 && ecgCycle < 1.75) e = -6;
        else if (ecgCycle > 2.0 && ecgCycle < 2.8) e = Math.sin((ecgCycle - 2.0) / 0.8 * Math.PI) * 6;
        ecgBuffer[i] = e;

        const plethCycle = (t * 3.6 - 0.6) % (Math.PI * 2);
        let p = 0;
        if (plethCycle >= 0 && plethCycle < Math.PI * 1.2) {
          const norm = plethCycle / (Math.PI * 1.2);
          p = Math.sin(norm * Math.PI) * 13;
          if (norm > 0.45 && norm < 0.7) p += Math.sin((norm - 0.45) / 0.25 * Math.PI) * 3.2;
        }
        spo2Buffer[i] = p;

        respBuffer[i] = Math.sin(t * 1.1) * 11 + Math.sin(t * 2.2) * 2;
      }
    };

    initBuffers(width);

    let sweepHead = 0;
    let timeStep = 0;
    const sweepGap = 24; // Width of the erase gap ahead of the sweep beam

    const render = () => {
      const { caseId, currentTime: currTime } = stateRef.current;
      const isAgitated = caseId === 'agitation' && currTime > 4 && currTime < 16;
      const hrMultiplier = isAgitated ? 1.35 : 1.0;

      // Advance 2-3 points per animation frame for smooth, realistic clinical sweep speed
      const pointsPerFrame = 2;

      for (let p = 0; p < pointsPerFrame; p++) {
        timeStep += 0.035 * hrMultiplier;
        const t = timeStep;

        // 1. ECG Lead II (P-Q-R-S-T)
        const ecgCycle = (t * 3.8) % (Math.PI * 2);
        let ecgVal = 0;
        if (ecgCycle > 0.8 && ecgCycle < 1.2) {
          ecgVal = Math.sin((ecgCycle - 0.8) / 0.4 * Math.PI) * 3.5;
        } else if (ecgCycle >= 1.35 && ecgCycle < 1.45) {
          ecgVal = -4.5;
        } else if (ecgCycle >= 1.45 && ecgCycle < 1.6) {
          ecgVal = 21;
        } else if (ecgCycle >= 1.6 && ecgCycle < 1.75) {
          ecgVal = -6.5;
        } else if (ecgCycle > 2.0 && ecgCycle < 2.8) {
          ecgVal = Math.sin((ecgCycle - 2.0) / 0.8 * Math.PI) * 6.5;
        }
        ecgVal += (Math.random() - 0.5) * 0.7; // subtle biological micro-noise

        // 2. SpO2 Pleth
        const plethCycle = (t * 3.8 - 0.6) % (Math.PI * 2);
        let plethVal = 0;
        if (plethCycle >= 0 && plethCycle < Math.PI * 1.2) {
          const norm = plethCycle / (Math.PI * 1.2);
          plethVal = Math.sin(norm * Math.PI) * 14;
          if (norm > 0.45 && norm < 0.7) {
            plethVal += Math.sin((norm - 0.45) / 0.25 * Math.PI) * 3.2;
          }
        }

        // 3. Respiration Wave
        const respVal = Math.sin(t * 1.1) * 12 + Math.sin(t * 2.2) * 2;

        const writePos = (sweepHead + p) % width;
        ecgBuffer[writePos] = ecgVal;
        spo2Buffer[writePos] = plethVal;
        respBuffer[writePos] = respVal;
      }

      sweepHead = (sweepHead + pointsPerFrame) % width;

      // Clear Canvas and Redraw All Traces with High Contrast
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, width, height);

      // Draw Medical Dot-Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 14; y < height; y += 14) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      for (let x = 14; x < width; x += 14) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      // Function to draw a continuous waveform channel with a sweep eraser gap
      const drawChannel = (buffer, baseY, color, glowColor) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 4;

        // Segment 1: from (sweepHead + sweepGap) % width to width
        // Segment 2: from 0 to sweepHead
        const gapStart = sweepHead;
        const gapEnd = (sweepHead + sweepGap) % width;

        const isWrapped = gapEnd < gapStart;

        ctx.beginPath();
        let started = false;

        for (let i = 0; i < width; i++) {
          const inGap = isWrapped ? (i >= gapStart || i <= gapEnd) : (i >= gapStart && i <= gapEnd);
          if (inGap) {
            started = false;
            continue;
          }

          const yPos = baseY - buffer[i];
          if (!started) {
            ctx.moveTo(i, yPos);
            started = true;
          } else {
            ctx.lineTo(i, yPos);
          }
        }
        ctx.stroke();
      };

      // Draw 3 High-Contrast Clinical Channels
      drawChannel(ecgBuffer, ch1Y, '#00e676', 'rgba(0, 230, 118, 0.6)');
      drawChannel(spo2Buffer, ch2Y, '#00e5ff', 'rgba(0, 229, 255, 0.6)');
      drawChannel(respBuffer, ch3Y, '#ffd600', 'rgba(255, 214, 0, 0.6)');

      // Draw Glowing Sweep Laser Line & Phosphor Fade at sweepHead
      ctx.shadowBlur = 0;
      const grad = ctx.createLinearGradient(sweepHead, 0, sweepHead + sweepGap, 0);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(0.2, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(sweepHead, 0, sweepGap, height);

      // Sweep Beam leading edge line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sweepHead, 0);
      ctx.lineTo(sweepHead, height);
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
            {isPlaying ? '● REALTIME CONTINUOUS TELEMETRY' : '● REALTIME CONTINUOUS TELEMETRY'}
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
