import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Save,
  Radio,
  Clock,
  Compass,
  Zap,
  Activity,
  Trash2,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { TelemetryPoint, RecordingSession } from '../types/craft';
import { INITIAL_SAVED_SESSIONS } from '../data/mockData';
import { playTrowelScrape } from '../utils/audio';
import { NavTab } from '../components/Navbar';

interface MotionRecordingPageProps {
  onNavigate: (tab: NavTab) => void;
  selectedTechniqueName?: string;
  onSendToComparison?: (session: RecordingSession) => void;
}

export const MotionRecordingPage: React.FC<MotionRecordingPageProps> = ({
  onNavigate,
  selectedTechniqueName = 'Surface Application (Arc Sweep)',
  onSendToComparison,
}) => {
  // Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [sessionTechnique, setSessionTechnique] = useState<string>(selectedTechniqueName);
  const [motionPreset, setMotionPreset] = useState<'master' | 'learner' | 'burnish'>('master');

  // Live telemetry stream
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [currentPressure, setCurrentPressure] = useState<number>(31.2);
  const [currentAngle, setCurrentAngle] = useState<number>(29.5);
  const [currentSpeed, setCurrentSpeed] = useState<number>(23.0);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number }>({ x: 200, y: 180 });
  const [strokeCount, setStrokeCount] = useState<number>(1);

  // Saved sessions from localStorage
  const [savedSessions, setSavedSessions] = useState<RecordingSession[]>(() => {
    try {
      const stored = localStorage.getItem('cao_jin_hui_sessions');
      return stored ? JSON.parse(stored) : INITIAL_SAVED_SESSIONS;
    } catch {
      return INITIAL_SAVED_SESSIONS;
    }
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Canvas ref for movement view & motion visualisation
  const movementCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const trailPointsRef = useRef<{ x: number; y: number; pressure: number; angle: number; time: number }[]>([]);

  // Simulation tick logic
  const stepSimulation = useCallback((timestamp: number) => {
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    setElapsedTime((prev) => {
      const nextTime = Number((prev + dt).toFixed(2));
      const t = nextTime;

      // Realistic biomechanical simulation according to preset
      let p = 30;
      let a = 28;
      let sp = 22;
      let posX = 0.5;
      let posY = 0.5;

      if (motionPreset === 'master') {
        // Master: sweeping fluid arcs, steady pitch, smooth deceleration
        const cycle = (t * 0.9) % 3.2; // 3.2s per stroke cycle
        const progress = cycle / 3.2;
        p = 26 + 12 * Math.sin(progress * Math.PI) + Math.cos(t * 3) * 1.2;
        a = 28.5 + 3.8 * Math.sin(progress * Math.PI + 0.3);
        sp = 14 + 18 * Math.sin(progress * Math.PI);
        // Sweeping upward parabolic arc
        posX = 0.2 + 0.6 * progress;
        posY = 0.7 - 0.45 * Math.sin(progress * Math.PI);
      } else if (motionPreset === 'learner') {
        // Learner: high jitter, angle wobbles, erratic stops
        const cycle = (t * 1.1) % 2.8;
        const progress = cycle / 2.8;
        const jitterP = Math.sin(t * 16) * 5.5 + Math.cos(t * 26) * 3;
        p = 22 + 15 * Math.sin(progress * Math.PI) + jitterP;
        a = 24 + 12 * Math.sin(progress * Math.PI * 2) + Math.sin(t * 18) * 4;
        sp = Math.max(3, 18 + 16 * Math.sin(progress * Math.PI * 1.4) + Math.sin(t * 12) * 7);
        posX = 0.2 + 0.6 * progress + Math.sin(t * 10) * 0.03;
        posY = 0.72 - 0.42 * Math.sin(progress * Math.PI) + Math.cos(t * 12) * 0.03;
      } else {
        // Burnishing pass: high pressure, low flat angle, horizontal passes
        const cycle = (t * 1.4) % 2.4;
        const progress = cycle / 2.4;
        p = 38 + 7 * Math.sin(progress * Math.PI) + Math.sin(t * 6);
        a = 18.5 + 2.5 * Math.sin(progress * Math.PI);
        sp = 28 + 10 * Math.sin(progress * Math.PI);
        posX = 0.15 + 0.7 * progress;
        posY = 0.5 + Math.sin(t * 2) * 0.1;
      }

      const clampPressure = Math.max(10, Math.min(55, Number(p.toFixed(1))));
      const clampAngle = Math.max(12, Math.min(48, Number(a.toFixed(1))));
      const clampSpeed = Math.max(4, Math.min(50, Number(sp.toFixed(1))));

      setCurrentPressure(clampPressure);
      setCurrentAngle(clampAngle);
      setCurrentSpeed(clampSpeed);

      // Acoustic synthesis trigger
      playTrowelScrape(clampPressure, clampSpeed, clampAngle);

      // Add to movement trail
      const canvas = movementCanvasRef.current;
      if (canvas) {
        const pixelX = posX * canvas.width;
        const pixelY = posY * canvas.height;
        setCurrentPos({ x: pixelX, y: pixelY });

        trailPointsRef.current.push({
          x: pixelX,
          y: pixelY,
          pressure: clampPressure,
          angle: clampAngle,
          time: t,
        });

        if (trailPointsRef.current.length > 220) {
          trailPointsRef.current.shift();
        }
      }

      // Update telemetry history for Recharts
      setTelemetryHistory((prevHist) => {
        const newPoint: TelemetryPoint = {
          time: t,
          pressure: clampPressure,
          toolAngle: clampAngle,
          speed: clampSpeed,
          x: posX,
          y: posY,
        };
        const updated = [...prevHist, newPoint];
        if (updated.length > 36) {
          return updated.slice(updated.length - 36);
        }
        return updated;
      });

      // Update stroke count every cycle
      const cycleLen = motionPreset === 'master' ? 3.2 : motionPreset === 'learner' ? 2.8 : 2.4;
      const count = Math.max(1, Math.floor(t / cycleLen) + 1);
      setStrokeCount(count);

      return nextTime;
    });

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(stepSimulation);
    }
  }, [isRecording, motionPreset]);

  // Start / Pause recording loop
  useEffect(() => {
    if (isRecording) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(stepSimulation);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording, stepSimulation]);

  // Draw Movement Canvas (Left Column)
  useEffect(() => {
    const canvas = movementCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with dark wall texture backdrop
    ctx.fillStyle = '#141814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle plaster wall texture grain
    ctx.strokeStyle = 'rgba(165, 180, 154, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 32) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    const points = trailPointsRef.current;
    if (points.length < 2) {
      // Default idle guide curve
      ctx.strokeStyle = 'rgba(102, 118, 93, 0.2)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.15, canvas.height * 0.75);
      ctx.quadraticCurveTo(canvas.width * 0.45, canvas.height * 0.2, canvas.width * 0.85, canvas.height * 0.35);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }

    // Render organic plastering trail with width proportional to pressure
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const alpha = i / points.length; // fade older points
      const strokeWidth = Math.max(3, (p1.pressure / 50) * 18);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);

      // Color from sage green to warm ivory based on angle
      const r = Math.round(165 + (p1.pressure / 50) * 40);
      const g = Math.round(180 + (p1.pressure / 50) * 20);
      const b = 154;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Render microscopic straw fibers along the stroke path
      if (i % 6 === 0) {
        const angleRad = (p1.angle * Math.PI) / 180;
        const fiberLen = 14 + (p1.pressure / 50) * 10;
        ctx.save();
        ctx.translate(p1.x, p1.y);
        ctx.rotate(angleRad + (i % 3 === 0 ? 0.4 : -0.3));
        ctx.strokeStyle = `rgba(240, 238, 232, ${alpha * 0.45})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-fiberLen / 2, 0);
        ctx.lineTo(fiberLen / 2, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw active Trowel blade representation at current position
    const curP = points[points.length - 1];
    if (curP) {
      ctx.save();
      ctx.translate(curP.x, curP.y);
      const bladeAngleRad = ((curP.angle - 30) * Math.PI) / 180;
      ctx.rotate(bladeAngleRad);

      // Steel trowel trapezoid
      ctx.fillStyle = 'rgba(240, 238, 232, 0.9)';
      ctx.strokeStyle = '#66765D';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-22, -10);
      ctx.lineTo(24, -12);
      ctx.lineTo(20, 12);
      ctx.lineTo(-20, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wooden handle
      ctx.fillStyle = '#66765D';
      ctx.fillRect(-6, -4, 12, 8);
      ctx.restore();
    }
  }, [currentPos, currentPressure, currentAngle]);

  // Draw Motion Flow Visualisation (Center Column)
  useEffect(() => {
    const canvas = flowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#101210';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center circular radar/flow coordinate plane
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Concentric guide rings
    ctx.strokeStyle = 'rgba(165, 180, 154, 0.08)';
    ctx.lineWidth = 1;
    [40, 80, 120, 160].forEach((r) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Cross axes
    ctx.beginPath();
    ctx.moveTo(centerX - 170, centerY);
    ctx.lineTo(centerX + 170, centerY);
    ctx.moveTo(centerX, centerY - 170);
    ctx.lineTo(centerX, centerY + 170);
    ctx.stroke();

    // Flowing trajectory lines in sage and pale blue
    const hist = telemetryHistory;
    if (hist.length > 2) {
      // Trace 1: Sage green trajectory
      ctx.beginPath();
      ctx.strokeStyle = '#A5B49A';
      ctx.lineWidth = 2;
      for (let i = 0; i < hist.length; i++) {
        const pt = hist[i];
        const rad = ((pt.toolAngle * 4) * Math.PI) / 180;
        const radius = (pt.pressure / 50) * 140;
        const px = centerX + Math.cos(rad) * radius;
        const py = centerY + Math.sin(rad) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Trace 2: Pale blue velocity trail
      ctx.beginPath();
      ctx.strokeStyle = '#91A9B6';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < hist.length; i++) {
        const pt = hist[i];
        const rad = ((pt.speed * 6) * Math.PI) / 180;
        const radius = (pt.speed / 50) * 130;
        const px = centerX + Math.cos(rad) * radius;
        const py = centerY + Math.sin(rad) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Dynamic central vector indicator
    const curRad = ((currentAngle * 4) * Math.PI) / 180;
    const curDist = (currentPressure / 50) * 140;
    const curX = centerX + Math.cos(curRad) * curDist;
    const curY = centerY + Math.sin(curRad) * curDist;

    ctx.fillStyle = '#A5B49A';
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#F0EEE8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(curX, curY);
    ctx.stroke();
  }, [telemetryHistory, currentPressure, currentAngle, currentSpeed]);

  // Controls
  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleReset = () => {
    setIsRecording(false);
    setElapsedTime(0);
    setStrokeCount(1);
    trailPointsRef.current = [];
    setTelemetryHistory([]);
    setCurrentPressure(31.2);
    setCurrentAngle(29.5);
    setCurrentSpeed(23.0);
  };

  const handleSaveSession = () => {
    const avgP =
      telemetryHistory.length > 0
        ? Number(
            (
              telemetryHistory.reduce((acc, cur) => acc + cur.pressure, 0) /
              telemetryHistory.length
            ).toFixed(1)
          )
        : currentPressure;

    const avgA =
      telemetryHistory.length > 0
        ? Number(
            (
              telemetryHistory.reduce((acc, cur) => acc + cur.toolAngle, 0) /
              telemetryHistory.length
            ).toFixed(1)
          )
        : currentAngle;

    const avgSp =
      telemetryHistory.length > 0
        ? Number(
            (
              telemetryHistory.reduce((acc, cur) => acc + cur.speed, 0) /
              telemetryHistory.length
            ).toFixed(1)
          )
        : currentSpeed;

    const newSession: RecordingSession = {
      id: `rec-${Date.now()}`,
      title: `Recording — ${sessionTechnique}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      duration: Math.max(1, Number(elapsedTime.toFixed(1))),
      craftsman: 'Learner Cohort (Current Session)',
      technique: sessionTechnique,
      averagePressure: avgP,
      averageAngle: avgA,
      averageSpeed: avgSp,
      strokeCount: strokeCount,
      consistencyScore: motionPreset === 'master' ? 92 : motionPreset === 'learner' ? 64 : 85,
      data: telemetryHistory.length > 0 ? telemetryHistory : INITIAL_SAVED_SESSIONS[0].data,
      notes: `Recorded in simulation mode (${motionPreset} trajectory dynamic).`,
    };

    const updated = [newSession, ...savedSessions];
    setSavedSessions(updated);
    try {
      localStorage.setItem('cao_jin_hui_sessions', JSON.stringify(updated));
    } catch {
      // storage quota or private mode fallback
    }

    setSaveSuccessMsg(`Session saved successfully (#${newSession.id.substring(4, 9)})`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSessions.filter((s) => s.id !== id);
    setSavedSessions(updated);
    try {
      localStorage.setItem('cao_jin_hui_sessions', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const handleLoadSession = (session: RecordingSession) => {
    setIsRecording(false);
    setSessionTechnique(session.technique);
    setTelemetryHistory(session.data);
    setElapsedTime(session.duration);
    setStrokeCount(session.strokeCount);
    if (session.data.length > 0) {
      const last = session.data[session.data.length - 1];
      setCurrentPressure(last.pressure);
      setCurrentAngle(last.toolAngle);
      setCurrentSpeed(last.speed);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#101210] text-[#F0EEE8]">
      {/* Top Header */}
      <section className="max-w-[1440px] mx-auto px-6 pt-6 pb-8 border-b border-[#252e25]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A5B49A]">
              <span>Telemetry Acquisition</span>
              <span aria-hidden="true">·</span>
              <span>Proprioceptive Trace Laboratory</span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-[#F0EEE8]">
              MOTION RECORDING
            </h1>
            <p className="font-serif text-lg md:text-xl text-[#A5B49A] italic font-light">
              Translating physical movements into digital traces.
            </p>
          </div>

          {/* Session Preset Selector */}
          <div className="flex items-center gap-2 bg-[#1B211B] p-1.5 border border-[#252e25]">
            <span className="text-[11px] font-mono text-[#A8ABA4] px-2 uppercase">Preset:</span>
            <button
              onClick={() => setMotionPreset('master')}
              className={`px-3 py-1 text-xs font-mono tracking-wider transition-colors ${
                motionPreset === 'master'
                  ? 'bg-[#A5B49A] text-[#101210] font-semibold'
                  : 'text-[#A8ABA4] hover:text-[#F0EEE8]'
              }`}
            >
              Master Arc Sweep
            </button>
            <button
              onClick={() => setMotionPreset('learner')}
              className={`px-3 py-1 text-xs font-mono tracking-wider transition-colors ${
                motionPreset === 'learner'
                  ? 'bg-[#91A9B6] text-[#101210] font-semibold'
                  : 'text-[#A8ABA4] hover:text-[#F0EEE8]'
              }`}
            >
              Learner Trajectory
            </button>
            <button
              onClick={() => setMotionPreset('burnish')}
              className={`px-3 py-1 text-xs font-mono tracking-wider transition-colors ${
                motionPreset === 'burnish'
                  ? 'bg-[#66765D] text-[#F0EEE8] font-semibold'
                  : 'text-[#A8ABA4] hover:text-[#F0EEE8]'
              }`}
            >
              Burnish Pass
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-[#1B211B] border border-[#A5B49A] text-xs font-mono text-[#A5B49A] flex items-center justify-between">
            <span>{saveSuccessMsg}</span>
            <span className="text-[#A8ABA4]">Indexed in Local Storage</span>
          </div>
        )}
      </section>

      {/* Main Professional 3-Column Interface */}
      <section className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT — MOVEMENT VIEW (4 Cols) */}
          <div className="lg:col-span-4 bg-[#1B211B] border border-[#252e25] flex flex-col justify-between">
            <div className="p-4 border-b border-[#252e25] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#A5B49A] rotate-45" />
                <span className="font-mono text-xs tracking-wider uppercase text-[#F0EEE8]">
                  LEFT — MOVEMENT VIEW
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#A8ABA4]">
                STROKE {strokeCount}
              </span>
            </div>

            {/* Plastering Wall Motion Area */}
            <div className="relative w-full h-[360px] bg-[#141814] overflow-hidden">
              <canvas
                ref={movementCanvasRef}
                width={420}
                height={360}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#101210]/80 px-2.5 py-1 border border-[#252e25] text-[10px] font-mono text-[#A8ABA4]">
                <span>TROWEL POSITION: </span>
                <span className="text-[#A5B49A]">
                  X:{Math.round(currentPos.x)} Y:{Math.round(currentPos.y)}
                </span>
              </div>

              {!isRecording && elapsedTime === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
                  <div className="text-center space-y-1">
                    <p className="font-serif text-sm text-[#F0EEE8]">Tool in Resting Position</p>
                    <p className="font-mono text-[11px] text-[#A8ABA4]">Click START RECORDING to capture</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="p-4 border-t border-[#252e25] space-y-3 bg-[#101210]/60">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleRecording}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 font-mono text-xs tracking-wider uppercase font-semibold transition-colors ${
                    isRecording
                      ? 'bg-[#91A9B6] text-[#101210] hover:bg-[#F0EEE8]'
                      : 'bg-[#A5B49A] text-[#101210] hover:bg-[#F0EEE8]'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>START RECORDING</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 border border-[#3b473b] hover:border-[#A5B49A] text-[#F0EEE8] font-mono text-xs tracking-wider uppercase transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#A8ABA4]" />
                  <span>RESET</span>
                </button>
              </div>

              <button
                onClick={handleSaveSession}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-[#3b473b] hover:bg-[#252e25] text-[#A5B49A] font-mono text-xs tracking-wider uppercase transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE SESSION LOCALLY</span>
              </button>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#A8ABA4] pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#A5B49A]" />
                  <span>DURATION: {elapsedTime.toFixed(1)}s</span>
                </span>
                <span className="text-[#A5B49A]">
                  STATUS: {isRecording ? 'STREAMING' : 'HOLD'}
                </span>
              </div>
            </div>
          </div>

          {/* CENTER — MOTION VISUALISATION (4 Cols) */}
          <div className="lg:col-span-4 bg-[#1B211B] border border-[#252e25] flex flex-col justify-between">
            <div className="p-4 border-b border-[#252e25] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#91A9B6] rotate-45" />
                <span className="font-mono text-xs tracking-wider uppercase text-[#F0EEE8]">
                  CENTER — MOTION VISUALISATION
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#91A9B6]">
                POLAR VECTOR FIELD
              </span>
            </div>

            {/* Vector Trajectory Radar Area */}
            <div className="relative w-full h-[360px] bg-[#101210] flex items-center justify-center overflow-hidden">
              <canvas
                ref={flowCanvasRef}
                width={400}
                height={360}
                className="w-full h-full object-contain"
              />

              <div className="absolute top-3 right-3 text-right font-mono text-[10px] space-y-0.5 text-[#A8ABA4]">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-2 h-0.5 bg-[#A5B49A]" />
                  <span>Pressure/Angle Path</span>
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-2 h-0.5 bg-[#91A9B6]" />
                  <span>Velocity Trajectory</span>
                </div>
              </div>

              {/* Polar Center Label */}
              <div className="absolute bottom-3 left-3 bg-[#1B211B]/80 px-2 py-0.5 border border-[#252e25] text-[10px] font-mono text-[#A8ABA4]">
                CADENCE: {motionPreset === 'master' ? '18.8 BPM' : '12.4 BPM'} (HARMONIC)
              </div>
            </div>

            {/* Kinetic Metrics Summary */}
            <div className="p-4 border-t border-[#252e25] bg-[#101210]/60 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[#A8ABA4]">
                <span>Movement Rhythm:</span>
                <span className="text-[#A5B49A]">
                  {motionPreset === 'master' ? 'Continuous Harmonic (0.94)' : 'Hesitant Tremor (0.58)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#A8ABA4]">
                <span>Stroke Duration:</span>
                <span className="text-[#F0EEE8]">
                  {motionPreset === 'master' ? '3.20s Nominal' : '2.80s Segmented'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#A8ABA4]">
                <span>Vector Cohesion:</span>
                <span className="text-[#91A9B6]">
                  {motionPreset === 'master' ? '96.2% Alignment' : '71.4% Drift'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — SENSOR DATA (4 Cols) */}
          <div className="lg:col-span-4 bg-[#1B211B] border border-[#252e25] flex flex-col justify-between">
            <div className="p-4 border-b border-[#252e25] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#66765D] rotate-45" />
                <span className="font-mono text-xs tracking-wider uppercase text-[#F0EEE8]">
                  RIGHT — SENSOR DATA
                </span>
              </div>
              {/* Mandatory Prompt Status Indicator */}
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 bg-[#101210] border border-[#3b473b] text-[#A5B49A]">
                LIVE DATA — SIMULATION
              </span>
            </div>

            {/* Live Data Panels */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Panel 1: Pressure Line Chart */}
              <div className="p-3 bg-[#101210] border border-[#252e25] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A8ABA4]">PRESSURE (N)</span>
                  <span className="text-[#A5B49A] font-semibold">{currentPressure} N</span>
                </div>
                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryHistory}>
                      <YAxis domain={[0, 60]} hide />
                      <Line
                        type="monotone"
                        dataKey="pressure"
                        stroke="#A5B49A"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Panel 2: Tool Angle Circular Dial Indicator */}
              <div className="p-3 bg-[#101210] border border-[#252e25] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A8ABA4]">TOOL ANGLE</span>
                  <span className="text-[#91A9B6] font-semibold">{currentAngle}°</span>
                </div>

                <div className="flex items-center gap-4 py-1">
                  {/* SVG Circular Angle Gauge */}
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 60 60" className="w-full h-full">
                      {/* Base dial arc */}
                      <circle
                        cx="30"
                        cy="30"
                        r="24"
                        fill="none"
                        stroke="#252e25"
                        strokeWidth="3"
                      />
                      {/* Angle tick marks */}
                      <path
                        d="M 30 6 A 24 24 0 0 1 54 30"
                        fill="none"
                        stroke="#91A9B6"
                        strokeWidth="3"
                        strokeDasharray="2 3"
                      />
                      {/* Rotating Needle indicator */}
                      <line
                        x1="30"
                        y1="30"
                        x2={30 + 20 * Math.cos(((currentAngle - 90) * Math.PI) / 180)}
                        y2={30 + 20 * Math.sin(((currentAngle - 90) * Math.PI) / 180)}
                        stroke="#F0EEE8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="30" cy="30" r="3" fill="#A5B49A" />
                    </svg>
                  </div>

                  <div className="text-[11px] font-mono text-[#A8ABA4] space-y-1">
                    <div>Optimal Range: 26° – 32°</div>
                    <div className="text-[#91A9B6]">
                      Status: {currentAngle >= 25 && currentAngle <= 33 ? 'Optimal Pitch' : 'Sub-optimal Incidence'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 3: Movement Speed Graph */}
              <div className="p-3 bg-[#101210] border border-[#252e25] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A8ABA4]">MOVEMENT SPEED (cm/s)</span>
                  <span className="text-[#F0EEE8] font-semibold">{currentSpeed} cm/s</span>
                </div>
                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryHistory}>
                      <YAxis domain={[0, 60]} hide />
                      <Line
                        type="monotone"
                        dataKey="speed"
                        stroke="#91A9B6"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Status strip */}
            <div className="p-4 border-t border-[#252e25] bg-[#101210]/60 flex items-center justify-between text-[11px] font-mono text-[#A8ABA4]">
              <span>SAMPLE RATE: 10 Hz</span>
              <span className="text-[#A5B49A]">PACKET JITTER: 0.2ms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Saved Sessions Drawer & Comparison Bridge */}
      <section className="max-w-[1440px] mx-auto px-6 pt-10">
        <div className="border border-[#252e25] bg-[#1B211B] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252e25] pb-4">
            <div>
              <h3 className="font-serif text-xl text-[#F0EEE8]">
                SAVED RECORDING SESSIONS
              </h3>
              <p className="font-mono text-xs text-[#A8ABA4]">
                Locally stored telemetry traces available for review or expert comparison.
              </p>
            </div>
            <button
              onClick={() => onNavigate('comparison')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#66765D] hover:bg-[#A5B49A] hover:text-[#101210] text-[#F0EEE8] font-mono text-xs tracking-wider uppercase transition-colors"
            >
              <span>Go to Skill Comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => handleLoadSession(sess)}
                className="cursor-pointer p-4 bg-[#101210] border border-[#252e25] hover:border-[#A5B49A] transition-colors space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] text-[#A5B49A] uppercase tracking-wider">
                      {sess.technique}
                    </span>
                    <h4 className="font-serif text-base text-[#F0EEE8] group-hover:text-[#A5B49A] transition-colors">
                      {sess.title}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="p-1 text-[#A8ABA4] hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-[#A8ABA4] pt-2 border-t border-[#252e25]">
                  <div>
                    <div className="text-[10px] text-[#A8ABA4]/60">AVG FORCE</div>
                    <div className="text-[#F0EEE8]">{sess.averagePressure} N</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A8ABA4]/60">AVG ANGLE</div>
                    <div className="text-[#91A9B6]">{sess.averageAngle}°</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A8ABA4]/60">SCORE</div>
                    <div className="text-[#A5B49A]">{sess.consistencyScore}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#A8ABA4]/60 pt-1">
                  <span>{sess.date}</span>
                  <span className="text-[#A5B49A]">Load Session →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
