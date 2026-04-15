// ============================================
// DermaAI SkinVision — Constants
// ============================================

export const COLORS = {
  MEDICAL_BLUE: '#2563EB',
  MEDICAL_BLUE_GLOW: 'rgba(37, 99, 235, 0.4)',
  COMEDONAL: '#22C55E',
  INFLAMMATORY: '#EF4444',
  OTHER: '#3B82F6',
  SURFACE: '#1E293B',
  BASE: '#0F172A',
};

export const IGA_SCALE = [
  { grade: 0, label: 'Clear', description: 'No evidence of acne vulgaris.', color: '#22C55E' },
  { grade: 1, label: 'Almost Clear', description: 'Few scattered comedones, a few small papules.', color: '#86EFAC' },
  { grade: 2, label: 'Mild', description: 'Easily recognizable; less than half the face involved.', color: '#FBBF24' },
  { grade: 3, label: 'Moderate', description: 'More than half the face involved. Many comedones and papules.', color: '#F97316' },
  { grade: 4, label: 'Severe', description: 'Entire face involved. Numerous papules, pustules, and nodules.', color: '#EF4444' },
];

export const QUALITY_THRESHOLDS = {
  MIN_LUMINANCE: 0.30,        // 30% minimum lighting
  MIN_SHARPNESS: 100,         // Laplacian variance threshold
  GOOD_LUMINANCE: 0.50,       // "Good" lighting level
  IDEAL_LUMINANCE: 0.65,      // "Ideal" lighting
};

export const LESION_CLASSES = {
  COMEDONAL: { label: 'Comedonal', color: '#22C55E', icon: '○' },
  INFLAMMATORY: { label: 'Inflammatory', color: '#EF4444', icon: '●' },
  OTHER: { label: 'Other', color: '#3B82F6', icon: '◆' },
};

export const API_BASE_URL = 'http://localhost:8000';

export const SCAN_STAGES = {
  IDLE: 'idle',
  CAPTURING: 'capturing',
  ANALYZING: 'analyzing',
  COMPLETE: 'complete',
  ERROR: 'error',
};

export const FACIAL_ZONE_COLORS = {
  forehead: 'rgba(129, 140, 248, 0.25)',
  leftCheek: 'rgba(52, 211, 153, 0.25)',
  rightCheek: 'rgba(52, 211, 153, 0.25)',
  nose: 'rgba(251, 191, 36, 0.25)',
  chin: 'rgba(248, 113, 113, 0.25)',
};
