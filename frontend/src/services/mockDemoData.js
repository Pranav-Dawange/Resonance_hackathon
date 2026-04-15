// ============================================
// DermaAI SkinVision — Mock Demo Data
// Pre-populated historical scans for "guest_demo_user"
// Updated to match the full spec JSON schema:
//   acne_severity, lesions[], lesion_counts, zone_map,
//   hyperpigmentation, progress_tracking, heatmap_data,
//   overlays, recommendations, analysis_confidence, skin_tone_notes
// ============================================

export const DEMO_USER_ID = 'guest_demo_user';

// Generate realistic demo images (colored canvases with overlays)
function generateDemoImageBase64(label, igaScore) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 640);
  grad.addColorStop(0, '#C4A882');
  grad.addColorStop(0.3, '#D4B896');
  grad.addColorStop(0.7, '#D4B896');
  grad.addColorStop(1, '#B89B78');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 480, 640);

  ctx.beginPath();
  ctx.ellipse(240, 300, 150, 200, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#D9BFA0';
  ctx.fill();
  ctx.strokeStyle = '#C4A882';
  ctx.lineWidth = 2;
  ctx.stroke();

  const lesionCount = igaScore === 4 ? 18 : igaScore === 2 ? 8 : 2;
  const rng = mulberry32(igaScore * 1000 + 42);

  for (let i = 0; i < lesionCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * 120;
    const cx = 240 + Math.cos(angle) * dist;
    const cy = 280 + Math.sin(angle) * dist;
    const radius = 3 + rng() * 5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = rng() > 0.5 ? 'rgba(220, 80, 80, 0.7)' : 'rgba(160, 140, 100, 0.6)';
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 600, 200, 30);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText(label, 20, 620);

  return canvas.toDataURL('image/jpeg', 0.85);
}

function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Lesion item generator ─────────────────────────────────────────────────
function generateLesionItems(count, _severity) {
  const items = [];
  const rng = mulberry32(count * 7 + 13);

  for (let i = 0; i < count; i++) {
    const typeRoll = rng();
    let type, color, label;

    if (typeRoll < 0.4) {
      type = 'comedonal'; color = '#22C55E'; label = 'Comedonal';
    } else if (typeRoll < 0.85) {
      type = 'inflammatory'; color = '#EF4444'; label = 'Inflammatory';
    } else {
      type = 'other'; color = '#3B82F6'; label = 'Other';
    }

    items.push({
      id: `L-${String(i + 1).padStart(3, '0')}`,
      x: 0.25 + rng() * 0.50,
      y: 0.15 + rng() * 0.60,
      width: 0.03 + rng() * 0.025,
      height: 0.03 + rng() * 0.025,
      label,
      type,
      color,
      confidence: parseFloat((0.70 + rng() * 0.25).toFixed(3)),
    });
  }

  return items;
}

// ── Progress tracking helper ────────────────────────────────────────────
function makeProgress(score) {
  const now = {
    0: 'Skin appears clear with no visible lesions.',
    1: 'Near-clear skin with minimal non-inflammatory texture.',
    2: 'Mild breakout with a few whiteheads and small papules.',
    3: 'Moderate acne with several inflamed papules and possible pustules.',
    4: 'Severe widespread inflammation with nodular lesions.',
  };
  return {
    now: {
      label: 'Current State', timeframe: 'Now',
      condition_summary: now[score] || '',
      bullet_points: ['Based on current scan analysis'],
      visual_state: 'current',
    },
    short_term: {
      label: 'Short-Term Outlook', timeframe: '4–8 weeks',
      condition_summary: 'Expect 30–50% lesion reduction with consistent care.',
      bullet_points: ['Reduced breakout frequency', 'Texture smoothing visible by week 6'],
      visual_state: 'improving',
    },
    long_term: {
      label: 'Long-Term Projection', timeframe: '3–6 months',
      condition_summary: 'Projected cleared to mild range.',
      bullet_points: ['Acne severity drops to IGA 0–1', 'Post-inflammatory marks fading'],
      visual_state: 'cleared',
    },
  };
}

