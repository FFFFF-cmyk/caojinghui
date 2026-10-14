import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { COMPARISON_MASTER_DATA, COMPARISON_LEARNER_DATA } from '../data/mockData';
import { TelemetryPoint } from '../types/craft';
import { NavTab } from '../components/Navbar';

interface SkillComparisonPageProps {
  onNavigate: (tab: NavTab) => void;
  userCustomLearnerData?: TelemetryPoint[];
}

export const SkillComparisonPage: React.FC<SkillComparisonPageProps> = ({
  onNavigate,
  userCustomLearnerData,
}) => {
  // Timeline scrubber state (0 to 5.0 seconds in steps of 0.1)
  const [timelineIndex, setTimelineIndex] = useState<number>(24);
  const [isPlayingScrubber, setIsPlayingScrubber] = useState<boolean>(false);

  // Active learner dataset (custom practice data if provided, or reference demo learner)
  const learnerData = useMemo(() => {
    return userCustomLearnerData && userCustomLearnerData.length > 5
      ? userCustomLearnerData
      : COMPARISON_LEARNER_DATA;
  }, [userCustomLearnerData]);

  const masterData = COMPARISON_MASTER_DATA;

  // Max index
  const maxIndex = Math.min(masterData.length - 1, learnerData.length - 1);
  const safeIndex = Math.min(timelineIndex, maxIndex);

  const currentMasterPoint = masterData[safeIndex] || masterData[0];
  const currentLearnerPoint = learnerData[safeIndex] || learnerData[0];

  // Combined chart dataset for overlays
  const combinedChartData = useMemo(() => {
    const list = [];
    for (let i = 0; i <= maxIndex; i++) {
      const m = masterData[i];
      const l = learnerData[i] || learnerData[learnerData.length - 1];
      list.push({
        time: m.time,
        masterPressure: m.pressure,
        learnerPressure: l.pressure,
        masterAngle: m.toolAngle,
        learnerAngle: l.toolAngle,
        masterSpeed: m.speed,
        learnerSpeed: l.speed,
      });
    }
    return list;
  }, [masterData, learnerData, maxIndex]);

  // Autoplay scrubber effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingScrubber) {
      timer = setInterval(() => {
        setTimelineIndex((prev) => {
          if (prev >= maxIndex) return 0;
          return prev + 1;
        });
      }, 120);
    }
    return () => clearInterval(timer);
  }, [isPlayingScrubber, maxIndex]);

  // Dynamically compute variance differences from data
  const dynamicAnalysis = useMemo(() => {
    let pDiffSum = 0;
    let aDiffSum = 0;
    let learnerPressureJitter = 0;

    for (let i = 1; i <= maxIndex; i++) {
      const curL = learnerData[i];
      const prevL = learnerData[i - 1];
      learnerPressureJitter += Math.abs(curL.pressure - prevL.pressure);
      pDiffSum += Math.abs(curL.pressure - masterData[i].pressure);
      aDiffSum += Math.abs(curL.toolAngle - masterData[i].toolAngle);
    }

    const avgPDiff = (pDiffSum / maxIndex).toFixed(1);
    const avgADiff = (aDiffSum / maxIndex).toFixed(1);
    const jitterRatio = (learnerPressureJitter / 30).toFixed(1);

    return {
      pressureFluctuation: `Your pressure fluctuates ${jitterRatio}× more frequently than the reference movement.`,
      angleRapidChange: `Your tool angle changes rapidly (average deviation ±${avgADiff}°) during the stroke.`,
      rhythmConsistency: `Your movement rhythm is less consistent, with variable acceleration and deceleration.`,
      avgPressureDelta: `${avgPDiff} N`,
      avgAngleDelta: `${avgADiff}°`,
    };
  }, [masterData, learnerData, maxIndex]);

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[#101210] text-[#F0EEE8]">
      {/* Page Title & Subtitle */}
      <section className="max-w-[1440px] mx-auto px-6 pt-6 pb-10 border-b border-[#252e25]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A5B49A]">
            <span>Comparative Biomechanics</span>
            <span aria-hidden="true">·</span>
            <span>Master vs. Learner Analysis</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-[#F0EEE8]">
            SKILL COMPARISON
          </h1>
          <p className="font-serif text-lg md:text-xl text-[#A5B49A] italic font-light">
            Understanding the difference between observation and experience.
          </p>
        </div>
      </section>

      {/* Interactive Timeline Scrubber Bar */}
      <section className="max-w-[1440px] mx-auto px-6 py-6 border-b border-[#252e25] bg-[#141814]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlayingScrubber(!isPlayingScrubber)}
              className="p-2.5 bg-[#A5B49A] text-[#101210] hover:bg-[#F0EEE8] transition-colors"
              aria-label={isPlayingScrubber ? 'Pause timeline playback' : 'Play timeline playback'}
            >
              {isPlayingScrubber ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setIsPlayingScrubber(false);
                setTimelineIndex(0);
              }}
              className="p-2 border border-[#3b473b] hover:border-[#A5B49A] text-[#F0EEE8] transition-colors"
              aria-label="Reset timeline to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="font-mono text-xs text-[#A8ABA4]">
              <span>TIMELINE SCRUBBER: </span>
              <span className="text-[#F0EEE8] font-semibold">
                {currentMasterPoint.time.toFixed(1)}s / 5.0s
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="flex-1 max-w-xl flex items-center gap-4">
            <span className="text-[11px] font-mono text-[#A8ABA4]">0.0s</span>
            <input
              type="range"
              min={0}
              max={maxIndex}
              value={safeIndex}
              onChange={(e) => {
                setIsPlayingScrubber(false);
                setTimelineIndex(Number(e.target.value));
              }}
              className="w-full accent-[#A5B49A] cursor-pointer bg-[#252e25]"
            />
            <span className="text-[11px] font-mono text-[#A8ABA4]">5.0s</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#A5B49A]">
              <span className="w-2.5 h-2.5 bg-[#A5B49A] inline-block" />
              <span>Master Xue (Ref)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#91A9B6]">
              <span className="w-2.5 h-2.5 bg-[#91A9B6] inline-block" />
              <span>Learner (Trace)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Dual Movement Visualisation Comparison */}
      <section className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT — MASTER'S MOVEMENT (Sage Green) */}
          <div className="bg-[#1B211B] border border-[#252e25] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#252e25] pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#A5B49A]">
                  Reference Demonstration
                </span>
                <h3 className="font-serif text-2xl text-[#F0EEE8]">
                  LEFT — MASTER'S MOVEMENT
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-[#A5B49A]">
                <div>STABILITY INDEX: 94%</div>
                <div className="text-[11px] text-[#A8ABA4]">Harmonic Cadence</div>
              </div>
            </div>

            {/* Simulated Trowel Wall Arc Canvas for Master */}
            <div className="relative h-64 bg-[#101210] border border-[#252e25] flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 500 240">
                {/* Reference Ideal Path (Smooth Arc) */}
                <path
                  d="M 60 190 Q 250 50 440 100"
                  fill="none"
                  stroke="#66765D"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="opacity-40"
                />
                {/* Animated scrubber position */}
                {(() => {
                  const px = 60 + (440 - 60) * (currentMasterPoint.time / 5.0);
                  const py = 190 - 140 * Math.sin((currentMasterPoint.time / 5.0) * Math.PI);
                  return (
                    <g transform={`translate(${px}, ${py})`}>
                      <circle r="7" fill="#A5B49A" />
                      {/* Trowel orientation line */}
                      <line
                        x1="-24"
                        y1="0"
                        x2="24"
                        y2="0"
                        stroke="#F0EEE8"
                        strokeWidth="3"
                        transform={`rotate(${currentMasterPoint.toolAngle - 30})`}
                      />
                    </g>
                  );
                })()}
              </svg>

              <div className="absolute bottom-3 left-3 bg-[#1B211B]/80 px-2 py-1 text-[11px] font-mono text-[#A8ABA4]">
                TROWEL PITCH: <span className="text-[#A5B49A] font-medium">{currentMasterPoint.toolAngle}°</span>
              </div>
            </div>

            {/* Instantaneous Master Readouts */}
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#101210] border border-[#252e25]">
                <div className="text-[10px] text-[#A8ABA4]">PRESSURE</div>
                <div className="text-base text-[#A5B49A] font-semibold">{currentMasterPoint.pressure} N</div>
              </div>
              <div className="p-3 bg-[#101210] border border-[#252e25]">
                <div className="text-[10px] text-[#A8ABA4]">TOOL ANGLE</div>
                <div className="text-base text-[#A5B49A] font-semibold">{currentMasterPoint.toolAngle}°</div>
              </div>
              <div className="p-3 bg-[#101210] border border-[#252e25]">
                <div className="text-[10px] text-[#A8ABA4]">VELOCITY</div>
                <div className="text-base text-[#A5B49A] font-semibold">{currentMasterPoint.speed} cm/s</div>
              </div>
            </div>
          </div>

          {/* RIGHT — LEARNER'S MOVEMENT (Muted Blue) */}
          <div className="bg-[#1B211B] border border-[#252e25] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#252e25] pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#91A9B6]">
                  User / Cohort Session
                </span>
                <h3 className="font-serif text-2xl text-[#F0EEE8]">
                  RIGHT — LEARNER'S MOVEMENT
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-[#91A9B6]">
                <div>STABILITY INDEX: 61%</div>
                <div className="text-[11px] text-[#A8ABA4]">Frequent Correction</div>
              </div>
            </div>

            {/* Simulated Trowel Wall Arc Canvas for Learner */}
            <div className="relative h-64 bg-[#101210] border border-[#252e25] flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 500 240">
                {/* Learner Jitter Path */}
                <path
                  d="M 60 195 Q 240 45 440 108"
                  fill="none"
                  stroke="#91A9B6"
                  strokeWidth="6"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  className="opacity-50"
                />
                {/* Animated scrubber position */}
                {(() => {
                  const px = 60 + (440 - 60) * (currentLearnerPoint.time / 5.0) + Math.sin(safeIndex) * 3;
                  const py = 195 - 138 * Math.sin((currentLearnerPoint.time / 5.0) * Math.PI) + Math.cos(safeIndex) * 4;
                  return (
                    <g transform={`translate(${px}, ${py})`}>
                      <circle r="7" fill="#91A9B6" />
                      {/* Trowel orientation line */}
                      <line
                        x1="-24"
                        y1="0"
                        x2="24"
                        y2="0"
                        stroke="#F0EEE8"
                        strokeWidth="3"
                        transform={`rotate(${currentLearnerPoint.toolAngle - 30})`}
                      />
                    </g>
                  );
                })()}
              </svg>

              <div className="absolute bottom-3 left-3 bg-[#1B211B]/80 px-2 py-1 text-[11px] font-mono text-[#A8ABA4]">
                TROWEL PITCH: <span className="text-[#91A9B6] font-medium">{currentLearnerPoint.toolAngle}°</span>
              </div>
            </div>

            {/* Instantaneous Learner Readouts */}
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#101210] border border-[#252e25]">
                <div className="text-[10px] text-[#A8ABA4]">PRESSURE</div>
                <div className="text-base text-[#91A9B6] font-semibold">{currentLearnerPoint.pressure} N</div>
              </div>
              <div className="p-3 bg-[#101210] border border-[#252e25]">
                <div className="text-[10px] text-[#A8ABA4]">TOOL ANGLE</div>
                <div className="text-base text-[#91A9B6] font-semibold">{currentLearnerPoint.toolAngle}°</div>
              </div>
              <div className="p-3 bg-[#101210] border border-[#252e25]">
                <div className="text-[10px] text-[#A8ABA4]">VELOCITY</div>
                <div className="text-base text-[#91A9B6] font-semibold">{currentLearnerPoint.speed} cm/s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Comparative Overlay Charts */}
      <section className="max-w-[1440px] mx-auto px-6 py-12 border-t border-[#252e25]">
        <div className="mb-8">
          <p className="font-mono text-xs tracking-widest text-[#A5B49A] uppercase mb-1">
            Synchronized Kinetic Curves
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-[#F0EEE8]">
            OVERLAY PARAMETER COMPARISON
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart 1: Pressure Comparison */}
          <div className="bg-[#1B211B] border border-[#252e25] p-5 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#F0EEE8] font-medium uppercase">PRESSURE COMPARISON (N)</span>
              <span className="text-[#A8ABA4]">0–60 N</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <XAxis dataKey="time" stroke="#3b473b" tick={{ fill: '#A8ABA4', fontSize: 10 }} />
                  <YAxis stroke="#3b473b" tick={{ fill: '#A8ABA4', fontSize: 10 }} domain={[0, 60]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#101210', borderColor: '#252e25', fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    name="Master"
                    dataKey="masterPressure"
                    stroke="#A5B49A"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    name="Learner"
                    dataKey="learnerPressure"
                    stroke="#91A9B6"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] font-mono text-[#A8ABA4] leading-relaxed">
              Master maintains a smooth bell-shaped compression curve; Learner exhibits high-frequency jitter and sudden pressure dropouts.
            </p>
          </div>

          {/* Chart 2: Angle Comparison */}
          <div className="bg-[#1B211B] border border-[#252e25] p-5 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#F0EEE8] font-medium uppercase">ANGLE COMPARISON (°)</span>
              <span className="text-[#A8ABA4]">10°–50°</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <XAxis dataKey="time" stroke="#3b473b" tick={{ fill: '#A8ABA4', fontSize: 10 }} />
                  <YAxis stroke="#3b473b" tick={{ fill: '#A8ABA4', fontSize: 10 }} domain={[10, 50]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#101210', borderColor: '#252e25', fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    name="Master"
                    dataKey="masterAngle"
                    stroke="#A5B49A"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    name="Learner"
                    dataKey="learnerAngle"
                    stroke="#91A9B6"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] font-mono text-[#A8ABA4] leading-relaxed">
              Master stays tightly within the 26°–32° keying window; Learner drifts past 42°, risking blade gouging into raw lime.
            </p>
          </div>

          {/* Chart 3: Movement Rhythm */}
          <div className="bg-[#1B211B] border border-[#252e25] p-5 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#F0EEE8] font-medium uppercase">MOVEMENT RHYTHM (cm/s)</span>
              <span className="text-[#A8ABA4]">Velocity Curve</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <XAxis dataKey="time" stroke="#3b473b" tick={{ fill: '#A8ABA4', fontSize: 10 }} />
                  <YAxis stroke="#3b473b" tick={{ fill: '#A8ABA4', fontSize: 10 }} domain={[0, 50]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#101210', borderColor: '#252e25', fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    name="Master"
                    dataKey="masterSpeed"
                    stroke="#A5B49A"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    name="Learner"
                    dataKey="learnerSpeed"
                    stroke="#91A9B6"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] font-mono text-[#A8ABA4] leading-relaxed">
              Master displays continuous harmonic rhythm; Learner demonstrates hesitation pauses and erratic acceleration spikes.
            </p>
          </div>
        </div>
      </section>

      {/* Analysis Section: WHAT CAN THE DATA REVEAL? */}
      <section className="max-w-[1440px] mx-auto px-6 py-14 border-t border-[#252e25]">
        <div className="mb-8">
          <p className="font-mono text-xs tracking-widest text-[#A5B49A] uppercase mb-1">
            Dynamic Biomechanical Diagnostics
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#F0EEE8]">
            WHAT CAN THE DATA REVEAL?
          </h2>
        </div>

        {/* Dynamic Observations generated from telemetry data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#1B211B] border border-[#252e25] space-y-3">
            <span className="font-mono text-xs text-[#A5B49A]">FINDING 01 / FORCE CONTROL</span>
            <p className="font-serif text-lg text-[#F0EEE8] italic leading-snug">
              "{dynamicAnalysis.pressureFluctuation}"
            </p>
            <p className="text-xs text-[#A8ABA4] font-sans pt-2 border-t border-[#252e25]/60">
              Sensor data highlights high-frequency involuntary muscle micro-spasms during the stroke midpoint, resulting in uneven straw compaction.
            </p>
          </div>

          <div className="p-6 bg-[#1B211B] border border-[#252e25] space-y-3">
            <span className="font-mono text-xs text-[#91A9B6]">FINDING 02 / ATTACK INCIDENCE</span>
            <p className="font-serif text-lg text-[#F0EEE8] italic leading-snug">
              "{dynamicAnalysis.angleRapidChange}"
            </p>
            <p className="text-xs text-[#A8ABA4] font-sans pt-2 border-t border-[#252e25]/60">
              The wrist fails to lock into the sweeping trajectory, causing the trailing heel of the blade to lose planar contact and drag dry burrs.
            </p>
          </div>

          <div className="p-6 bg-[#1B211B] border border-[#252e25] space-y-3">
            <span className="font-mono text-xs text-[#A5B49A]">FINDING 03 / KINETIC CADENCE</span>
            <p className="font-serif text-lg text-[#F0EEE8] italic leading-snug">
              "{dynamicAnalysis.rhythmConsistency}"
            </p>
            <p className="text-xs text-[#A8ABA4] font-sans pt-2 border-t border-[#252e25]/60">
              Unlike Master Xue's continuous bodily swing, the learner executes strokes in isolated segments with abrupt halting pauses.
            </p>
          </div>
        </div>
      </section>

      {/* Critical Reflection Section: BEYOND THE DATA */}
      <section className="max-w-[1440px] mx-auto px-6 py-20 border-t border-[#252e25]">
        <div className="p-10 md:p-14 bg-[#141814] border border-[#2d382d] space-y-10 relative overflow-hidden">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A5B49A]">
              <span>Epistemological Critique</span>
              <span aria-hidden="true">·</span>
              <span>The Limit of Metrics</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-[#F0EEE8]">
              BEYOND THE DATA
            </h2>
            <p className="font-serif text-xl text-[#A5B49A] italic font-light">
              Not all knowledge can be measured.
            </p>
            <p className="text-sm md:text-base text-[#A8ABA4] leading-relaxed font-sans pt-2">
              Pressure, angle, and movement can reveal patterns in craftsmanship. However, material judgement, tactile sensitivity, and situational adaptation remain difficult to capture through sensors alone. This archive serves to augment and illuminate tradition, not reduce human wisdom to rigid machine specifications.
            </p>
          </div>

          {/* Three Conceptual Deep-Dives */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-[#252e25]">
            <div className="space-y-3">
              <div className="font-mono text-xs text-[#A5B49A] uppercase tracking-wider">
                01. Material Judgement
              </div>
              <h4 className="font-serif text-xl text-[#F0EEE8]">
                Hydration & Tack Calibration
              </h4>
              <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans">
                A sensor registers contact force, but cannot evaluate whether the slaked lime mortar is shedding moisture too fast to achieve calcium carbonation. The master reads this purely by acoustic drag and color transformation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-xs text-[#91A9B6] uppercase tracking-wider">
                02. Tactile Sensitivity
              </div>
              <h4 className="font-serif text-xl text-[#F0EEE8]">
                Capillary Fiber Distribution
              </h4>
              <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans">
                Straw fibers act as microscopic reinforcement trusses. Feeling whether fibers are tangling into a knot or gliding freely across the brick surface occurs through vibration in the wooden handle, undetectable to coarse IMU sensors.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-xs text-[#A5B49A] uppercase tracking-wider">
                03. Situational Adaptation
              </div>
              <h4 className="font-serif text-xl text-[#F0EEE8]">
                Living Environmental Dialogue
              </h4>
              <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans">
                An artisan does not repeat identical mathematical curves. If an afternoon gust drafts through the courtyard, the master immediately tilts his angle and doubles his stroke speed to prevent the paste surface from cracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
