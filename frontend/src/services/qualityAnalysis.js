// ============================================
// DermaAI SkinVision — Quality Analysis (Client-Side)
// Lighting + Blur detection for Clinical Quality Gate
// ============================================

import { QUALITY_THRESHOLDS } from '../utils/constants';

/**
 * Analyze image quality from a canvas or video element
 * Returns lighting score (0-1), blur score, and quality assessment
 */
export function analyzeQuality(source) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Determine source dimensions
  let width, height;
  if (source instanceof HTMLVideoElement) {
    width = source.videoWidth;
    height = source.videoHeight;
  } else if (source instanceof HTMLCanvasElement) {
    width = source.width;
    height = source.height;
  } else {
    width = source.width || source.naturalWidth;
    height = source.height || source.naturalHeight;
  }

  // Downsample for performance (analyze at 160px width)
  const scale = Math.min(1, 160 / width);
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // ---- Luminance Analysis ----
  let totalLuminance = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    // Relative luminance (ITU-R BT.709)
    const luminance = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    totalLuminance += luminance;

    if (luminance < 0.15) darkPixels++;
    if (luminance > 0.85) brightPixels++;
  }

  const avgLuminance = totalLuminance / pixelCount;
  const darkRatio = darkPixels / pixelCount;
  const brightRatio = brightPixels / pixelCount;

  // ---- Blur Detection (Laplacian Variance) ----
  const grayscale = new Float32Array(canvas.width * canvas.height);
  for (let i = 0; i < pixelCount; i++) {
    grayscale[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114);
  }

  let laplacianSum = 0;
  let laplacianCount = 0;
  const w = canvas.width;
  const h = canvas.height;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const laplacian =
        -4 * grayscale[idx] +
        grayscale[idx - 1] +
        grayscale[idx + 1] +
        grayscale[idx - w] +
        grayscale[idx + w];
      laplacianSum += laplacian * laplacian;
      laplacianCount++;
    }
  }

  const sharpness = laplacianSum / laplacianCount;

  // ---- Quality Assessment ----
  const lightingScore = Math.min(1, Math.max(0, avgLuminance / 0.65)); // Normalize to ideal
  const isTooDark = avgLuminance < QUALITY_THRESHOLDS.MIN_LUMINANCE;
  const isTooBright = brightRatio > 0.4;
  const isBlurry = sharpness < QUALITY_THRESHOLDS.MIN_SHARPNESS;

  let status = 'good';
  let message = 'Optimal lighting for clinical analysis';

  if (isTooDark) {
    status = 'danger';
    message = 'Insufficient Light for Clinical Accuracy';
  } else if (isTooBright) {
    status = 'warning';
    message = 'Excessive glare detected — move away from direct light';
  } else if (isBlurry) {
    status = 'warning';
    message = 'Image appears blurry — hold steady or clean the lens';
  } else if (avgLuminance < QUALITY_THRESHOLDS.GOOD_LUMINANCE) {
    status = 'warning';
    message = 'Low lighting — increase room brightness for best results';
  }

  return {
    luminance: avgLuminance,
    lightingScore,
    sharpness,
    darkRatio,
    brightRatio,
    isTooDark,
    isTooBright,
    isBlurry,
    status,     // 'good' | 'warning' | 'danger'
    message,
  };
}

/**
 * Get luminance meter color based on score
 */
export function getLuminanceColor(score) {
  if (score < 0.3) return '#EF4444';   // Red — danger
  if (score < 0.5) return '#F59E0B';   // Amber — warning
  return '#22C55E';                     // Green — good
}
