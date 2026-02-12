
export interface DriftReport {
  id: string;
  timestamp: number;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INFO';
  component: string;
  description: string;
  suggestion: string;
  confidence?: number; // 0-100
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'done' | 'error';
  summary: string;
}

// Helper types for Audio
export interface AudioBufferData {
  buffer: AudioBuffer;
  duration: number;
}