// ── SCAN 1 — Day 1: Severe (IGA 4) ────────────────────────────────────────
function createScan1() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  const lesions = generateLesionItems(18, 'severe');

  return {
    id: 'demo_scan_001',
    sessionId: DEMO_USER_ID,
    timestamp: date.toISOString(),
    image: null,
    results: {
      acne_severity: {
        grade: 'Severe', score: 4, raw_score: 5.672, confidence: 81.0,
        key_indicators: ['11 inflammatory lesions', '5 comedonal lesions', '18.4% hyperpigmentation coverage'],
      },
      lesions,
      lesion_counts: { comedonal: 5, inflammatory: 11, other: 2, total: 18, range: '11–15+' },
      zone_map: {
        forehead:    { affected: true,  severity: 'severe',   dominant_lesion_type: 'inflammatory' },
        left_cheek:  { affected: true,  severity: 'moderate', dominant_lesion_type: 'inflammatory' },
        right_cheek: { affected: true,  severity: 'severe',   dominant_lesion_type: 'inflammatory' },
        nose:        { affected: true,  severity: 'mild',     dominant_lesion_type: 'comedonal' },
        chin:        { affected: true,  severity: 'moderate', dominant_lesion_type: 'comedonal' },
        jawline:     { affected: false, severity: 'clear',    dominant_lesion_type: 'none' },
      },
      hyperpigmentation: {
        coverage_pct: 18.4, coverage_range: '10–20%', severity: 'moderate', regions: [],
      },
      overlays: { face_mesh: true, lesion_boxes: true, hyperpig_outlines: true, zone_segmentation: true },
      progress_tracking: makeProgress(4),
      heatmap_data: {
        base64: null, color_ramp: 'green→yellow→red',
        zone_intensities: { forehead: 1.0, left_cheek: 0.65, right_cheek: 1.0, nose: 0.3, chin: 0.65, jawline: 0.0 },
      },
      recommendations: [
        { ingredient: 'Benzoyl Peroxide', concentration: '5%', evidence: 'Strong', frequency: 'Once daily', reason: 'Antimicrobial — kills C. acnes bacteria, reduces inflammation' },
        { ingredient: 'Doxycycline', concentration: '100mg', evidence: 'Strong', frequency: 'Once daily (oral)', reason: 'Systemic antibiotic — for severe inflammatory acne' },
        { ingredient: 'Adapalene', concentration: '0.1%', evidence: 'Strong', frequency: 'Nightly', reason: 'Retinoid — promotes cell turnover, prevents comedone formation' },
        { ingredient: 'Niacinamide (Vitamin B3)', concentration: '5%', evidence: 'Moderate', frequency: 'Twice daily', reason: 'Reduces post-inflammatory hyperpigmentation' },
        { ingredient: 'Broad-Spectrum SPF 50+', concentration: '-', evidence: 'Essential', frequency: 'Every morning', reason: 'UV protection — essential during active treatment' },
      ],
      analysis_confidence: 81.0,
      skin_tone_notes: 'Fitzpatrick Type III-IV. Relative ΔL* analysis applied for equity.',
      processing_time_ms: 623,
      model_version: '1.0.0-demo',
    },
    quality: { lighting_score: 0.72, blur_score: 145 },
    milestone: { label: 'Treatment Started', note: 'Benzoyl Peroxide 5% + Doxycycline 100mg initiated' },
  };
}

// ── SCAN 2 — Day 14: Mild (IGA 2) ─────────────────────────────────────────
function createScan2() {
  const date = new Date();
  date.setDate(date.getDate() - 16);
  const lesions = generateLesionItems(8, 'mild');

  return {
    id: 'demo_scan_002',
    sessionId: DEMO_USER_ID,
    timestamp: date.toISOString(),
    image: null,
    results: {
      acne_severity: {
        grade: 'Mild', score: 2, raw_score: 3.087, confidence: 88.0,
        key_indicators: ['3 inflammatory lesions', '4 comedonal lesions', '11.2% hyperpigmentation coverage'],
      },
      lesions,
      lesion_counts: { comedonal: 4, inflammatory: 3, other: 1, total: 8, range: '5–10' },
      zone_map: {
        forehead:    { affected: true,  severity: 'mild',   dominant_lesion_type: 'comedonal' },
        left_cheek:  { affected: true,  severity: 'mild',   dominant_lesion_type: 'inflammatory' },
        right_cheek: { affected: false, severity: 'clear',  dominant_lesion_type: 'none' },
        nose:        { affected: true,  severity: 'mild',   dominant_lesion_type: 'comedonal' },
        chin:        { affected: false, severity: 'clear',  dominant_lesion_type: 'none' },
        jawline:     { affected: false, severity: 'clear',  dominant_lesion_type: 'none' },
      },
      hyperpigmentation: {
        coverage_pct: 11.2, coverage_range: '10–20%', severity: 'mild', regions: [],
      },
      overlays: { face_mesh: true, lesion_boxes: true, hyperpig_outlines: false, zone_segmentation: true },
      progress_tracking: makeProgress(2),
      heatmap_data: {
        base64: null, color_ramp: 'green→yellow→red',
        zone_intensities: { forehead: 0.3, left_cheek: 0.3, right_cheek: 0.0, nose: 0.3, chin: 0.0, jawline: 0.0 },
      },
      recommendations: [
        { ingredient: 'Salicylic Acid', concentration: '2%', evidence: 'Strong', frequency: 'Twice daily', reason: 'BHA exfoliant — maintains clear pores' },
        { ingredient: 'Adapalene', concentration: '0.1%', evidence: 'Strong', frequency: 'Nightly', reason: 'Continue retinoid for maintenance' },
        { ingredient: 'Vitamin C (L-Ascorbic Acid)', concentration: '15%', evidence: 'Strong', frequency: 'Morning', reason: 'Brightens post-inflammatory dark spots' },
        { ingredient: 'Broad-Spectrum SPF 50+', concentration: '-', evidence: 'Essential', frequency: 'Every morning', reason: 'UV protection — prevents PIH darkening' },
      ],
      analysis_confidence: 88.0,
      skin_tone_notes: 'Fitzpatrick Type III-IV. Relative ΔL* analysis applied for equity.',
      processing_time_ms: 541,
      model_version: '1.0.0-demo',
    },
    quality: { lighting_score: 0.68, blur_score: 162 },
    milestone: { label: 'Doxycycline Stopped', note: 'Switched to maintenance: Salicylic Acid 2% + Vitamin C 15%' },
  };
}

