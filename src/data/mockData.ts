import { TechniqueItem, TelemetryPoint, RecordingSession } from '../types/craft';

export const ASSET_IMAGES = {
  masterXue: '/src/assets/images/master_xue_portrait_1791995812857.jpg',
  handPlastering: '/src/assets/images/craftsman_hand_trowel_real_1791999422708.jpg',
  materialPrep: '/src/assets/images/cao_jin_hui_material_prep_1791995812844.jpg',
  trowelTechnique: '/src/assets/images/wall_trowel_technique_1791995813679.jpg',
};

export const MASTER_XUE_PROFILE = {
  name: 'Master Xue',
  chineseName: '薛师傅',
  role: 'Traditional Plaster Craftsman',
  location: 'Lishui, Nanjing, China',
  craft: 'Cao Jin Hui (草筋灰) Plastering',
  experience: 'Not specified',
  bio: 'Master Xue practices Cao Jin Hui, a venerable Chinese masonry plastering method relying on slaked lime and chopped wheat or rice straw fibers. Recorded during field research documentation in southern Jiangsu, his practice preserves oral and somatic lineages that regulate moisture balance, paste plasticity, and tactile compaction without modern industrial accelerators.',
  recordedTechniques: [
    'Substrate Pre-Wet & Slurry Priming',
    'Straw-Lime Matrix Kneading',
    'Arc-Sweep Surface Application',
    'Micro-Angle Polishing & Compaction',
  ],
  quotes: [
    {
      text: "There's no set number. It depends on the wall.",
      context: "On determining the exact ratio of water to slaked lime and straw",
    },
    {
      text: "You do it long enough, and your hands know.",
      context: "On sensing the internal cohesion and tack of the plaster mixture",
    },
    {
      text: "Knowing it doesn't mean you can do it.",
      context: "On the irreducibility of bodily practice to verbal instruction",
    },
  ],
};

export const TECHNIQUES: TechniqueItem[] = [
  {
    id: 'tech-01',
    number: '01',
    title: 'Material Preparation',
    chineseTitle: '材料配制',
    category: 'preparation',
    summary: 'Aging quicklime putty and selecting fiber tensile lengths to avoid shrinkage fractures.',
    description: 'Cao Jin Hui requires slaked lime aged for months to prevent delayed popping. Rice or wheat straw (Cao Jin) is cut into 30–50mm lengths, beaten to loosen fibrous capillaries, and soaked. The fibers provide tensile reinforcement analogous to internal mesh reinforcement.',
    image: ASSET_IMAGES.materialPrep,
    fieldNotes: 'Field observation note: Master Xue determines putty readiness not with a hydrometer, but by rubbing a small lump between thumb and forefinger to verify the complete absence of unslaked core grains.',
    parameters: [
      {
        label: 'Fiber Length',
        optimalRange: '35 – 45 mm',
        sensorSignificance: 'Governs slurry shear resistance during initial trowel contact.',
      },
      {
        label: 'Putty Viscosity',
        optimalRange: 'High shear thinning',
        sensorSignificance: 'Translates to initial static friction spike at stroke initiation.',
      },
    ],
    associatedMotion: 'Trowel Scoop & Load (Low angle scoop with rotational wrist flick)',
  },
  {
    id: 'tech-02',
    number: '02',
    title: 'Mixing and Adjusting',
    chineseTitle: '调合研熟',
    category: 'mixing',
    summary: 'Kneading straw into lime until fibers are uniformly distributed in a multidirectional web.',
    description: 'The physical blending requires vigorous chopping and folding. Insufficient mixing leaves dry straw pockets that rot or cause hollow delamination; over-working can crush fragile fiber capillaries. Craftsmen adjust water drop by drop based on ambient relative humidity.',
    image: ASSET_IMAGES.handPlastering || ASSET_IMAGES.masterXue,
    fieldNotes: 'During autumn recording in Lishui, ambient humidity shifted from 62% at dawn to 44% by noon. The craftsman intuitively misted the mortar board every twenty minutes without referencing hygrometers.',
    parameters: [
      {
        label: 'Fiber Dispersal',
        optimalRange: 'Isotropic 3D web',
        sensorSignificance: 'Determines smooth resistance profile across continuous passes.',
      },
      {
        label: 'Workability Window',
        optimalRange: '40 – 60 minutes',
        sensorSignificance: 'Viscosity slope stiffens progressively as calcium hydroxide begins carbonating.',
      },
    ],
    associatedMotion: 'Figure-Eight Fold & Tamp (Repetitive wrist rocking)',
  },
  {
    id: 'tech-03',
    number: '03',
    title: 'Surface Application',
    chineseTitle: '上墙批刮',
    category: 'application',
    summary: 'Transferring plaster to the vertical wall in sweeping diagonal arcs with calibrated pressure.',
    description: 'The trowel meets the wall at a leading attack angle of roughly 30 degrees. The craftsman leans his entire upper body weight into the blade, maintaining steady kinetic momentum while feathering the trailing edge to blend into preceding courses without seam lines.',
    image: ASSET_IMAGES.handPlastering,
    fieldNotes: 'High-speed capture reveals Master Xue begins each stroke with an upward parabolic arc before flattening his stroke into a lateral sweep, distributing hydraulic pressure evenly across the straw matrix.',
    parameters: [
      {
        label: 'Applied Force',
        optimalRange: '28 – 38 N',
        sensorSignificance: 'Ensures mechanical keying into brick mortar joints without expressing excess water.',
      },
      {
        label: 'Attack Pitch Angle',
        optimalRange: '26° – 32°',
        sensorSignificance: 'Prevents blade leading edge from gouging into substrate.',
      },
    ],
    associatedMotion: 'Parabolic Arc Stroke (Upward-to-lateral sweeping stroke with trailing feathering)',
  },
  {
    id: 'tech-04',
    number: '04',
    title: 'Pressure and Angle Control',
    chineseTitle: '压光收光',
    category: 'control',
    summary: 'Modulating the trowel heel angle as lime loses free moisture to burnish the surface.',
    description: 'During the finish burnishing phase, pressure increases while the angle is flattened to 15–20 degrees. The steel trowel compresses the lime crystals and aligns surface straw fibers parallel to the plane, creating a silky, water-shedding mineral skin.',
    image: ASSET_IMAGES.trowelTechnique,
    fieldNotes: 'Craftsman audio recording caught the distinctive acoustic shift: from a wet suction sound during initial application to a crisp metallic ringing hiss during final compaction.',
    parameters: [
      {
        label: 'Burnish Force',
        optimalRange: '35 – 46 N',
        sensorSignificance: 'Forces microscopic calcium carbonate crystals to consolidate at the perimeter.',
      },
      {
        label: 'Angle Tolerance',
        optimalRange: '18° ± 3°',
        sensorSignificance: 'Zero-tolerance stability prevents scratch lines across hardened surface.',
      },
    ],
    associatedMotion: 'Planar Consolidation Pass (High pressure, low pitch horizontal burnishing)',
  },
];

