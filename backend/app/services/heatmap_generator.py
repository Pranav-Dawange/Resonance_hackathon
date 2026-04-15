# ============================================
# Clinderma SkinVision — Heatmap Generator
# Gaussian density heatmap from lesion coordinates
# ============================================

import numpy as np
import cv2
from app.utils.image_processing import encode_image_base64


def generate_heatmap(
    lesion_coords: list[dict],
    image_width: int,
    image_height: int,
    kernel_size: int = 61,
) -> str:
    """
    Generate a density heatmap from lesion centroid coordinates.
    
    Algorithm:
    1. Create blank canvas matching image dimensions
    2. Place Gaussian kernels at each lesion center
    3. Apply Gaussian blur for smooth density field
    4. Apply JET colormap for visualization
    5. Return base64-encoded heatmap overlay
    """
    # Create blank accumulator
    heatmap = np.zeros((image_height, image_width), dtype=np.float32)
    
    for lesion in lesion_coords:
        cx = int(lesion["x"] * image_width)
        cy = int(lesion["y"] * image_height)
        
        # Clamp to image bounds
        cx = max(0, min(image_width - 1, cx))
        cy = max(0, min(image_height - 1, cy))
        
        # Place point at lesion center
        heatmap[cy, cx] += 1.0
    
    if np.max(heatmap) == 0:
        # No lesions — return empty
        empty = np.zeros((image_height, image_width, 3), dtype=np.uint8)
        return encode_image_base64(empty)
    
    # Apply large Gaussian blur for smooth density field
    heatmap = cv2.GaussianBlur(heatmap, (kernel_size, kernel_size), 0)
    
    # Additional smoothing pass
    heatmap = cv2.GaussianBlur(heatmap, (kernel_size, kernel_size), 0)
    
    # Normalize to 0-255
    heatmap_norm = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX)
    heatmap_uint8 = heatmap_norm.astype(np.uint8)
    
    # Apply JET colormap
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    
    # Make black areas transparent (set to 0 for overlay compositing)
    mask = heatmap_uint8 < 10
    heatmap_colored[mask] = 0
    
    return encode_image_base64(heatmap_colored)
