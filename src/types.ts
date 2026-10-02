export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

export interface PixelSample {
  x: number
  y: number
  color: Rgba
}

export interface LoadedImage {
  name: string
  type: string
  size: number
  /** Width of the inspected buffer (may be downscaled). */
  width: number
  /** Height of the inspected buffer (may be downscaled). */
  height: number
  originalWidth: number
  originalHeight: number
  downscaled: boolean
  buffer: Uint8ClampedArray
  /** Offscreen canvas holding the buffer at its inspected resolution. */
  source: HTMLCanvasElement
}

export interface FitRect {
  scale: number
  drawW: number
  drawH: number
  offsetX: number
  offsetY: number
  imgW: number
  imgH: number
}
