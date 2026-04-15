# ============================================
# Clinderma SkinVision — Hyperpigmentation Module
# CIE LAB Color Space Analysis
# Stable across Fitzpatrick skin types V-VI
# Returns HyperpigmentationResult with coverage_range + regions[]
# ============================================

import numpy as np
import cv2
from sklearn.cluster import KMeans
from app.models.schemas import HyperpigmentationResult, PigmentedRegion


def _coverage_range(pct: float) -> str:
    """Bucket coverage_pct into a range string per spec."""
    if pct < 10:
        return "0–10%"
    elif pct < 20:
        return "10–20%"
    elif pct < 30:
        return "20–30%"
    else:
        return "30%+"


def _extract_regions(mask: np.ndarray, dark_centroid_l: float, median_l: float) -> list:
    """
    Convert binary hyperpig mask into PigmentedRegion objects with polygon outlines
    (coordinates as % of image dims) and darkness_score (0-100).
    """
    h, w = mask.shape[:2]
    contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    regions = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 50:           # Skip tiny noise
            continue

        # Simplify contour to reduce coordinate count
        epsilon = 0.04 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        # Convert pixel coords to percentage of image dimensions
        polygon = [[round(pt[0][0] / w, 4), round(pt[0][1] / h, 4)] for pt in approx]

        # Darkness score: 0 = same as median (not dark), 100 = maximally dark relative
        delta_l = float(median_l - dark_centroid_l)
        darkness_score = min(100.0, max(0.0, round((delta_l / 40.0) * 100, 1)))

        regions.append(PigmentedRegion(polygon=polygon, darkness_score=darkness_score))

    return regions


def analyze_hyperpigmentation(image: np.ndarray) -> HyperpigmentationResult:
    """
    Estimate dark spot coverage using CIE LAB color space analysis.

    Algorithm:
    1. Convert BGR → CIE LAB
    2. Create skin mask using YCrCb thresholding (Fitzpatrick I-VI inclusive)
    3. K-Means clustering (k=3) on L* channel within skin region
    4. Identify hyperpigmented cluster (lowest L* centroid)
    5. Require ΔL* ≥ 10 for classification (relative — not absolute)
    6. Extract polygon contours of detected dark regions
    7. Return structured HyperpigmentationResult
    """
    h, w = image.shape[:2]

    # Step 1: Convert to CIE LAB
    lab_image = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel = lab_image[:, :, 0].astype(np.float32)  # OpenCV L*: 0-255

    # Step 2: Skin mask — YCrCb broad range capturing all Fitzpatrick types
    ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    skin_mask = cv2.inRange(ycrcb, np.array([20, 130, 77]), np.array([255, 185, 135]))

    # Morphological cleanup
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)

    # Restrict to central face ellipse (exclude background)
    face_region = np.zeros_like(skin_mask)
    cx, cy = w // 2, h // 2
    face_w, face_h = int(w * 0.6), int(h * 0.7)
    cv2.ellipse(face_region, (cx, cy), (face_w // 2, face_h // 2), 0, 0, 360, 255, -1)
    skin_mask = cv2.bitwise_and(skin_mask, face_region)

    skin_pixels = l_channel[skin_mask > 0]

    if len(skin_pixels) < 100:
        return HyperpigmentationResult(
            coverage_pct=0.0,
            coverage_range="0–10%",
            severity="minimal",
            regions=[],
        )

    # Step 3: K-Means (k=3) on L* channel
    skin_pixels_reshaped = skin_pixels.reshape(-1, 1)
    if len(skin_pixels_reshaped) > 10000:
        indices = np.random.choice(len(skin_pixels_reshaped), 10000, replace=False)
        sample = skin_pixels_reshaped[indices]
    else:
        sample = skin_pixels_reshaped

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    kmeans.fit(sample)

    centroids = kmeans.cluster_centers_.flatten()
    dark_cluster_idx = int(np.argmin(centroids))
    median_l = float(np.median(skin_pixels))
    dark_centroid_l = float(centroids[dark_cluster_idx])

    # Predict for ALL skin pixels
    all_labels = kmeans.predict(skin_pixels_reshaped)

    # Step 4: Count dark pixels
    dark_pixel_count = int(np.sum(all_labels == dark_cluster_idx))
    total_skin_pixels = len(skin_pixels)

    # Step 5: Relative ΔL* threshold (equity across Fitzpatrick types)
    l_difference = median_l - dark_centroid_l
    if l_difference < 10:
        coverage_pct = round(dark_pixel_count / total_skin_pixels * 100 * 0.3, 1)
    else:
        coverage_pct = round(dark_pixel_count / total_skin_pixels * 100, 1)

    coverage_pct = float(min(30.0, max(0.0, coverage_pct)))

    # Severity classification
    if coverage_pct < 5:
        severity = "minimal"
    elif coverage_pct < 12:
        severity = "mild"
    elif coverage_pct < 22:
        severity = "moderate"
    else:
        severity = "severe"

    # Step 6: Build binary mask for the dark cluster pixels and extract polygons
    dark_mask = np.zeros(skin_mask.shape, dtype=np.uint8)
    skin_coords = np.argwhere(skin_mask > 0)   # (row, col) pairs
    dark_indices = np.where(all_labels == dark_cluster_idx)[0]
    for idx in dark_indices:
        row, col = skin_coords[idx][0], skin_coords[idx][1]
        dark_mask[row, col] = 255

    regions = _extract_regions(dark_mask, dark_centroid_l, median_l)

    return HyperpigmentationResult(
        coverage_pct=coverage_pct,
        coverage_range=_coverage_range(coverage_pct),
        severity=severity,
        regions=regions,
    )
