# ============================================
# Clinderma SkinVision — Facial Zone Mapper
# Segments lesions by zone and returns zone_map{}
# Ready for ML model integration (.pkl)
# ============================================

from typing import List, Dict
from app.models.schemas import LesionItem, ZoneData


# Zone bounding boxes (normalized 0–1 image coordinates)
ZONE_BOUNDS: Dict[str, dict] = {
    "forehead":    {"x": (0.25, 0.75), "y": (0.08, 0.30)},
    "left_cheek":  {"x": (0.08, 0.35), "y": (0.35, 0.70)},
    "right_cheek": {"x": (0.65, 0.92), "y": (0.35, 0.70)},
    "nose":        {"x": (0.38, 0.62), "y": (0.30, 0.55)},
    "chin":        {"x": (0.30, 0.70), "y": (0.70, 0.90)},
    "jawline":     {"x": (0.10, 0.90), "y": (0.80, 0.98)},
}


def _lesion_in_zone(lesion: LesionItem, bounds: dict) -> bool:
    """Return True if the lesion centroid falls within the zone bounds."""
    return (
        bounds["x"][0] <= lesion.x <= bounds["x"][1] and
        bounds["y"][0] <= lesion.y <= bounds["y"][1]
    )


def _severity_from_count(count: int, inflammatory: int) -> str:
    """Derive zone severity from lesion count and inflammatory proportion."""
    if count == 0:
        return "clear"
    if inflammatory >= 3 or count >= 5:
        return "severe"
    if inflammatory >= 2 or count >= 3:
        return "moderate"
    if count >= 1:
        return "mild"
    return "clear"


def build_zone_map(lesions: List[LesionItem]) -> Dict[str, ZoneData]:
    """
    Assign each lesion to a facial zone and compute per-zone severity.

    In production, swap with model.predict(zone_roi) from your .pkl.
    The current implementation uses geometric containment + counts.
    """
    zone_map: Dict[str, ZoneData] = {}

    for zone_name, bounds in ZONE_BOUNDS.items():
        zone_lesions = [l for l in lesions if _lesion_in_zone(l, bounds)]

        if not zone_lesions:
            zone_map[zone_name] = ZoneData(
                affected=False,
                severity="clear",
                dominant_lesion_type="none",
            )
            continue

        # Count by type
        type_counts: Dict[str, int] = {"comedonal": 0, "inflammatory": 0, "other": 0}
        for l in zone_lesions:
            t = l.type if l.type in type_counts else "other"
            type_counts[t] += 1

        dominant = max(type_counts, key=type_counts.get)
        inflammatory_count = type_counts["inflammatory"]
        severity = _severity_from_count(len(zone_lesions), inflammatory_count)

        zone_map[zone_name] = ZoneData(
            affected=True,
            severity=severity,
            dominant_lesion_type=dominant,
        )

    return zone_map
