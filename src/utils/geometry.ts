import type { FitRect } from '../types'

/**
 * Compute how an image of `imgW x imgH` fits inside a `cw x ch` container
 * using "contain" scaling, centered within the container. All values are in
 * CSS pixels of the container's coordinate space.
 */
export function fitRect(cw: number, ch: number, imgW: number, imgH: number): FitRect {
  if (cw <= 0 || ch <= 0 || imgW <= 0 || imgH <= 0) {
    return { scale: 1, drawW: 0, drawH: 0, offsetX: 0, offsetY: 0, imgW, imgH }
  }
  const scale = Math.min(cw / imgW, ch / imgH)
  const drawW = imgW * scale
  const drawH = imgH * scale
  return {
    scale,
    drawW,
    drawH,
    offsetX: (cw - drawW) / 2,
    offsetY: (ch - drawH) / 2,
    imgW,
    imgH,
  }
}

export interface SourcePoint {
  x: number
  y: number
}

/**
 * Map a point in container/CSS-pixel space to integer source pixel
 * coordinates. Returns `null` when the point is outside the drawn image.
 */
export function mapPointToSource(px: number, py: number, fit: FitRect): SourcePoint | null {
  const { scale, drawW, drawH, offsetX, offsetY, imgW, imgH } = fit
  if (drawW <= 0 || drawH <= 0 || scale <= 0) return null
  if (px < offsetX || py < offsetY || px >= offsetX + drawW || py >= offsetY + drawH) {
    return null
  }
  const x = Math.min(imgW - 1, Math.max(0, Math.floor((px - offsetX) / scale)))
  const y = Math.min(imgH - 1, Math.max(0, Math.floor((py - offsetY) / scale)))
  return { x, y }
}

/** Read a pixel from a raw RGBA buffer. Returns null when out of bounds. */
export function readPixel(
  buffer: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
): { r: number; g: number; b: number; a: number } | null {
  if (x < 0 || y < 0 || x >= width || y >= height) return null
  const i = (y * width + x) * 4
  return { r: buffer[i], g: buffer[i + 1], b: buffer[i + 2], a: buffer[i + 3] }
}
