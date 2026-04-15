# ============================================
# Clinderma SkinVision — Lesion Detector (Demo Mode)
# Simulated YOLOv11 inference with realistic output
# Returns: List[LesionItem] (flat) + LesionCounts (with range)
# ============================================

import random
import numpy as np
import cv2
from typing import Tuple, List, Dict
from app.models.schemas import LesionItem, LesionCounts


# ── Lesion type configurations ──────────────────────────────────────────────
LESION_TYPES: Dict[str, dict] = {
    "comedonal": {
        "color": "#22C55E",
        "label": "Comedonal",
        "size_range": (0.02, 0.045),
        "confidence_range": (0.72, 0.95),
    },
    "inflammatory": {
        "color": "#EF4444",
        "label": "Inflammatory",
        "size_range": (0.025, 0.06),
        "confidence_range": (0.68, 0.93),
    },
    "other": {
        "color": "#3B82F6",
        "label": "Other",
        "size_range": (0.015, 0.035),
        "confidence_range": (0.60, 0.88),
    },
}

# ── Facial zone bounding boxes (normalized 0–1 coords) ────────────────────
ZONE_REGIONS: Dict[str, dict] = {
    "forehead":    {"x_range": (0.25, 0.75), "y_range": (0.08, 0.30)},
    "left_cheek":  {"x_range": (0.08, 0.35), "y_range": (0.35, 0.70)},
    "right_cheek": {"x_range": (0.65, 0.92), "y_range": (0.35, 0.70)},
    "nose":        {"x_range": (0.38, 0.62), "y_range": (0.30, 0.55)},
    "chin":        {"x_range": (0.30, 0.70), "y_range": (0.70, 0.90)},
}


def _total_range(total: int) -> str:
    """Convert lesion total to range bucket string."""
    if total <= 2:
        return "0–2"
    elif total <= 5:
        return "3–5"
    elif total <= 10:
        return "5–10"
    else:
        return "11–15+"


def detect_lesions(image: np.ndarray, landmarks: dict = None) -> Tuple[List[LesionItem], LesionCounts]:
    """
    Demo Mode: Simulate YOLOv11 lesion detection.

    In production, swap this function body with:
        model = YOLO("path/to/model.pkl")
        results = model.predict(image, conf=0.25)
        # … map class IDs → LesionItem objects

    Returns:
        (lesions, counts) — flat list + aggregate counts
    """
    h, w = image.shape[:2]

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Texture-based zone scoring to seed plausible detections
    zone_scores: Dict[str, float] = {}
    for zone_name, zone in ZONE_REGIONS.items():
        x1 = int(zone["x_range"][0] * w)
        x2 = int(zone["x_range"][1] * w)
        y1 = int(zone["y_range"][0] * h)
        y2 = int(zone["y_range"][1] * h)
        roi = gray[y1:y2, x1:x2]
        if roi.size > 0:
            laplacian = cv2.Laplacian(roi, cv2.CV_64F)
            zone_scores[zone_name] = float(np.var(laplacian))
        else:
            zone_scores[zone_name] = 0.0

    max_score = max(zone_scores.values()) if zone_scores else 1.0

    lesions: List[LesionItem] = []
    comedonal_count = 0
    inflammatory_count = 0
    other_count = 0

    # Deterministic seed from image stats for demo stability
    seed = int(np.mean(gray)) + int(np.std(gray) * 100)
    rng = random.Random(seed)
    lesion_idx = 1

    for zone_name, zone in ZONE_REGIONS.items():
        score = zone_scores.get(zone_name, 0.0)
        normalized = score / max_score if max_score > 0 else 0.0

        num_lesions = max(0, int(normalized * 3) + rng.randint(0, 2))

        for _ in range(num_lesions):
            # Clinical distribution: comedonal dominant (50%), inflammatory (35%), other (15%)
            type_roll = rng.random()
            if type_roll < 0.50:
                lesion_type = "comedonal"
                comedonal_count += 1
            elif type_roll < 0.85:
                lesion_type = "inflammatory"
                inflammatory_count += 1
            else:
                lesion_type = "other"
                other_count += 1

            config = LESION_TYPES[lesion_type]

            x = rng.uniform(zone["x_range"][0], zone["x_range"][1])
            y = rng.uniform(zone["y_range"][0], zone["y_range"][1])
            size = rng.uniform(*config["size_range"])
            aspect = rng.uniform(0.8, 1.2)

            lesions.append(LesionItem(
                id=f"L-{lesion_idx:03d}",
                type=lesion_type,
                label=config["label"],
                x=round(x, 4),
                y=round(y, 4),
                width=round(size * aspect, 4),
                height=round(size / aspect, 4),
                color=config["color"],
                confidence=round(rng.uniform(*config["confidence_range"]), 3),
            ))
            lesion_idx += 1

    total = comedonal_count + inflammatory_count + other_count

    counts = LesionCounts(
        comedonal=comedonal_count,
        inflammatory=inflammatory_count,
        other=other_count,
        total=total,
        range=_total_range(total),
    )

    return lesions, counts
