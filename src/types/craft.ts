export interface TelemetryPoint {
  time: number; // in seconds
  pressure: number; // in Newtons (N)
  toolAngle: number; // in degrees (°)
  speed: number; // in cm/s
  x: number; // normalized 0..1 or pixel coord
  y: number; // normalized 0..1 or pixel coord
  rhythm?: number;
}

export interface RecordingSession {
  id: string;
  title: string;
  date: string;
  duration: number; // in seconds
  craftsman: string;
  technique: string;
  averagePressure: number;
  averageAngle: number;
  averageSpeed: number;
  strokeCount: number;
  consistencyScore: number;
  data: TelemetryPoint[];
  notes?: string;
}

export interface TechniqueItem {
  id: string;
  number: string;
  title: string;
  chineseTitle: string;
  category: 'preparation' | 'mixing' | 'application' | 'control';
  summary: string;
  description: string;
  image: string;
  fieldNotes: string;
  parameters: {
    label: string;
    optimalRange: string;
    sensorSignificance: string;
  }[];
  associatedMotion: string;
}

export interface PracticeStrokeRecord {
  points: { x: number; y: number; pressure: number; angle: number; timestamp: number }[];
  avgPressure: number;
  avgAngle: number;
  avgSpeed: number;
  duration: number;
}
