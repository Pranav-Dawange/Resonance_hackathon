// ============================================
// DermaAI SkinVision — Canvas Drawing Utilities
// 3D Wireframe + Zone Overlay Rendering
// ============================================

import { FACIAL_ZONES } from './facialZones';

// MediaPipe Face Mesh tessellation connections (subset for wireframe)
// These are the triangle edges that form the 3D wireframe mesh
const FACE_MESH_TESSELATION = [
  [127, 34], [34, 139], [139, 127], [11, 0], [0, 37], [37, 11],
  [232, 231], [231, 120], [120, 232], [72, 37], [37, 39], [39, 72],
  [128, 121], [121, 47], [47, 128], [232, 121], [121, 128], [128, 232],
  [104, 69], [69, 67], [67, 104], [175, 171], [171, 148], [148, 175],
  [118, 50], [50, 101], [101, 118], [73, 39], [39, 40], [40, 73],
  [9, 151], [151, 108], [108, 9], [48, 115], [115, 131], [131, 48],
  [194, 204], [204, 211], [211, 194], [74, 40], [40, 185], [185, 74],
  [80, 42], [42, 183], [183, 80], [40, 92], [92, 186], [186, 40],
  [230, 229], [229, 118], [118, 230], [202, 212], [212, 214], [214, 202],
  [83, 18], [18, 17], [17, 83], [76, 61], [61, 146], [146, 76],
  [160, 29], [29, 30], [30, 160], [56, 157], [157, 173], [173, 56],
  [106, 204], [204, 194], [194, 106], [135, 214], [214, 192], [192, 135],
  [203, 165], [165, 98], [98, 203], [21, 71], [71, 68], [68, 21],
  [51, 45], [45, 4], [4, 51], [144, 24], [24, 23], [23, 144],
  [77, 146], [146, 91], [91, 77], [205, 50], [50, 187], [187, 205],
  [201, 200], [200, 18], [18, 201], [91, 106], [106, 182], [182, 91],
  [90, 91], [91, 181], [181, 90], [85, 84], [84, 17], [17, 85],
  [206, 203], [203, 36], [36, 206], [148, 171], [171, 152], [152, 148],
  [219, 218], [218, 79], [79, 219], [42, 80], [80, 81], [81, 42],
  [195, 3], [3, 51], [51, 195], [43, 146], [146, 61], [61, 43],
  [171, 175], [175, 199], [199, 171],
  [81, 82], [82, 38], [38, 81], [53, 46], [46, 225], [225, 53],
  [144, 163], [163, 110], [110, 144], [52, 65], [65, 66], [66, 52],
  [229, 228], [228, 117], [117, 229],
  [57, 43], [43, 36], [36, 57], [182, 135], [135, 76], [76, 182],
  [245, 122], [122, 6], [6, 245], [351, 465], [465, 412], [412, 351],
  [306, 291], [291, 361], [361, 306],
];

/**
 * Draw the 3D wireframe mesh overlay
 */
export function drawFaceMesh(ctx, landmarks, width, height, options = {}) {
  const {
    meshColor = 'rgba(37, 99, 235, 0.15)',
    meshStroke = 'rgba(37, 99, 235, 0.35)',
    pointColor = 'rgba(37, 99, 235, 0.6)',
    lineWidth = 0.5,
    showPoints = false,
    showMesh = true,
  } = options;

  if (!landmarks || landmarks.length === 0) return;

  ctx.save();

  // Draw tessellation lines (wireframe)
  if (showMesh) {
    ctx.strokeStyle = meshStroke;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = 0.6;

    ctx.beginPath();
    for (const [startIdx, endIdx] of FACE_MESH_TESSELATION) {
      if (landmarks[startIdx] && landmarks[endIdx]) {
        const startX = landmarks[startIdx].x * width;
        const startY = landmarks[startIdx].y * height;
        const endX = landmarks[endIdx].x * width;
        const endY = landmarks[endIdx].y * height;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
      }
    }
    ctx.stroke();
  }

  // Draw key landmark points
  if (showPoints) {
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = pointColor;
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * width;
      const y = landmarks[i].y * height;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draw facial zone overlays
 */
export function drawZoneOverlays(ctx, landmarks, width, height, activeZone = null) {
  if (!landmarks || landmarks.length === 0) return;

  ctx.save();

  for (const [zoneName, zone] of Object.entries(FACIAL_ZONES)) {
    const points = zone.indices
      .filter(idx => landmarks[idx])
      .map(idx => ({
        x: landmarks[idx].x * width,
        y: landmarks[idx].y * height,
      }));

    if (points.length < 3) continue;

    const isActive = activeZone === zoneName;

    // Draw zone polygon
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    // Fill
    ctx.globalAlpha = isActive ? 0.4 : 0.15;
    ctx.fillStyle = zone.color;
    ctx.fill();

    // Stroke
    ctx.globalAlpha = isActive ? 0.8 : 0.3;
    ctx.strokeStyle = zone.strokeColor;
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.stroke();

    // Label
    if (isActive) {
      const centerX = points.reduce((s, p) => s + p.x, 0) / points.length;
      const centerY = points.reduce((s, p) => s + p.y, 0) / points.length;

      ctx.globalAlpha = 1;
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = zone.strokeColor;
      ctx.textAlign = 'center';
      ctx.fillText(zone.label, centerX, centerY);
    }
  }

  ctx.restore();
}

/**
 * Draw lesion bounding boxes with color coding
 */
export function drawLesionBoxes(ctx, lesions, width, height) {
  if (!lesions || lesions.length === 0) return;

  ctx.save();

  for (const lesion of lesions) {
    const x = lesion.x * width;
    const y = lesion.y * height;
    const w = lesion.width * width;
    const h = lesion.height * height;
    const color = lesion.color || '#3B82F6';

    // Bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);

    // Corner accents
    const cornerLen = Math.min(w, h) * 0.25;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h / 2 + cornerLen);
    ctx.lineTo(x - w / 2, y - h / 2);
    ctx.lineTo(x - w / 2 + cornerLen, y - h / 2);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - cornerLen, y - h / 2);
    ctx.lineTo(x + w / 2, y - h / 2);
    ctx.lineTo(x + w / 2, y - h / 2 + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h / 2 - cornerLen);
    ctx.lineTo(x - w / 2, y + h / 2);
    ctx.lineTo(x - w / 2 + cornerLen, y + h / 2);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - cornerLen, y + h / 2);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.lineTo(x + w / 2, y + h / 2 - cornerLen);
    ctx.stroke();

    // Label background
    const label = `${lesion.label} ${(lesion.confidence * 100).toFixed(0)}%`;
    ctx.font = '10px Inter, sans-serif';
    const textWidth = ctx.measureText(label).width;

    ctx.globalAlpha = 0.85;
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2, y - h / 2 - 18, textWidth + 8, 16);

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, x - w / 2 + 4, y - h / 2 - 6);
  }

  ctx.restore();
}

/**
 * Draw scan grid effect (background)
 */
export function drawScanGrid(ctx, width, height, time) {
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 0.5;

  const gridSize = 24;
  const offset = (time * 0.01) % gridSize;

  for (let x = offset; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = offset; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}
