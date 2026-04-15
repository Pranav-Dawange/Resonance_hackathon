# ============================================
# Clinderma SkinVision — Image Processing Utilities
# Base64 decode, resize, preprocessing
# ============================================

import base64
import io
import numpy as np
from PIL import Image
import cv2


def decode_base64_image(base64_str: str) -> np.ndarray:
    """
    Decode a base64-encoded image string to a numpy array (BGR format).
    Handles data URI scheme (data:image/jpeg;base64,...) and raw base64.
    """
    # Strip data URI prefix if present
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]

    # Decode base64
    image_bytes = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB numpy array
    if image.mode != "RGB":
        image = image.convert("RGB")

    np_image = np.array(image)

    # Convert RGB to BGR for OpenCV
    bgr_image = cv2.cvtColor(np_image, cv2.COLOR_RGB2BGR)

    return bgr_image


def resize_image(image: np.ndarray, max_size: int = 640) -> np.ndarray:
    """Resize image to fit within max_size while maintaining aspect ratio."""
    h, w = image.shape[:2]
    if max(h, w) <= max_size:
        return image

    scale = max_size / max(h, w)
    new_w = int(w * scale)
    new_h = int(h * scale)

    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def encode_image_base64(image: np.ndarray, fmt: str = ".jpg") -> str:
    """Encode a BGR numpy array to base64 string."""
    _, buffer = cv2.imencode(fmt, image)
    return base64.b64encode(buffer).decode("utf-8")