// Pre-generated reference comparison data (5.0s sequence at 0.1s steps, 51 points)
export const COMPARISON_MASTER_DATA: TelemetryPoint[] = Array.from({ length: 51 }, (_, i) => {
  const t = Number((i * 0.1).toFixed(1));
  const phase = (t / 5.0) * Math.PI * 2;
  // Master: smooth, continuous, controlled pressure rise and tapering
  const pressure = Math.round(28 + 9 * Math.sin(phase - 0.4) + Math.cos(phase * 2) * 1.5);
  // Master: steady controlled angle with deliberate gentle ramp
  const toolAngle = Number((28.5 + 3.2 * Math.sin(phase + 0.2)).toFixed(1));
  // Master: smooth harmonic velocity
  const speed = Math.round(24 + 10 * Math.sin(phase * 1.5));
  // Coordinated arc path
  const x = Number((0.15 + 0.7 * (t / 5.0)).toFixed(3));
  const y = Number((0.6 - 0.25 * Math.sin((t / 5.0) * Math.PI)).toFixed(3));

  return {
    time: t,
    pressure: Math.max(15, pressure),
    toolAngle,
    speed: Math.max(8, speed),
    x,
    y,
    rhythm: 0.94,
  };
});

export const COMPARISON_LEARNER_DATA: TelemetryPoint[] = Array.from({ length: 51 }, (_, i) => {
  const t = Number((i * 0.1).toFixed(1));
  const phase = (t / 5.0) * Math.PI * 2;
  // Learner: jittery, over-correcting pressure spikes, sudden dropouts
  const jitter = (Math.sin(t * 14) * 5.2 + Math.cos(t * 22) * 3.8);
  const pressure = Math.round(24 + 12 * Math.sin(phase) + jitter);
  // Learner: unstable tool angle flipping between steep and shallow
  const toolAngle = Number((27 + 11 * Math.sin(phase * 2.2) + Math.sin(t * 18) * 4.2).toFixed(1));
  // Learner: erratic jerky speeds with pauses
  const speedJitter = Math.sin(t * 11) * 8;
  const speed = Math.round(Math.max(4, 21 + 14 * Math.sin(phase * 1.2) + speedJitter));
  // Unsteady path with micro-wobbles
  const x = Number((0.14 + 0.72 * (t / 5.0) + Math.sin(t * 8) * 0.02).toFixed(3));
  const y = Number((0.62 - 0.22 * Math.sin((t / 5.0) * Math.PI) + Math.cos(t * 10) * 0.03).toFixed(3));

  return {
    time: t,
    pressure: Math.max(8, Math.min(52, pressure)),
    toolAngle: Math.max(12, Math.min(48, toolAngle)),
    speed: Math.max(2, Math.min(48, speed)),
    x,
    y,
    rhythm: 0.58,
  };
});

// Seed default saved sessions in localStorage if empty
export const INITIAL_SAVED_SESSIONS: RecordingSession[] = [
  {
    id: 'rec-001',
    title: 'Master Xue — Arc-Sweep Demonstration',
    date: '2026-10-12 14:22',
    duration: 5.0,
    craftsman: 'Master Xue (Field Reference)',
    technique: 'Surface Application',
    averagePressure: 32.4,
    averageAngle: 29.1,
    averageSpeed: 23.8,
    strokeCount: 4,
    consistencyScore: 94,
    notes: 'Reference trajectory captured during southern wall rendering trial.',
    data: COMPARISON_MASTER_DATA,
  },
  {
    id: 'rec-002',
    title: 'Archive Trial — Apprentice First Pass',
    date: '2026-10-13 09:45',
    duration: 5.0,
    craftsman: 'Learner Cohort B (Fieldwork Participant)',
    technique: 'Pressure & Angle Control',
    averagePressure: 26.8,
    averageAngle: 27.6,
    averageSpeed: 19.4,
    strokeCount: 6,
    consistencyScore: 61,
    notes: 'Notable angle wobble at top of stroke; rapid pressure drop before cornering.',
    data: COMPARISON_LEARNER_DATA,
  },
];
