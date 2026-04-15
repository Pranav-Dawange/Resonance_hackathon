# ============================================
# Clinderma SkinVision — Skincare Recommendation Engine
# RAG-Lite: Rule-based evidence-backed suggestions
# ============================================

from app.models.schemas import Recommendation, AcneSeverityResult as IGAResult


# Evidence-based ingredient knowledge base
INGREDIENT_DB = {
    "salicylic_acid": Recommendation(
        ingredient="Salicylic Acid",
        concentration="2%",
        evidence="Strong",
        frequency="Twice daily",
        reason="BHA exfoliant — unclogs pores, dissolves sebum plugs, reduces comedonal lesions",
    ),
    "adapalene": Recommendation(
        ingredient="Adapalene",
        concentration="0.1%",
        evidence="Strong",
        frequency="Nightly",
        reason="Third-gen retinoid — promotes cell turnover, prevents comedone formation, anti-inflammatory",
    ),
    "benzoyl_peroxide": Recommendation(
        ingredient="Benzoyl Peroxide",
        concentration="5%",
        evidence="Strong",
        frequency="Once daily",
        reason="Antimicrobial — kills C. acnes bacteria, reduces inflammation, prevents resistance",
    ),
    "clindamycin": Recommendation(
        ingredient="Clindamycin Phosphate",
        concentration="1%",
        evidence="Moderate",
        frequency="Twice daily",
        reason="Topical antibiotic — targets inflammatory acne bacteria, best combined with BPO",
    ),
    "doxycycline": Recommendation(
        ingredient="Doxycycline",
        concentration="100mg",
        evidence="Strong",
        frequency="Once daily (oral)",
        reason="Systemic antibiotic — for moderate-severe inflammatory acne, anti-inflammatory dose",
    ),
    "niacinamide": Recommendation(
        ingredient="Niacinamide (Vitamin B3)",
        concentration="5%",
        evidence="Moderate",
        frequency="Twice daily",
        reason="Melanin transfer inhibitor — reduces post-inflammatory hyperpigmentation, strengthens barrier",
    ),
    "vitamin_c": Recommendation(
        ingredient="Vitamin C (L-Ascorbic Acid)",
        concentration="15%",
        evidence="Strong",
        frequency="Morning",
        reason="Tyrosinase inhibitor — brightens dark spots, antioxidant protection against UV damage",
    ),
    "azelaic_acid": Recommendation(
        ingredient="Azelaic Acid",
        concentration="20%",
        evidence="Strong",
        frequency="Twice daily",
        reason="Dual-action — reduces hyperpigmentation and provides anti-inflammatory, antibacterial properties",
    ),
    "isotretinoin_referral": Recommendation(
        ingredient="Isotretinoin (Accutane)",
        concentration="Rx only",
        evidence="Strong",
        frequency="Dermatologist referral required",
        reason="Systemic retinoid — reserved for severe/recalcitrant acne. Requires medical supervision.",
    ),
    "spf": Recommendation(
        ingredient="Broad-Spectrum SPF 50+",
        concentration="-",
        evidence="Essential",
        frequency="Every morning + reapply q2h",
        reason="UV protection — prevents PIH darkening, essential during any active treatment",
    ),
    "centella": Recommendation(
        ingredient="Centella Asiatica Extract",
        concentration="5%",
        evidence="Moderate",
        frequency="Twice daily",
        reason="Wound healing — promotes collagen synthesis, reduces inflammation and scarring",
    ),
}


def recommend_skincare(
    iga: IGAResult,
    comedonal_count: int,
    inflammatory_count: int,
    hyperpig_coverage: float,
) -> list[Recommendation]:
    """
    RAG-Lite Skincare Recommendation Engine.
    
    Decision rules based on:
    1. IGA score (overall severity)
    2. Dominant lesion type (comedonal vs inflammatory)
    3. Hyperpigmentation coverage percentage
    
    Returns ordered list of evidence-based recommendations.
    """
    recommendations = []
    dominant = "comedonal" if comedonal_count >= inflammatory_count else "inflammatory"
    
    # ---- IGA 1-2: Mild topical therapy ----
    if iga.score >= 1:
        if dominant == "comedonal":
            recommendations.append(INGREDIENT_DB["salicylic_acid"])
            recommendations.append(INGREDIENT_DB["adapalene"])
        else:
            recommendations.append(INGREDIENT_DB["benzoyl_peroxide"])
    
    # ---- IGA 2-3: Combination therapy ----
    if iga.score >= 2:
        if dominant == "inflammatory":
            recommendations.append(INGREDIENT_DB["clindamycin"])
            if INGREDIENT_DB["adapalene"] not in recommendations:
                recommendations.append(INGREDIENT_DB["adapalene"])
        recommendations.append(INGREDIENT_DB["centella"])
    
    # ---- IGA 3-4: Systemic therapy referral ----
    if iga.score >= 3:
        recommendations.append(INGREDIENT_DB["doxycycline"])
    
    if iga.score >= 4:
        recommendations.append(INGREDIENT_DB["isotretinoin_referral"])
    
    # ---- Hyperpigmentation management ----
    if hyperpig_coverage > 5:
        recommendations.append(INGREDIENT_DB["niacinamide"])
    
    if hyperpig_coverage > 10:
        recommendations.append(INGREDIENT_DB["vitamin_c"])
        recommendations.append(INGREDIENT_DB["azelaic_acid"])
    
    # ---- Always recommend SPF ----
    recommendations.append(INGREDIENT_DB["spf"])
    
    return recommendations
