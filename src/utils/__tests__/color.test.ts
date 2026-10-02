import { describe, expect, it } from 'vitest'
import {
  formatAlpha,
  formatCmyk,
  formatHsl,
  formatHsla,
  formatHsv,
  formatRgb,
  formatRgba,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbaToHex8,
} from '../color'

const accent = { r: 238, g: 90, b: 41, a: 255 } // #ee5a29

describe('hex', () => {
  it('formats #ee5a29', () => {
    expect(rgbToHex(238, 90, 41)).toBe('#EE5A29')
  })

  it('pads single-digit channels', () => {
    expect(rgbToHex(0, 5, 16)).toBe('#000510')
  })

  it('includes alpha in hex8', () => {
    expect(rgbaToHex8({ r: 238, g: 90, b: 41, a: 128 })).toBe('#EE5A2980')
  })
})

describe('rgb / rgba', () => {
  it('formats rgb', () => {
    expect(formatRgb(accent)).toBe('rgb(238, 90, 41)')
  })

  it('formats rgba with trimmed alpha', () => {
    expect(formatRgba({ ...accent, a: 128 })).toBe('rgba(238, 90, 41, 0.502)')
    expect(formatRgba({ ...accent, a: 255 })).toBe('rgba(238, 90, 41, 1)')
    expect(formatRgba({ ...accent, a: 0 })).toBe('rgba(238, 90, 41, 0)')
  })
})

describe('hsl', () => {
  it('converts the accent color', () => {
    const { h, s, l } = rgbToHsl(238, 90, 41)
    expect(Math.round(h)).toBe(15)
    expect(Math.round(s * 100)).toBe(85)
    expect(Math.round(l * 100)).toBe(55)
    expect(formatHsl(accent)).toBe('hsl(15, 85%, 55%)')
  })

  it('handles pure colors', () => {
    expect(formatHsl({ r: 255, g: 0, b: 0, a: 255 })).toBe('hsl(0, 100%, 50%)')
    expect(formatHsl({ r: 0, g: 255, b: 0, a: 255 })).toBe('hsl(120, 100%, 50%)')
    expect(formatHsl({ r: 0, g: 0, b: 255, a: 255 })).toBe('hsl(240, 100%, 50%)')
  })

  it('handles gray (zero saturation)', () => {
    expect(formatHsl({ r: 128, g: 128, b: 128, a: 255 })).toBe('hsl(0, 0%, 50%)')
  })
})

describe('hsla', () => {
  it('appends trimmed alpha', () => {
    expect(formatHsla({ ...accent, a: 128 })).toBe('hsla(15, 85%, 55%, 0.502)')
  })
})

describe('hsv / hsb', () => {
  it('converts the accent color', () => {
    const { h, s, v } = rgbToHsv(238, 90, 41)
    expect(Math.round(h)).toBe(15)
    expect(Math.round(s * 100)).toBe(83)
    expect(Math.round(v * 100)).toBe(93)
    expect(formatHsv(accent)).toBe('hsv(15, 83%, 93%)')
  })

  it('handles black and white', () => {
    expect(formatHsv({ r: 0, g: 0, b: 0, a: 255 })).toBe('hsv(0, 0%, 0%)')
    expect(formatHsv({ r: 255, g: 255, b: 255, a: 255 })).toBe('hsv(0, 0%, 100%)')
  })

  it('handles pure colors', () => {
    expect(formatHsv({ r: 255, g: 0, b: 0, a: 255 })).toBe('hsv(0, 100%, 100%)')
  })
})

describe('cmyk', () => {
  it('converts the accent color', () => {
    const { c, m, y, k } = rgbToCmyk(238, 90, 41)
    expect(Math.round(c * 100)).toBe(0)
    expect(Math.round(m * 100)).toBe(62)
    expect(Math.round(y * 100)).toBe(83)
    expect(Math.round(k * 100)).toBe(7)
    expect(formatCmyk(accent)).toBe('cmyk(0%, 62%, 83%, 7%)')
  })

  it('handles full black via the k === 1 branch', () => {
    expect(formatCmyk({ r: 0, g: 0, b: 0, a: 255 })).toBe('cmyk(0%, 0%, 0%, 100%)')
  })

  it('handles white', () => {
    expect(formatCmyk({ r: 255, g: 255, b: 255, a: 255 })).toBe('cmyk(0%, 0%, 0%, 0%)')
  })
})

describe('formatAlpha', () => {
  it('rounds to three decimals', () => {
    expect(formatAlpha(255)).toBe(1)
    expect(formatAlpha(0)).toBe(0)
    expect(formatAlpha(128)).toBe(0.502)
    expect(formatAlpha(64)).toBe(0.251)
  })
})
