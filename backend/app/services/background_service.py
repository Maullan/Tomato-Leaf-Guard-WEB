# app/services/background_service.py
import logging
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

logger = logging.getLogger(__name__)

MASK_WORK_SIZE = 512
NEUTRAL_BACKGROUND = (247, 248, 244)


def remove_leaf_background(image_path: str, output_path: str) -> str:
    """
    Buat versi gambar dengan background netral sebelum dikirim ke model.

    Jika segmentasi gagal, fungsi mengembalikan path gambar asli agar diagnosis
    tetap berjalan.
    """
    source = Path(image_path)
    destination = Path(output_path)

    try:
        destination.parent.mkdir(parents=True, exist_ok=True)

        with Image.open(source) as opened_image:
            image = ImageOps.exif_transpose(opened_image).convert("RGB")

        work_image = image.copy()
        work_image.thumbnail((MASK_WORK_SIZE, MASK_WORK_SIZE), Image.Resampling.LANCZOS)

        mask = _build_leaf_mask(work_image)
        if not mask.getbbox():
            logger.warning("Background removal skipped; no leaf-like area found in %s", source)
            return str(source)

        mask = mask.resize(image.size, Image.Resampling.BILINEAR)
        mask = mask.filter(ImageFilter.GaussianBlur(1.5))

        background = Image.new("RGB", image.size, NEUTRAL_BACKGROUND)
        result = Image.composite(image, background, mask)
        result.save(destination, format="JPEG", quality=95, optimize=True)

        return str(destination)
    except Exception as exc:
        logger.error("Background removal failed for %s: %s", source, exc, exc_info=True)
        return str(source)


def _build_leaf_mask(image: Image.Image) -> Image.Image:
    arr = np.asarray(image).astype(np.float32) / 255.0
    red = arr[:, :, 0]
    green = arr[:, :, 1]
    blue = arr[:, :, 2]

    max_channel = arr.max(axis=2)
    min_channel = arr.min(axis=2)
    saturation = (max_channel - min_channel) / np.maximum(max_channel, 1e-6)
    excess_green = (2 * green) - red - blue

    green_leaf = (
        (green > red * 0.85)
        & (green > blue * 0.85)
        & (saturation > 0.10)
        & (max_channel > 0.10)
    )
    yellow_leaf = (
        (red > 0.22)
        & (green > 0.22)
        & (blue < 0.55)
        & (np.abs(red - green) < 0.28)
        & (saturation > 0.12)
    )
    brown_spots = (
        (red > 0.16)
        & (green > 0.10)
        & (blue < 0.35)
        & (red >= green * 0.75)
        & (saturation > 0.16)
    )
    dark_leaf = (
        (max_channel > 0.08)
        & (max_channel < 0.48)
        & (green >= blue * 0.80)
        & (saturation > 0.16)
    )

    mask_array = green_leaf | (excess_green > 0.06) | yellow_leaf | brown_spots | dark_leaf
    mask = Image.fromarray((mask_array.astype(np.uint8)) * 255, mode="L")
    mask = mask.filter(ImageFilter.MedianFilter(5))
    mask = mask.filter(ImageFilter.MinFilter(5))
    mask = _keep_foreground_components(mask)
    mask = mask.filter(ImageFilter.MaxFilter(11))
    mask = mask.filter(ImageFilter.MinFilter(3))
    mask = mask.filter(ImageFilter.MedianFilter(5))

    return mask


def _keep_foreground_components(mask: Image.Image) -> Image.Image:
    arr = np.asarray(mask) > 0
    height, width = arr.shape
    visited = np.zeros_like(arr, dtype=bool)
    output = np.zeros_like(arr, dtype=bool)
    components: list[list[tuple[int, int]]] = []

    for start_y, start_x in zip(*np.nonzero(arr)):
        if visited[start_y, start_x]:
            continue

        queue: deque[tuple[int, int]] = deque([(int(start_y), int(start_x))])
        visited[start_y, start_x] = True
        pixels: list[tuple[int, int]] = []

        while queue:
            y, x = queue.popleft()
            pixels.append((y, x))

            for next_y, next_x in (
                (y - 1, x),
                (y + 1, x),
                (y, x - 1),
                (y, x + 1),
            ):
                if (
                    0 <= next_y < height
                    and 0 <= next_x < width
                    and arr[next_y, next_x]
                    and not visited[next_y, next_x]
                ):
                    visited[next_y, next_x] = True
                    queue.append((next_y, next_x))

        components.append(pixels)

    if not components:
        return mask

    largest_area = max(len(component) for component in components)
    min_area = max(64, int(largest_area * 0.04), int(height * width * 0.002))
    center_left = width * 0.18
    center_right = width * 0.82
    center_top = height * 0.18
    center_bottom = height * 0.82

    center_components = [
        component
        for component in components
        if len(component) >= min_area and _component_overlaps_box(
            component,
            center_left,
            center_top,
            center_right,
            center_bottom,
        )
    ]

    selected_components = center_components or [
        component
        for component in components
        if len(component) >= min_area
    ]

    for component in selected_components:
        ys, xs = zip(*component)
        output[ys, xs] = True

    return Image.fromarray((output.astype(np.uint8)) * 255, mode="L")


def _component_overlaps_box(
    component: list[tuple[int, int]],
    left: float,
    top: float,
    right: float,
    bottom: float,
) -> bool:
    for y, x in component:
        if left <= x <= right and top <= y <= bottom:
            return True

    return False
