# ============================================
# Clinderma SkinVision — IGA / Acne Severity Calculator
# Logarithmic severity scoring on the IGA 0-4 scale
# Returns AcneSeverityResult matching the full spec
# ============================================

import math
from app.models.schemas import AcneSeverityResult


IGA_GRADES = {
    0: "Clear",
    1: "Almost Clear",
    2: "Mild",
    3: "Moderate",
    4: "Severe",
}

# Clinical threshold boundaries (logarithmic scale)
IGA_THRESHOLDS = [0.5, 2.0, 3.5, 5.0]

# Confidence heuristics per grade (demo — replace with model probability when pkl available)
GRADE_BASE_CONFIDENCE = {0: 92.0, 1: 85.0, 2: 88.0, 3: 84.0, 4: 81.0}


def calculate_iga(
    comedonal_count: int,
    inflammatory_count: int,
    other_count: int = 0,
    hyperpig_coverage: float = 0.0,
) -> AcneSeverityResult:
    """
    Calculate IGA score using logarithmic severity.

    Formula:
        raw_score = log2(1 + I * 2.5 + C * 1.0 + O * 0.5) + hyperpig_coverage * 0.1

    Why logarithmic:
    - The clinical difference between 0→5 lesions is far more significant
      than 30→35 lesions.
    - Weight factors: Inflammatory (2.5x) > Comedonal (1.0x) > Other (0.5x)

    IGA Mapping:
    - 0 (Clear):        raw < 0.5
    - 1 (Almost Clear): 0.5 ≤ raw < 2.0
    - 2 (Mild):         2.0 ≤ raw < 3.5
    - 3 (Moderate):     3.5 ≤ raw < 5.0
    - 4 (Severe):       raw ≥ 5.0
    """
    total = comedonal_count + inflammatory_count + other_count

    # Weighted lesion contribution
    weighted_sum = (
        inflammatory_count * 2.5 +
        comedonal_count * 1.0 +
        other_count * 0.5
    )

    # Logarithmic transformation
    lesion_score = math.log2(1 + weighted_sum)

    # Hyperpigmentation modifier
    hyperpig_modifier = hyperpig_coverage * 0.1

    raw_score = lesion_score + hyperpig_modifier

    # Map to IGA 0-4
    iga_score = 0
    for i, threshold in enumerate(IGA_THRESHOLDS):
        if raw_score >= threshold:
            iga_score = i + 1
        else:
            break
    iga_score = min(4, iga_score)

    grade = IGA_GRADES[iga_score]

    # Build key indicators list
    indicators = []
    if inflammatory_count > 0:
        indicators.append(f"{inflammatory_count} inflammatory lesion{'s' if inflammatory_count > 1 else ''}")
    if comedonal_count > 0:
        indicators.append(f"{comedonal_count} comedonal lesion{'s' if comedonal_count > 1 else ''}")
    if other_count > 0:
        indicators.append(f"{other_count} other lesion{'s' if other_count > 1 else ''}")
    if hyperpig_coverage > 5:
        indicators.append(f"{hyperpig_coverage:.1f}% hyperpigmentation coverage")
    if total == 0:
        indicators.append("No lesions detected")

    # Confidence — modulated by lesion count clarity
    base_conf = GRADE_BASE_CONFIDENCE[iga_score]
    # Slight penalty when counts are near threshold boundaries
    boundary_penalty = 0.0
    if total > 0:
        normalized = raw_score / 5.0
        boundary_penalty = abs((normalized % 0.25) - 0.125) * 10  # max ~1.25 penalty
    confidence = round(min(99.0, base_conf - boundary_penalty), 1)

    return AcneSeverityResult(
        grade=grade,
        score=iga_score,
        raw_score=round(raw_score, 4),
        confidence=confidence,
        key_indicators=indicators,
    )
