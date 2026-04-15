// ============================================
// DermaAI SkinVision — Facial Zone Mapping
// MediaPipe Face Mesh 468 Landmark Index Groups
// ============================================

export const FACIAL_ZONES = {
  forehead: {
    label: 'Forehead',
    color: 'rgba(129, 140, 248, 0.3)',
    strokeColor: '#818CF8',
    // Upper forehead region — clinically significant for comedonal acne
    indices: [10, 109, 108, 69, 67, 103, 104, 68, 338, 337, 299, 296, 332, 333, 297, 338],
    // Convex hull boundary for polygon rendering
    boundary: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
               400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  },
  leftCheek: {
    label: 'Left Cheek',
    color: 'rgba(52, 211, 153, 0.25)',
    strokeColor: '#34D399',
    // Left cheek region — prone to inflammatory lesions
    indices: [123, 147, 187, 207, 206, 216, 192, 213, 210, 212, 202, 204, 194, 186, 92, 165, 167, 164, 393],
    boundary: [123, 50, 101, 100, 47, 114, 188, 122, 6, 351, 465, 357, 277, 352],
  },
  rightCheek: {
    label: 'Right Cheek',
    color: 'rgba(52, 211, 153, 0.25)',
    strokeColor: '#34D399',
    // Right cheek — mirror of left cheek
    indices: [352, 376, 411, 427, 426, 436, 416, 433, 430, 432, 422, 424, 418, 410, 322, 391, 393, 164],
    boundary: [352, 280, 330, 329, 277, 343, 412, 351, 6, 122, 236, 128, 47, 123],
  },
  nose: {
    label: 'Nose',
    color: 'rgba(251, 191, 36, 0.3)',
    strokeColor: '#FBBF24',
    // Nose bridge + tip — common for comedonal & sebaceous activity
    indices: [1, 4, 5, 6, 197, 195, 168, 45, 275, 44, 274, 19, 94, 2],
    boundary: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 0, 267, 269, 270, 409,
               298, 284, 8, 55, 65, 52, 53, 46, 225, 224, 223, 222, 221, 189, 245, 188, 174, 236, 198, 168],
  },
  chin: {
    label: 'Chin',
    color: 'rgba(248, 113, 113, 0.3)',
    strokeColor: '#F87171',
    // Chin / jawline — hormonal acne zone
    indices: [152, 199, 200, 175, 396, 369, 395, 394, 170, 171, 140, 176, 148, 149, 150, 136, 172, 138],
    boundary: [152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454, 356, 389, 251,
               284, 332, 297, 338, 10, 109, 67, 103, 54, 21, 162, 127, 234, 93, 132,
               58, 172, 136, 150, 149, 148, 176],
  },
};

/**
 * Get the bounding box for a facial zone from landmarks
 */
export function getZoneBounds(landmarks, zone) {
  const zoneData = FACIAL_ZONES[zone];
  if (!zoneData || !landmarks) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const idx of zoneData.indices) {
    if (landmarks[idx]) {
      const { x, y } = landmarks[idx];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Get the center point of a zone
 */
export function getZoneCenter(landmarks, zone) {
  const bounds = getZoneBounds(landmarks, zone);
  if (!bounds) return null;
  return {
    x: bounds.minX + bounds.width / 2,
    y: bounds.minY + bounds.height / 2,
  };
}

/**
 * Map all zone polygons for canvas rendering
 */
export function getZonePolygons(landmarks, canvasWidth, canvasHeight) {
  const zones = {};

  for (const [zoneName, zoneData] of Object.entries(FACIAL_ZONES)) {
    const points = zoneData.indices
      .filter(idx => landmarks[idx])
      .map(idx => ({
        x: landmarks[idx].x * canvasWidth,
        y: landmarks[idx].y * canvasHeight,
      }));

    if (points.length > 2) {
      zones[zoneName] = {
        ...zoneData,
        points,
      };
    }
  }

  return zones;
}
