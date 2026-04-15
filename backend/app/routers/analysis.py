# ============================================
# Clinderma SkinVision — Analysis Router
# POST /api/analyze — Full diagnostic pipeline
# Matches the spec JSON output exactly:
#   acne_severity, lesions[], zone_map{},
#   hyperpigmentation{}, overlays{},
#   progress_tracking{}, heatmap_data{},
#   recommendations{}, analysis_confidence,
#   skin_tone_notes
# ============================================

import time
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    Overlays,
    HeatmapData,
)
from app.utils.image_processing import decode_base64_image, resize_image
from app.services.lesion_detector import detect_lesions
from app.services.hyperpigmentation import analyze_hyperpigmentation
from app.services.iga_calculator import calculate_iga
from app.services.heatmap_generator import generate_heatmap
from app.services.skincare_engine import recommend_skincare
from app.services.zone_mapper import build_zone_map
from app.services.progress_predictor import generate_progress_tracking
from app import database

router = APIRouter()


def _derive_skin_tone_notes(image) -> str:
    """
    Lightweight skin tone detection from mean L* value.
    Returns a note about Fitzpatrick type and confidence adjustments.
    Replace with a proper classifier .pkl when available.
    """
    import cv2, numpy as np
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_mean = float(np.mean(lab[:, :, 0]))
    # OpenCV L* range: 0-255 (maps to CIE 0-100)
    l_cie = l_mean / 255.0 * 100.0

    if l_cie > 75:
        return "Fitzpatrick Type I-II likely. High luminance detected. Thresholds well-calibrated."
    elif l_cie > 60:
        return "Fitzpatrick Type II-III likely. Good contrast range. Thresholds well-calibrated."
    elif l_cie > 48:
        return "Fitzpatrick Type III-IV. Relative ΔL* analysis applied for equity."
    elif l_cie > 35:
        return "Fitzpatrick Type IV-V. Relative ΔL* threshold ensures equitable detection."
    else:
        return "Fitzpatrick Type V-VI. Low absolute L* detected — relative comparison mode active."


def _zone_intensities(zone_map: dict) -> dict:
    """Convert zone severity into a float intensity for the heatmap legend."""
    severity_weights = {"clear": 0.0, "mild": 0.3, "moderate": 0.65, "severe": 1.0}
    return {
        zone: severity_weights.get(data.severity, 0.0)
        for zone, data in zone_map.items()
    }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(request: AnalysisRequest, http_request: Request):
    """
    Full diagnostic analysis pipeline:
    1.  Decode & preprocess image
    2.  Lesion detection (YOLOv11 demo mode → swap .pkl here)
    3.  Facial zone mapping (geometric → swap .pkl here)
    4.  Hyperpigmentation analysis (CIE LAB K-Means)
    5.  IGA / Acne severity scoring (logarithmic)
    6.  Density heatmap generation (Gaussian)
    7.  Progress tracking prediction (rule-based → swap .pkl here)
    8.  Skincare recommendations (RAG-lite)
    9.  Skin tone detection & confidence scoring
    """
    start_time = time.time()

    # ── Step 1: Decode & resize ──────────────────────────────────────────
    try:
        image = decode_base64_image(request.image)
        image = resize_image(image, max_size=640)
        h, w = image.shape[:2]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

    try:
        # ── Step 2: Lesion detection ─────────────────────────────────────
        lesions, lesion_counts = detect_lesions(
            image,
            landmarks=request.landmarks.model_dump() if request.landmarks else None,
        )

        # ── Step 3: Zone mapping ─────────────────────────────────────────
        zone_map = build_zone_map(lesions)

        # ── Step 4: Hyperpigmentation analysis ───────────────────────────
        hyperpig_result = analyze_hyperpigmentation(image)

        # ── Step 5: IGA / Acne severity ──────────────────────────────────
        acne_severity = calculate_iga(
            comedonal_count=lesion_counts.comedonal,
            inflammatory_count=lesion_counts.inflammatory,
            other_count=lesion_counts.other,
            hyperpig_coverage=hyperpig_result.coverage_pct,
        )

        # ── Step 6: Heatmap ──────────────────────────────────────────────
        heatmap_b64 = None
        if request.options.generate_heatmap and lesions:
            lesion_coords = [{"x": l.x, "y": l.y} for l in lesions]
            heatmap_b64 = generate_heatmap(lesion_coords, w, h)

        heatmap_data = HeatmapData(
            base64=heatmap_b64,
            color_ramp="green→yellow→red",
            zone_intensities=_zone_intensities(zone_map),
        )

        # ── Step 7: Progress tracking ─────────────────────────────────────
        progress_tracking = generate_progress_tracking(acne_severity)

        # ── Step 8: Skincare recommendations ─────────────────────────────
        recommendations = recommend_skincare(
            iga=acne_severity,
            comedonal_count=lesion_counts.comedonal,
            inflammatory_count=lesion_counts.inflammatory,
            hyperpig_coverage=hyperpig_result.coverage_pct,
        )

        # ── Step 9: Skin tone & confidence ───────────────────────────────
        skin_tone_notes = _derive_skin_tone_notes(image)
        analysis_confidence = float(acne_severity.confidence)

        processing_time = int((time.time() - start_time) * 1000)
        timestamp = datetime.now(timezone.utc).isoformat()

        response = AnalysisResponse(
            acne_severity=acne_severity,
            lesions=lesions,
            lesion_counts=lesion_counts,
            zone_map=zone_map,
            hyperpigmentation=hyperpig_result,
            overlays=Overlays(
                face_mesh=True,
                lesion_boxes=True,
                hyperpig_outlines=bool(hyperpig_result.regions),
                zone_segmentation=True,
            ),
            progress_tracking=progress_tracking,
            heatmap_data=heatmap_data,
            recommendations=recommendations,
            analysis_confidence=analysis_confidence,
            skin_tone_notes=skin_tone_notes,
            processing_time_ms=processing_time,
            timestamp=timestamp,
            model_version="1.0.0-demo",
        )

        # ── Save to MongoDB (fire-and-forget, never blocks response) ────
        asyncio.ensure_future(_save_scan(http_request, response, timestamp))

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis pipeline error: {str(e)}"
        )


async def _save_scan(http_request: Request, response: AnalysisResponse, timestamp: str):
    """
    Persist a completed scan to MongoDB.
    Fire-and-forget — errors are logged, never raised.
    User identity comes from X-User-ID header (UUID generated by the frontend).
    """
    try:
        user_id = http_request.headers.get("X-User-ID", "anonymous")
        doc = {
            "user_id": user_id,
            "timestamp": timestamp,
            "acne_severity": response.acne_severity.model_dump(),
            "lesion_counts": response.lesion_counts.model_dump(),
            "lesions": [l.model_dump() for l in response.lesions],
            "zone_map": {k: v.model_dump() for k, v in response.zone_map.items()},
            "hyperpigmentation": response.hyperpigmentation.model_dump(),
            "recommendations": [r.model_dump() for r in response.recommendations],
            "analysis_confidence": response.analysis_confidence,
            "skin_tone_notes": response.skin_tone_notes,
            "processing_time_ms": response.processing_time_ms,
            "model_version": response.model_version,
            # heatmap base64 omitted — store in object storage if needed
        }
        result = await database.scans_collection.insert_one(doc)
        print(f"[MongoDB] Scan saved → {result.inserted_id} (user: {user_id})")
    except Exception as e:
        print(f"[MongoDB] Save failed (non-fatal): {e}")
