import type { Rgba } from '../types'

const clampByte = (value: number): number =>
  Math.max(0, Math.min(255, Math.round(value)))

const toHexByte = (value: number): string =>
  clampByte(value).toString(16).padStart(2, '0').toUpperCase()

const percent = (value: number): number => Math.round(value * 100)

const degrees = (value: number): number => Math.round(value)

/** Alpha (0-255) as a trimmed 0-1 number, e.g. 128 -> 0.502. */
export function formatAlpha(a: number): number {
  return Math.round((clampByte(a) / 255) * 1000) / 1000
}

/** `#RRGGBB` (alpha ignored). */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`
}

/** `#RRGGBBAA`, only meaningful when a pixel has alpha. */
export function rgbaToHex8({ r, g, b, a }: Rgba): string {
  return `${rgbToHex(r, g, b)}${toHexByte(a)}`
}

export interface Hsl {
  h: number
  s: number
  l: number
}

export interface Hsv {
  h: number
  s: number
  v: number
}

export interface Cmyk {
  c: number
  m: number
  y: number
  k: number
}

function hue(rN: number, gN: number, bN: number, max: number, delta: number): number {
  if (delta === 0) return 0
  let h: number
  if (max === rN) h = ((gN - bN) / delta) % 6
  else if (max === gN) h = (bN - rN) / delta + 2
  else h = (rN - gN) / delta + 4
  h *= 60
  if (h < 0) h += 360
  return h
}

/** HSL with h in [0, 360), s/l in [0, 1]. */
export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rN = clampByte(r) / 255
  const gN = clampByte(g) / 255
  const bN = clampByte(b) / 255
  const max = Math.max(rN, gN, bN)
  const min = Math.min(rN, gN, bN)
  const delta = max - min
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  return { h: hue(rN, gN, bN, max, delta), s, l }
}

/** HSV/HSB with h in [0, 360), s/v in [0, 1]. */
export function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rN = clampByte(r) / 255
  const gN = clampByte(g) / 255
  const bN = clampByte(b) / 255
  const max = Math.max(rN, gN, bN)
  const min = Math.min(rN, gN, bN)
  const delta = max - min
  const s = max === 0 ? 0 : delta / max
  return { h: hue(rN, gN, bN, max, delta), s, v: max }
}

/** CMYK with each channel in [0, 1]. */
export function rgbToCmyk(r: number, g: number, b: number): Cmyk {
  const rN = clampByte(r) / 255
  const gN = clampByte(g) / 255
  const bN = clampByte(b) / 255
  const k = 1 - Math.max(rN, gN, bN)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 1 }
  const c = (1 - rN - k) / (1 - k)
  const m = (1 - gN - k) / (1 - k)
  const y = (1 - bN - k) / (1 - k)
  return { c, m, y, k }
}

export function formatRgb({ r, g, b }: Rgba): string {
  return `rgb(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)})`
}

export function formatRgba({ r, g, b, a }: Rgba): string {
  return `rgba(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)}, ${formatAlpha(a)})`
}

export function formatHsl({ r, g, b }: Rgba): string {
  const { h, s, l } = rgbToHsl(r, g, b)
  return `hsl(${degrees(h)}, ${percent(s)}%, ${percent(l)}%)`
}

export function formatHsla({ r, g, b, a }: Rgba): string {
  const { h, s, l } = rgbToHsl(r, g, b)
  return `hsla(${degrees(h)}, ${percent(s)}%, ${percent(l)}%, ${formatAlpha(a)})`
}

export function formatHsv({ r, g, b }: Rgba): string {
  const { h, s, v } = rgbToHsv(r, g, b)
  return `hsv(${degrees(h)}, ${percent(s)}%, ${percent(v)}%)`
}

export function formatCmyk({ r, g, b }: Rgba): string {
  const { c, m, y, k } = rgbToCmyk(r, g, b)
  return `cmyk(${percent(c)}%, ${percent(m)}%, ${percent(y)}%, ${percent(k)}%)`
}

/** CSS color usable for swatches (keeps alpha). */
export function toCssColor({ r, g, b, a }: Rgba): string {
  return `rgba(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)}, ${formatAlpha(a)})`
}
