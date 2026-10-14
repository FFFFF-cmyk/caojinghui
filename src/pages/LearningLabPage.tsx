import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  BookOpen,
  Edit3,
  CheckCircle2,
  Trash2,
  Volume2
} from 'lucide-react';
import { TelemetryPoint } from '../types/craft';
import { playTrowelScrape } from '../utils/audio';
import { NavTab } from '../components/Navbar';

interface LearningLabPageProps {
  onNavigate: (tab: NavTab) => void;
  onExportPracticeData: (data: TelemetryPoint[]) => void;
}

export const LearningLabPage: React.FC<LearningLabPageProps> = ({
  onNavigate,
  onExportPracticeData,
}) => {
  // Active learning tab/step: 'observe' | 'understand' | 'practise' | 'reflect'
  const [activeStep, setActiveStep] = useState<'observe' | 'understand' | 'practise' | 'reflect'>('observe');

  // STEP 01 — OBSERVE state
  const [isObservePlaying, setIsObservePlaying] = useState<boolean>(true);
  const [observeProgress, setObserveProgress] = useState<number>(0);
  const [observeSpeed, setObserveSpeed] = useState<number>(1.0);
  const observeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // STEP 02 — UNDERSTAND state (hovered diagram part)
  const [hoveredDiagramPart, setHoveredDiagramPart] = useState<string>('angle');

  // STEP 03 — PRACTISE state
  const wallCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [inputPressure, setInputPressure] = useState<number>(32); // 10..50 N
  const [inputAngle, setInputAngle] = useState<number>(28); // 15..45 °
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number; time: number } | null>(null);

  // User Practice session telemetry collection
  const [userStrokes, setUserStrokes] = useState<TelemetryPoint[]>([]);
  const [strokeCount, setStrokeCount] = useState<number>(0);

  // Step 01: Animation loop for demonstration
  useEffect(() => {
    let animId: number;
    let last = performance.now();

    const loop = (time: number) => {
      const dt = (time - last) / 1000;
      last = time;

      if (isObservePlaying) {
        setObserveProgress((prev) => {
          const next = prev + (dt * observeSpeed) / 4.0;
          return next > 1 ? 0 : next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isObservePlaying, observeSpeed]);

  // Render Step 01 Canvas
  useEffect(() => {
    const canvas = observeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#141814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wall grid
    ctx.strokeStyle = 'rgba(165, 180, 154, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Trajectory arc path
    const startX = 60;
    const startY = 220;
    const cpX = canvas.width * 0.45;
    const cpY = 50;
    const endX = canvas.width - 60;
    const endY = 120;

    // Ghost path
    ctx.strokeStyle = 'rgba(102, 118, 93, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();

    // Partial stroke rendered so far
    const t = observeProgress;
    const curX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cpX + t * t * endX;
    const curY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cpY + t * t * endY;

    // Plaster band laid down
    ctx.strokeStyle = 'rgba(240, 238, 232, 0.75)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const steps = 30;
    for (let i = 1; i <= Math.floor(steps * t); i++) {
      const stepT = i / steps;
      const stepX = (1 - stepT) * (1 - stepT) * startX + 2 * (1 - stepT) * stepT * cpX + stepT * stepT * endX;
      const stepY = (1 - stepT) * (1 - stepT) * startY + 2 * (1 - stepT) * stepT * cpY + stepT * stepT * endY;
      ctx.lineTo(stepX, stepY);
    }
    ctx.stroke();

    // Trowel head at curX, curY
    ctx.save();
    ctx.translate(curX, curY);
    const curAngle = 28 + Math.sin(t * Math.PI) * 4;
    ctx.rotate(((curAngle - 30) * Math.PI) / 180);

    ctx.fillStyle = '#F0EEE8';
    ctx.strokeStyle = '#66765D';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-18, -8);
    ctx.lineTo(20, -10);
    ctx.lineTo(16, 10);
    ctx.lineTo(-16, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }, [observeProgress]);

  // Step 03: Virtual Wall canvas initialization
  useEffect(() => {
    const canvas = wallCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial wall coat (warm stone clay texture)
    ctx.fillStyle = '#1c221c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle texture noise / brick lines
    ctx.strokeStyle = 'rgba(165, 180, 154, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 50; y < canvas.height; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  // Handle Practice Mouse Drawing
  const startPlastering = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wallCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastMousePos({ x, y, time: performance.now() });
    setStrokeCount((prev) => prev + 1);
  };

  const drawPlasterStroke = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = wallCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    const now = performance.now();

    if (lastMousePos) {
      const dx = curX - lastMousePos.x;
      const dy = curY - lastMousePos.y;
      const dt = Math.max(1, now - lastMousePos.time);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speedCmS = Math.min(60, (dist / dt) * 35);

      // Acoustic trowel feedback
      playTrowelScrape(inputPressure, speedCmS, inputAngle);

      // Visual parameters modulated by pressure & angle
      // Higher pressure -> wider, denser marks
      // Angle -> edge shape and opacity
      const strokeWidth = Math.max(6, (inputPressure / 50) * 26);
      const opacity = Math.min(0.95, (inputPressure / 50) * 0.7 + (inputAngle / 45) * 0.3);

      ctx.save();
      ctx.strokeStyle = `rgba(240, 238, 232, ${opacity})`;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(lastMousePos.x, lastMousePos.y);
      ctx.lineTo(curX, curY);
      ctx.stroke();

      // Render Cao Jin (straw fibers) suspended in wet plaster
      if (Math.random() < 0.4) {
        const fiberAngle = (inputAngle * Math.PI) / 180 + (Math.random() * 0.5 - 0.25);
        const fiberLen = 12 + (inputPressure / 50) * 12;
        ctx.strokeStyle = `rgba(165, 180, 154, ${opacity * 0.7})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(curX - (Math.cos(fiberAngle) * fiberLen) / 2, curY - (Math.sin(fiberAngle) * fiberLen) / 2);
        ctx.lineTo(curX + (Math.cos(fiberAngle) * fiberLen) / 2, curY + (Math.sin(fiberAngle) * fiberLen) / 2);
        ctx.stroke();
      }

      ctx.restore();

      // Record point into telemetry stream
      const timeSec = Number(((userStrokes.length + 1) * 0.1).toFixed(1));
      const pt: TelemetryPoint = {
        time: Math.min(5.0, timeSec),
        pressure: inputPressure,
        toolAngle: inputAngle,
        speed: Math.round(speedCmS),
        x: Number((curX / canvas.width).toFixed(3)),
        y: Number((curY / canvas.height).toFixed(3)),
      };

      setUserStrokes((prev) => [...prev, pt]);
    }

    setLastMousePos({ x: curX, y: curY, time: now });
  };

  const stopPlastering = () => {
    setIsDrawing(false);
    setLastMousePos(null);
  };

  const handleClearWall = () => {
    const canvas = wallCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1c221c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(165, 180, 154, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 50; y < canvas.height; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    setUserStrokes([]);
    setStrokeCount(0);
  };

  // Compute Practice Reflection Statistics
  const practiceStats = React.useMemo(() => {
    if (userStrokes.length === 0) {
      return {
        avgPressure: 32,
        avgAngle: 28,
        consistency: 72,
        totalStrokes: strokeCount,
      };
    }

    const avgP = Math.round(
      userStrokes.reduce((acc, c) => acc + c.pressure, 0) / userStrokes.length
    );
    const avgA = Math.round(
      userStrokes.reduce((acc, c) => acc + c.toolAngle, 0) / userStrokes.length
    );

    // Score based on distance from Master sweet spot (32N pressure, 28° angle)
    const pError = Math.abs(avgP - 32);
    const aError = Math.abs(avgA - 28);
    const consistency = Math.max(45, Math.min(96, Math.round(100 - pError * 1.5 - aError * 2)));

    return {
      avgPressure: avgP,
      avgAngle: avgA,
      consistency,
      totalStrokes: strokeCount,
    };
  }, [userStrokes, strokeCount]);

  const handleCompareWithMaster = () => {
    if (userStrokes.length > 5) {
      onExportPracticeData(userStrokes);
    }
    onNavigate('comparison');
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#101210] text-[#F0EEE8]">
      {/* Page Header */}
      <section className="max-w-[1440px] mx-auto px-6 pt-6 pb-8 border-b border-[#252e25]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A5B49A]">
            <span>Pedagogical Workshop</span>
            <span aria-hidden="true">·</span>
            <span>Experiential Learning Environment</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-[#F0EEE8]">
            LEARNING LAB
          </h1>
          <p className="font-serif text-lg md:text-xl text-[#A5B49A] italic font-light">
            Learning through movement, not just observation.
          </p>
        </div>
      </section>

      {/* 4 Step Navigation Rail */}
      <section className="max-w-[1440px] mx-auto px-6 py-6 border-b border-[#252e25] bg-[#141814]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'observe', label: 'Step 01 — OBSERVE', icon: Eye },
            { id: 'understand', label: 'Step 02 — UNDERSTAND', icon: BookOpen },
            { id: 'practise', label: 'Step 03 — PRACTISE', icon: Edit3 },
            { id: 'reflect', label: 'Step 04 — REFLECT', icon: CheckCircle2 },
          ].map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id as any)}
                className={`flex items-center gap-2.5 p-3 text-left font-mono text-xs tracking-wider uppercase transition-colors border ${
                  isActive
                    ? 'bg-[#1B211B] border-[#A5B49A] text-[#F0EEE8] font-semibold'
                    : 'bg-[#101210] border-[#252e25] text-[#A8ABA4] hover:text-[#F0EEE8]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#A5B49A]' : 'text-[#A8ABA4]'}`} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* STEP 01 — OBSERVE */}
      {activeStep === 'observe' && (
        <section className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-[#1B211B] border border-[#252e25] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#252e25] pb-4">
                <span className="font-mono text-xs tracking-wider uppercase text-[#A5B49A]">
                  Kinetic Demonstration: Traditional Parabolic Sweep
                </span>
                <span className="font-mono text-xs text-[#A8ABA4]">
                  Progress: {Math.round(observeProgress * 100)}%
                </span>
              </div>

              <div className="relative w-full h-[380px] bg-[#141814] overflow-hidden border border-[#252e25]">
                <canvas
                  ref={observeCanvasRef}
                  width={680}
                  height={380}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsObservePlaying(!isObservePlaying)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#A5B49A] text-[#101210] font-mono text-xs font-semibold hover:bg-[#F0EEE8] transition-colors"
                  >
                    {isObservePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isObservePlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>
                  <button
                    onClick={() => setObserveProgress(0)}
                    className="p-2 border border-[#3b473b] hover:border-[#A5B49A] text-[#F0EEE8] transition-colors"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Playback speed selector */}
                <div className="flex items-center gap-1 bg-[#101210] p-1 border border-[#252e25]">
                  <span className="text-[11px] font-mono text-[#A8ABA4] px-2">Speed:</span>
                  {[0.5, 1.0, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setObserveSpeed(s)}
                      className={`px-2 py-0.5 text-xs font-mono transition-colors ${
                        observeSpeed === s
                          ? 'bg-[#A5B49A] text-[#101210] font-semibold'
                          : 'text-[#A8ABA4] hover:text-[#F0EEE8]'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#1B211B] border border-[#252e25] p-6 space-y-6">
              <h3 className="font-serif text-2xl text-[#F0EEE8]">
                Observational Guidance
              </h3>
              <div className="space-y-4 text-xs font-sans text-[#A8ABA4] leading-relaxed">
                <p>
                  Watch how the stroke begins at a low attack angle (24°) with ascending velocity before the craftsman transfers his torso weight into the center of the arc, peaking at 38 N of compression force.
                </p>
                <div className="p-4 bg-[#101210] border border-[#252e25] space-y-2 font-mono text-xs">
                  <div className="text-[#A5B49A] uppercase tracking-wider text-[11px]">Key Observation Checklist:</div>
                  <div className="flex items-center gap-2 text-[#F0EEE8]">
                    <span className="w-1.5 h-1.5 bg-[#A5B49A]" />
                    <span>No abrupt wrist stops or reversals</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#F0EEE8]">
                    <span className="w-1.5 h-1.5 bg-[#A5B49A]" />
                    <span>Trailing blade feathering eliminates lap seams</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#F0EEE8]">
                    <span className="w-1.5 h-1.5 bg-[#A5B49A]" />
                    <span>Hydraulic suction is maintained throughout</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('understand')}
                className="w-full py-2.5 px-4 bg-[#66765D] hover:bg-[#A5B49A] hover:text-[#101210] text-[#F0EEE8] font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to Step 02: Understand</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 02 — UNDERSTAND */}
      {activeStep === 'understand' && (
        <section className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-[#1B211B] border border-[#252e25] p-6 space-y-6">
              <div className="border-b border-[#252e25] pb-4">
                <span className="font-mono text-xs tracking-wider uppercase text-[#A5B49A]">
                  Interactive Mechanical Anatomy
                </span>
                <h3 className="font-serif text-2xl text-[#F0EEE8] mt-1">
                  Biomechanical Parameter Diagrams
                </h3>
                <p className="text-xs text-[#A8ABA4] mt-1">
                  Hover over any parameter zone on the interactive blade diagram to inspect technical mechanics.
                </p>
              </div>

              {/* Interactive Diagram with Hot-Zones */}
              <div className="relative h-80 bg-[#101210] border border-[#252e25] flex items-center justify-center">
                <svg viewBox="0 0 600 300" className="w-full h-full">
                  {/* Wall plane */}
                  <line x1="80" y1="20" x2="80" y2="280" stroke="#3b473b" strokeWidth="3" />
                  <text x="50" y="150" fill="#A8ABA4" fontSize="12" fontFamily="IBM Plex Mono" transform="rotate(-90 50 150)">
                    WALL PLANE
                  </text>

                  {/* Plaster Layer */}
                  <rect x="80" y="40" width="30" height="220" fill="rgba(240, 238, 232, 0.15)" stroke="none" />

                  {/* Trowel Blade tilted at 30° */}
                  <g
                    transform="translate(100, 150) rotate(30)"
                    className="cursor-pointer"
                  >
                    {/* Heel zone (Angle) */}
                    <rect
                      x="-20"
                      y="-12"
                      width="120"
                      height="24"
                      fill={hoveredDiagramPart === 'angle' ? '#A5B49A' : '#F0EEE8'}
                      stroke="#66765D"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredDiagramPart('angle')}
                      className="transition-colors"
                    />
                    {/* Handle */}
                    <rect
                      x="30"
                      y="-30"
                      width="40"
                      height="16"
                      fill={hoveredDiagramPart === 'pressure' ? '#91A9B6' : '#66765D'}
                      onMouseEnter={() => setHoveredDiagramPart('pressure')}
                      className="transition-colors"
                    />
                  </g>

                  {/* Hot-zone indicator circles */}
                  <circle
                    cx="150"
                    cy="180"
                    r="12"
                    fill={hoveredDiagramPart === 'angle' ? '#A5B49A' : 'transparent'}
                    stroke="#A5B49A"
                    strokeWidth="2"
                    className="cursor-pointer animate-pulse"
                    onMouseEnter={() => setHoveredDiagramPart('angle')}
                  />
                  <text x="175" y="185" fill="#A5B49A" fontSize="11" fontFamily="IBM Plex Mono">
                    θ PITCH INCIDENCE (28°)
                  </text>

                  <circle
                    cx="220"
                    cy="95"
                    r="12"
                    fill={hoveredDiagramPart === 'pressure' ? '#91A9B6' : 'transparent'}
                    stroke="#91A9B6"
                    strokeWidth="2"
                    className="cursor-pointer animate-pulse"
                    onMouseEnter={() => setHoveredDiagramPart('pressure')}
                  />
                  <text x="245" y="100" fill="#91A9B6" fontSize="11" fontFamily="IBM Plex Mono">
                    F NORMAL COMPRESSION (34 N)
                  </text>

                  <circle
                    cx="340"
                    cy="210"
                    r="12"
                    fill={hoveredDiagramPart === 'rhythm' ? '#66765D' : 'transparent'}
                    stroke="#66765D"
                    strokeWidth="2"
                    className="cursor-pointer animate-pulse"
                    onMouseEnter={() => setHoveredDiagramPart('rhythm')}
                  />
                  <text x="365" y="215" fill="#F0EEE8" fontSize="11" fontFamily="IBM Plex Mono">
                    V VELOCITY & CADENCE
                  </text>
                </svg>
              </div>

              {/* 4 Interactive Buttons to inspect parts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                {[
                  { id: 'angle', label: 'Tool Angle' },
                  { id: 'pressure', label: 'Applied Pressure' },
                  { id: 'direction', label: 'Direction Arc' },
                  { id: 'rhythm', label: 'Rhythm Cadence' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setHoveredDiagramPart(item.id)}
                    className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-colors border ${
                      hoveredDiagramPart === item.id
                        ? 'bg-[#A5B49A] text-[#101210] font-semibold border-[#A5B49A]'
                        : 'bg-[#101210] border-[#252e25] text-[#A8ABA4] hover:text-[#F0EEE8]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation Panel */}
            <div className="lg:col-span-5 bg-[#1B211B] border border-[#252e25] p-6 space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-[#A5B49A]">
                Deep Mechanical Parameter
              </span>

              {hoveredDiagramPart === 'angle' && (
                <div className="space-y-4">
                  <h4 className="font-serif text-2xl text-[#F0EEE8]">
                    Tool Pitch Angle (θ = 26°–32°)
                  </h4>
                  <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans">
                    Angle determines hydraulic compression. If the blade is too flat (&lt;18°), wet lime creates suction resistance and sticks to the steel. If too steep (&gt;38°), the leading edge scrapes and scrapes out straw fibers, fracturing the binder.
                  </p>
                  <div className="p-3 bg-[#101210] border border-[#252e25] font-mono text-xs text-[#A5B49A]">
                    Sweet Spot: 28.5° leading pitch for initial pass.
                  </div>
                </div>
              )}

              {hoveredDiagramPart === 'pressure' && (
                <div className="space-y-4">
                  <h4 className="font-serif text-2xl text-[#F0EEE8]">
                    Applied Pressure (F = 28–42 N)
                  </h4>
                  <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans">
                    Force presses the hydrated calcium hydroxide into the pores of brick and clay. Too little force results in hollow peeling walls; too much force squeezes water to the perimeter, causing premature crazing and hairline shrinkage.
                  </p>
                  <div className="p-3 bg-[#101210] border border-[#252e25] font-mono text-xs text-[#91A9B6]">
                    Optimal Gradient: Gentle 22N entry ramp → 36N apex → 20N exit.
                  </div>
                </div>
              )}

              {hoveredDiagramPart === 'direction' && (
                <div className="space-y-4">
                  <h4 className="font-serif text-2xl text-[#F0EEE8]">
                    Diagonal Cross-Hatch Direction
                  </h4>
                  <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans">
                    Traditional plasterers never apply mortar purely vertically. Moving in sweeping 45° diagonal parabolic arcs interlocks the chopped rice straw in multiple planar axes, acting like structural fiberglass mesh.
                  </p>
                  <div className="p-3 bg-[#101210] border border-[#252e25] font-mono text-xs text-[#A5B49A]">
                    Technique Rule: Sweep upward diagonally, feather laterally.
                  </div>
                </div>
              )}

              {hoveredDiagramPart === 'rhythm' && (
                <div className="space-y-4">
                  <h4 className="font-serif text-2xl text-[#F0EEE8]">
                    Kinetic Rhythm & Cadence
                  </h4>
                  <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans">
                    Plastering is whole-body choreography. Craftsmen pivot from the hips and knees rather than bending the wrist. A steady 18–22 strokes per minute rhythm prevents mortar from drying prematurely in the mortar tray.
                  </p>
                  <div className="p-3 bg-[#101210] border border-[#252e25] font-mono text-xs text-[#F0EEE8]">
                    Cadence: Smooth continuous oscillation without hesitant stops.
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveStep('practise')}
                className="w-full py-2.5 px-4 bg-[#66765D] hover:bg-[#A5B49A] hover:text-[#101210] text-[#F0EEE8] font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to Step 03: Practise</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 03 — PRACTISE */}
      {activeStep === 'practise' && (
        <section className="max-w-[1440px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Virtual Plaster Wall Canvas (8 Cols) */}
            <div className="lg:col-span-8 bg-[#1B211B] border border-[#252e25] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252e25] pb-4">
                <div>
                  <span className="font-mono text-xs tracking-wider uppercase text-[#A5B49A]">
                    Interactive Surface Simulation
                  </span>
                  <h3 className="font-serif text-xl text-[#F0EEE8]">
                    Virtual Wall: Drag Mouse Across Wall to Apply Cao Jin Hui
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#A8ABA4]">
                    Strokes: {strokeCount}
                  </span>
                  <button
                    onClick={handleClearWall}
                    className="p-1.5 text-[#A8ABA4] hover:text-red-400 transition-colors"
                    title="Clear wall surface"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Canvas viewport */}
              <div className="relative w-full h-[400px] bg-[#141814] border border-[#252e25] cursor-crosshair overflow-hidden select-none">
                <canvas
                  ref={wallCanvasRef}
                  width={720}
                  height={400}
                  onMouseDown={startPlastering}
                  onMouseMove={drawPlasterStroke}
                  onMouseUp={stopPlastering}
                  onMouseLeave={stopPlastering}
                  className="w-full h-full object-cover"
                />

                {strokeCount === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <div className="p-4 bg-[#101210]/90 border border-[#252e25] text-center space-y-1">
                      <p className="font-serif text-base text-[#F0EEE8]">Click and drag mouse to plaster</p>
                      <p className="font-mono text-[11px] text-[#A5B49A]">
                        Stroke thickness responds to your Pressure & Angle sliders below
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#A8ABA4]">
                <span>MATERIAL: Aged Lime Putty & Rice Straw (Cao Jin Hui)</span>
                <span className="text-[#A5B49A]">SIMULATION COUPLING: ACTIVE</span>
              </div>
            </div>

            {/* Parameter Adjustment Sliders (4 Cols) */}
            <div className="lg:col-span-4 bg-[#1B211B] border border-[#252e25] p-6 space-y-6">
              <h3 className="font-serif text-2xl text-[#F0EEE8]">
                Tool Calibration
              </h3>

              {/* Slider 1: Pressure */}
              <div className="space-y-2 p-3 bg-[#101210] border border-[#252e25]">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#A8ABA4]">PRESSURE</span>
                  <span className="text-[#A5B49A] font-semibold">{inputPressure} N</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={inputPressure}
                  onChange={(e) => setInputPressure(Number(e.target.value))}
                  className="w-full accent-[#A5B49A] cursor-pointer"
                />
                <p className="text-[10px] text-[#A8ABA4] font-mono">
                  Higher pressure produces wider, denser plaster coverage with compacted straw.
                </p>
              </div>

              {/* Slider 2: Tool Angle */}
              <div className="space-y-2 p-3 bg-[#101210] border border-[#252e25]">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#A8ABA4]">TOOL ANGLE</span>
                  <span className="text-[#91A9B6] font-semibold">{inputAngle}°</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={45}
                  value={inputAngle}
                  onChange={(e) => setInputAngle(Number(e.target.value))}
                  className="w-full accent-[#91A9B6] cursor-pointer"
                />
                <p className="text-[10px] text-[#A8ABA4] font-mono">
                  Different angles change the shape of the stroke and the orientation of straw fibers.
                </p>
              </div>

              {/* Dynamic Live Metric Readouts */}
              <div className="p-3 bg-[#101210] border border-[#252e25] font-mono text-xs space-y-2">
                <div className="text-[11px] text-[#A5B49A] uppercase tracking-wider">Live Biometrics:</div>
                <div className="flex items-center justify-between text-[#A8ABA4]">
                  <span>Movement Speed:</span>
                  <span className="text-[#F0EEE8]">Dynamic (Mouse Velocity)</span>
                </div>
                <div className="flex items-center justify-between text-[#A8ABA4]">
                  <span>Recorded Samples:</span>
                  <span className="text-[#A5B49A]">{userStrokes.length}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('reflect')}
                className="w-full py-2.5 px-4 bg-[#66765D] hover:bg-[#A5B49A] hover:text-[#101210] text-[#F0EEE8] font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to Step 04: Reflect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 04 — REFLECT */}
      {activeStep === 'reflect' && (
        <section className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto bg-[#1B211B] border border-[#252e25] p-8 md:p-10 space-y-8">
            <div className="border-b border-[#252e25] pb-6 space-y-2">
              <span className="font-mono text-xs tracking-wider uppercase text-[#A5B49A]">
                Post-Practice Somatic Assessment
              </span>
              <h3 className="font-serif text-3xl font-normal text-[#F0EEE8]">
                Session Performance Summary
              </h3>
              <p className="text-xs text-[#A8ABA4] font-sans">
                Review your simulated plastering biomechanics gathered during the practice wall session.
              </p>
            </div>

            {/* 4 Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#101210] border border-[#252e25] space-y-1 font-mono">
                <span className="text-[10px] text-[#A8ABA4] uppercase">Average Pressure</span>
                <div className="text-2xl text-[#A5B49A] font-semibold">
                  {practiceStats.avgPressure} N
                </div>
                <div className="text-[10px] text-[#A8ABA4]">Target: 28–38 N</div>
              </div>

              <div className="p-4 bg-[#101210] border border-[#252e25] space-y-1 font-mono">
                <span className="text-[10px] text-[#A8ABA4] uppercase">Average Tool Angle</span>
                <div className="text-2xl text-[#91A9B6] font-semibold">
                  {practiceStats.avgAngle}°
                </div>
                <div className="text-[10px] text-[#A8ABA4]">Target: 26°–32°</div>
              </div>

              <div className="p-4 bg-[#101210] border border-[#252e25] space-y-1 font-mono">
                <span className="text-[10px] text-[#A8ABA4] uppercase">Movement Consistency</span>
                <div className="text-2xl text-[#F0EEE8] font-semibold">
                  {practiceStats.consistency}%
                </div>
                <div className="text-[10px] text-[#A5B49A]">Alignment Index</div>
              </div>

              <div className="p-4 bg-[#101210] border border-[#252e25] space-y-1 font-mono">
                <span className="text-[10px] text-[#A8ABA4] uppercase">Total Strokes</span>
                <div className="text-2xl text-[#F0EEE8] font-semibold">
                  {practiceStats.totalStrokes}
                </div>
                <div className="text-[10px] text-[#A8ABA4]">Executed</div>
              </div>
            </div>

            {/* Curatorial Evaluation Note */}
            <div className="p-4 bg-[#141814] border border-[#252e25] text-xs font-mono text-[#A8ABA4] space-y-2">
              <span className="text-[#A5B49A] uppercase tracking-wider text-[11px]">
                Archive Observation:
              </span>
              <p className="leading-relaxed font-sans text-xs text-[#F0EEE8]/90">
                {practiceStats.totalStrokes === 0
                  ? 'No practice strokes recorded yet. Return to Step 03 to apply plaster on the virtual wall.'
                  : `You applied ${practiceStats.totalStrokes} strokes with an average normal compaction of ${practiceStats.avgPressure} N and blade pitch of ${practiceStats.avgAngle}°. In comparison to Master Xue's standard reference, your stroke cadence shows good initial intent.`}
              </p>
            </div>

            {/* Prompt Required Primary CTA: COMPARE WITH MASTER → */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setActiveStep('practise')}
                className="w-full sm:w-auto px-5 py-3 border border-[#3b473b] hover:border-[#A5B49A] text-[#F0EEE8] font-mono text-xs uppercase tracking-wider transition-colors"
              >
                ← Practise More Strokes
              </button>

              <button
                onClick={handleCompareWithMaster}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#A5B49A] hover:bg-[#F0EEE8] text-[#101210] font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
              >
                <span>COMPARE WITH MASTER →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
