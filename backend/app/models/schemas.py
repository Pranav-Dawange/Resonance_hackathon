# ============================================
# Clinderma SkinVision — Pydantic Schemas
# Matches the full specification JSON output:
#   acne_severity, lesions[], zone_map{},
#   hyperpigmentation{}, overlays{},
#   progress_tracking{}, heatmap_data{},
#   recommendations{}, analysis_confidence,
#   skin_tone_notes
# ============================================

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict


# ─────────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────────

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float = 0.0


class LandmarksData(BaseModel):
    count: int
    points: List[LandmarkPoint]


class AnalysisOptions(BaseModel):
    detect_lesions: bool = True
    analyze_hyperpigmentation: bool = True
    generate_heatmap: bool = True
    calculate_iga: bool = True
    recommend_skincare: bool = True


class AnalysisRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded JPEG image")
    landmarks: Optional[LandmarksData] = None
    zones: Optional[dict] = None
    options: AnalysisOptions = AnalysisOptions()


# ─────────────────────────────────────────────
# MODULE 1 — ACNE SEVERITY
# ─────────────────────────────────────────────

class AcneSeverityResult(BaseModel):
    grade: str = "Clear"                   # Clear / Mild / Moderate / Severe
    score: int = 0                          # IGA numeric 0–4
    raw_score: float = 0.0                  # Log₂ severity index
    confidence: float = 0.0                # 0–100% model confidence
    key_indicators: List[str] = []          # e.g. ["3 inflammatory lesions", ...]


# ─────────────────────────────────────────────
# MODULE 2 — LESION DETECTION
# ─────────────────────────────────────────────

class LesionItem(BaseModel):
    id: str = ""                            # Unique identifier e.g. "L-001"
    type: str = "comedonal"                 # comedonal / inflammatory / other
    label: str = "Comedonal"
    x: float = 0.0                          # Bounding box as % of image width
    y: float = 0.0                          # Bounding box as % of image height
    width: float = 0.0
    height: float = 0.0
    color: str = "#22C55E"                  # Green=comedonal, Red=inflammatory, Blue=other
    confidence: float = 0.0


class LesionCounts(BaseModel):
    comedonal: int = 0
    inflammatory: int = 0
    other: int = 0
    total: int = 0
    range: str = "0–2"                      # "0–2" / "3–5" / "5–10" / "11–15+"


# ─────────────────────────────────────────────
# MODULE 3 — FACIAL ZONE MAPPING
# ─────────────────────────────────────────────

class ZoneData(BaseModel):
    affected: bool = False
    severity: str = "clear"                 # clear / mild / moderate / severe
    dominant_lesion_type: str = "none"      # comedonal / inflammatory / other / none


# ─────────────────────────────────────────────
# MODULE 4 — HYPERPIGMENTATION
# ─────────────────────────────────────────────

class PigmentedRegion(BaseModel):
    polygon: List[List[float]] = []         # [[x%, y%], ...] outline coordinates
    darkness_score: float = 0.0             # 0–100


class HyperpigmentationResult(BaseModel):
    coverage_pct: float = 0.0
    coverage_range: str = "0–10%"           # "0–10%" / "10–20%" / "20–30%" / "30%+"
    severity: str = "minimal"
    regions: List[PigmentedRegion] = []


# ─────────────────────────────────────────────
# OVERLAYS (visual flags)
# ─────────────────────────────────────────────

class Overlays(BaseModel):
    face_mesh: bool = True
    lesion_boxes: bool = True
    hyperpig_outlines: bool = True
    zone_segmentation: bool = True


# ─────────────────────────────────────────────
# PROGRESS TRACKING — now / short_term / long_term
# ─────────────────────────────────────────────

class ProgressFrame(BaseModel):
    label: str = ""
    timeframe: str = ""
    condition_summary: str = ""
    bullet_points: List[str] = []
    visual_state: str = ""                  # "current" / "improving" / "cleared"


class ProgressTracking(BaseModel):
    now: ProgressFrame = ProgressFrame()
    short_term: ProgressFrame = ProgressFrame()
    long_term: ProgressFrame = ProgressFrame()


# ─────────────────────────────────────────────
# HEATMAP DATA
# ─────────────────────────────────────────────

class HeatmapData(BaseModel):
    base64: Optional[str] = None            # Base64-encoded heatmap image
    color_ramp: str = "green→yellow→red"
    zone_intensities: Dict[str, float] = {} # {"forehead": 0.8, "left_cheek": 0.3 ...}


# ─────────────────────────────────────────────
# SKINCARE RECOMMENDATIONS
# ─────────────────────────────────────────────

class Recommendation(BaseModel):
    ingredient: str
    concentration: str
    evidence: str
    frequency: str
    reason: str


# ─────────────────────────────────────────────
# FULL ANALYSIS RESPONSE
# ─────────────────────────────────────────────

class AnalysisResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    # Module 1
    acne_severity: AcneSeverityResult = AcneSeverityResult()

    # Module 2
    lesions: List[LesionItem] = []
    lesion_counts: LesionCounts = LesionCounts()

    # Module 3
    zone_map: Dict[str, ZoneData] = {}

    # Module 4
    hyperpigmentation: HyperpigmentationResult = HyperpigmentationResult()

    # Overlays
    overlays: Overlays = Overlays()

    # Progress tracking
    progress_tracking: ProgressTracking = ProgressTracking()

    # Heatmap
    heatmap_data: HeatmapData = HeatmapData()

    # Recommendations
    recommendations: List[Recommendation] = []

    # Meta
    analysis_confidence: float = 0.0       # 0–100%
    skin_tone_notes: str = ""
    processing_time_ms: int = 0
    timestamp: str = ""
    model_version: str = "1.0.0-demo"


# ─────────────────────────────────────────────
# Backwards-compat alias kept for internal services
# ─────────────────────────────────────────────
IGAResult = AcneSeverityResult