// ── SCAN 3 — Day 30: Almost Clear (IGA 1) ─────────────────────────────────
function createScan3() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const lesions = generateLesionItems(2, 'clear');

  return {
    id: 'demo_scan_003',
    sessionId: DEMO_USER_ID,
    timestamp: date.toISOString(),
    image: null,
    results: {
      acne_severity: {
        grade: 'Almost Clear', score: 1, raw_score: 1.322, confidence: 85.0,
        key_indicators: ['1 inflammatory lesion', '1 comedonal lesion'],
      },
      lesions,
      lesion_counts: { comedonal: 1, inflammatory: 1, other: 0, total: 2, range: '0–2' },
      zone_map: {
        forehead:    { affected: false, severity: 'clear', dominant_lesion_type: 'none' },
        left_cheek:  { affected: true,  severity: 'mild',  dominant_lesion_type: 'comedonal' },
        right_cheek: { affected: false, severity: 'clear', dominant_lesion_type: 'none' },
        nose:        { affected: false, severity: 'clear', dominant_lesion_type: 'none' },
        chin:        { affected: false, severity: 'clear', dominant_lesion_type: 'none' },
        jawline:     { affected: false, severity: 'clear', dominant_lesion_type: 'none' },
      },
      hyperpigmentation: {
        coverage_pct: 4.8, coverage_range: '0–10%', severity: 'minimal', regions: [],
      },
      overlays: { face_mesh: true, lesion_boxes: true, hyperpig_outlines: false, zone_segmentation: true },
      progress_tracking: makeProgress(1),
      heatmap_data: {
        base64: null, color_ramp: 'green→yellow→red',
        zone_intensities: { forehead: 0.0, left_cheek: 0.3, right_cheek: 0.0, nose: 0.0, chin: 0.0, jawline: 0.0 },
      },
      recommendations: [
        { ingredient: 'Adapalene', concentration: '0.1%', evidence: 'Strong', frequency: 'Nightly', reason: 'Maintenance retinoid — prevents recurrence' },
        { ingredient: 'Niacinamide (Vitamin B3)', concentration: '5%', evidence: 'Moderate', frequency: 'Twice daily', reason: 'Fades remaining PIH marks' },
        { ingredient: 'Broad-Spectrum SPF 50+', concentration: '-', evidence: 'Essential', frequency: 'Every morning', reason: 'Long-term UV protection' },
      ],
      analysis_confidence: 85.0,
      skin_tone_notes: 'Fitzpatrick Type III-IV. Good contrast range. Thresholds well-calibrated.',
      processing_time_ms: 487,
      model_version: '1.0.0-demo',
    },
    quality: { lighting_score: 0.78, blur_score: 178 },
    milestone: { label: 'Near Resolution', note: 'Maintenance therapy only — Adapalene + Niacinamide' },
  };
}

// ── Public API ─────────────────────────────────────────────────────────────
let _cachedScans = null;

export function getDemoScans() {
  if (_cachedScans) return _cachedScans;

  const scans = [createScan1(), createScan2(), createScan3()];

  if (typeof document !== 'undefined') {
    scans[0].image = generateDemoImageBase64('Day 1 — Severe', 4);
    scans[1].image = generateDemoImageBase64('Day 14 — Improving', 2);
    scans[2].image = generateDemoImageBase64('Day 30 — Cleared', 1);
  }

  _cachedScans = scans;
  return scans;
}

export function getDemoScanById(id) {
  return getDemoScans().find(s => s.id === id) || null;
}

/**
 * Get chart-ready data points for ProgressChart
 */
export function getDemoChartData() {
  const scans = getDemoScans();
  return scans.map(scan => ({
    date: new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: scan.timestamp,
    igaScore: scan.results.acne_severity.score,
    igaLabel: scan.results.acne_severity.grade,
    lesionCount: scan.results.lesion_counts.total,
    inflammatoryCount: scan.results.lesion_counts.inflammatory,
    hyperpigCoverage: scan.results.hyperpigmentation.coverage_pct,
    milestone: scan.milestone || null,
  }));
}
