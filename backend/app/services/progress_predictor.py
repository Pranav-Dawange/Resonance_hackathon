# ============================================
# Clinderma SkinVision — Progress Predictor
# Generates now / short_term / long_term projections
# Based on current IGA + lesion profile
# Ready to be upgraded with ML regression model (.pkl)
# ============================================

from app.models.schemas import AcneSeverityResult, ProgressTracking, ProgressFrame


# IGA label to plain-English state descriptions
GRADE_DESCRIPTIONS = {
    0: "Skin appears clear with no visible lesions or inflammatory activity.",
    1: "Near-clear skin with minimal non-inflammatory texture.",
    2: "Mild breakout with a few whiteheads and small papules.",
    3: "Moderate acne with several inflamed papules and possible pustules.",
    4: "Severe widespread inflammation with nodular lesions.",
}

SHORT_TERM_MATRIX = {
    0: {
        "summary": "Maintenance phase — skin already clear.",
        "bullets": [
            "Continue current skincare routine",
            "Monitor for early relapse signs",
            "SPF daily to prevent PIH formation",
        ],
        "visual_state": "improving",
    },
    1: {
        "summary": "Skin trending toward clear with consistent care.",
        "bullets": [
            "Expect 1–2 fewer lesions within 4 weeks",
            "Texture smoothing visible by week 6",
            "Mild redness should subside",
        ],
        "visual_state": "improving",
    },
    2: {
        "summary": "Noticeable improvement expected in 4–8 weeks.",
        "bullets": [
            "Comedonal clogging visibly reduced",
            "Inflammation beginning to calm",
            "Expect 30–50% lesion reduction",
            "Hyperpigmentation fading starts",
        ],
        "visual_state": "improving",
    },
    3: {
        "summary": "Moderate improvement with consistent treatment.",
        "bullets": [
            "Active breakout frequency reduces",
            "Inflammatory lesions healing",
            "Possible purge phase in first 2–3 weeks",
            "Begin to see texture evenness",
        ],
        "visual_state": "improving",
    },
    4: {
        "summary": "Gradual reduction in severity with medical care.",
        "bullets": [
            "Nodule size and count reducing",
            "Antibiotic / retinoid effects compounding",
            "Skin barrier stabilisation beginning",
            "Dermatologist follow-up recommended at 4 weeks",
        ],
        "visual_state": "improving",
    },
}

LONG_TERM_MATRIX = {
    0: {
        "summary": "Sustained clear skin maintained.",
        "bullets": [
            "Stable clear baseline maintained",
            "Dark spot residuals fully faded",
            "Robust skin barrier and even tone",
        ],
        "visual_state": "cleared",
    },
    1: {
        "summary": "Projected clear skin in 3 months.",
        "bullets": [
            "Complete lesion clearance expected",
            "Skin tone visibly more even",
            "Pore size minimised with retinoid use",
        ],
        "visual_state": "cleared",
    },
    2: {
        "summary": "Projected clear to almost-clear skin in 3–4 months.",
        "bullets": [
            "Acne severity drops to IGA 0–1",
            "Post-inflammatory marks fading significantly",
            "Skin texture substantially smoother",
            "Consistent routine locks in results",
        ],
        "visual_state": "cleared",
    },
    3: {
        "summary": "Significant improvement to mild range in 4–6 months.",
        "bullets": [
            "IGA grade projected to drop to 1–2",
            "Inflammatory scarring reduced with Vitamin C",
            "Skin barrier strengthened",
            "Hormonal triggers management recommended",
        ],
        "visual_state": "improving",
    },
    4: {
        "summary": "Controlled moderate acne expected at 6 months with treatment.",
        "bullets": [
            "Isotretinoin / systemic therapy achieves 80% clearance",
            "Nodular activity substantially suppressed",
            "Ongoing dermatologist monitoring required",
            "Scarring prevention through early intervention",
        ],
        "visual_state": "improving",
    },
}


def generate_progress_tracking(acne: AcneSeverityResult) -> ProgressTracking:
    """
    Generate a 3-frame progress prediction (now, short_term, long_term)
    from the current IGA severity result.

    To integrate your .pkl regression model:
        projected_short = model.predict([feature_vector])[0]
        projected_long  = model.predict([feature_vector])[1]
    Then replace the matrix lookups below.
    """
    score = acne.score

    now_frame = ProgressFrame(
        label="Current State",
        timeframe="Now",
        condition_summary=GRADE_DESCRIPTIONS.get(score, ""),
        bullet_points=acne.key_indicators or ["Analysis complete"],
        visual_state="current",
    )

    st = SHORT_TERM_MATRIX.get(score, SHORT_TERM_MATRIX[2])
    short_term_frame = ProgressFrame(
        label="Short-Term Outlook",
        timeframe="4–8 weeks",
        condition_summary=st["summary"],
        bullet_points=st["bullets"],
        visual_state=st["visual_state"],
    )

    lt = LONG_TERM_MATRIX.get(score, LONG_TERM_MATRIX[2])
    long_term_frame = ProgressFrame(
        label="Long-Term Projection",
        timeframe="3–6 months",
        condition_summary=lt["summary"],
        bullet_points=lt["bullets"],
        visual_state=lt["visual_state"],
    )

    return ProgressTracking(
        now=now_frame,
        short_term=short_term_frame,
        long_term=long_term_frame,
    )
