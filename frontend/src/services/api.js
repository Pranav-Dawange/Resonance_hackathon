// ============================================
// DermaAI SkinVision — API Service
// FastAPI inference bridge client
// ============================================

import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request timing interceptor ──────────────────────────────
api.interceptors.request.use((config) => {
  config._startTime = performance.now();
  return config;
});

// ── Response interceptor: graceful error handling ────────────
api.interceptors.response.use(
  (response) => {
    const latency = (performance.now() - response.config._startTime).toFixed(0);
    console.log(
      `%c>> API ${response.config.method?.toUpperCase()} ${response.config.url} — ${latency}ms`,
      'color: #22C55E; font-size: 10px;'
    );
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network error — backend is unreachable
      console.warn(
        '%c>> SkinVision: Backend service unreachable. Switching to local demo mode.',
        'color: #FBBF24; font-weight: bold; font-size: 11px;'
      );
      error.isBackendOffline = true;
      error.userMessage = 'Diagnostic engine is in maintenance mode. Using on-device analysis.';
    } else if (error.response.status >= 500) {
      console.error(
        `%c>> SkinVision: Server error ${error.response.status}`,
        'color: #EF4444; font-weight: bold; font-size: 11px;'
      );
      error.userMessage = 'Diagnostic engine encountered an error. Using fallback analysis.';
    }
    return Promise.reject(error);
  }
);

/**
 * Submit an image for full diagnostic analysis
 * @param {string} imageBase64 - Base64-encoded JPEG image
 * @param {Object} landmarks - Facial landmark data from MediaPipe
 * @param {Object} zones - Facial zone mapping
 * @returns {Promise<Object>} Full analysis response
 */
export async function analyzeImage(imageBase64, landmarks = null, zones = null) {
  const response = await api.post('/api/analyze', {
    image: imageBase64,
    landmarks: landmarks ? {
      count: landmarks.length,
      points: landmarks.map(l => ({ x: l.x, y: l.y, z: l.z })),
    } : null,
    zones: zones || null,
    options: {
      detect_lesions: true,
      analyze_hyperpigmentation: true,
      generate_heatmap: true,
      calculate_iga: true,
      recommend_skincare: true,
    },
  });

  return response.data;
}

/**
 * Health check
 */
export async function healthCheck() {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch {
    return { status: 'unreachable' };
  }
}

export default api;
