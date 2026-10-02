import { describe, expect, it } from 'vitest'
import { fitRect, mapPointToSource, readPixel } from '../geometry'

describe('fitRect', () => {
  it('letterboxes a square image in a wide container', () => {
    const fit = fitRect(200, 100, 100, 100)
    expect(fit.scale).toBe(1)
    expect(fit.drawW).toBe(100)
    expect(fit.drawH).toBe(100)
    expect(fit.offsetX).toBe(50)
    expect(fit.offsetY).toBe(0)
  })

  it('letterboxes a wide image in a square container', () => {
    const fit = fitRect(100, 100, 200, 100)
    expect(fit.scale).toBe(0.5)
    expect(fit.drawW).toBe(100)
    expect(fit.drawH).toBe(50)
    expect(fit.offsetX).toBe(0)
    expect(fit.offsetY).toBe(25)
  })

  it('up-scales small images to fit', () => {
    const fit = fitRect(400, 400, 100, 100)
    expect(fit.scale).toBe(4)
    expect(fit.drawW).toBe(400)
    expect(fit.drawH).toBe(400)
  })

  it('is safe for empty dimensions', () => {
    expect(fitRect(0, 0, 100, 100).drawW).toBe(0)
    expect(fitRect(100, 100, 0, 0).drawW).toBe(0)
  })
})

describe('mapPointToSource', () => {
  it('maps corners of an exact-fit image', () => {
    const fit = fitRect(100, 100, 100, 100)
    expect(mapPointToSource(0, 0, fit)).toEqual({ x: 0, y: 0 })
    expect(mapPointToSource(99.9, 99.9, fit)).toEqual({ x: 99, y: 99 })
  })

  it('accounts for letterbox offsets', () => {
    const fit = fitRect(200, 100, 100, 100)
    expect(mapPointToSource(50, 0, fit)).toEqual({ x: 0, y: 0 })
    expect(mapPointToSource(149.9, 99.9, fit)).toEqual({ x: 99, y: 99 })
  })

  it('returns null outside the drawn image', () => {
    const fit = fitRect(100, 100, 100, 100)
    expect(mapPointToSource(-1, 10, fit)).toBeNull()
    expect(mapPointToSource(10, -1, fit)).toBeNull()
    expect(mapPointToSource(100, 10, fit)).toBeNull()
    expect(mapPointToSource(10, 100, fit)).toBeNull()
  })

  it('round-trips pixel centers under up-scaling', () => {
    const fit = fitRect(400, 400, 100, 100)
    for (const p of [0, 1, 50, 99]) {
      const center = fit.offsetX + (p + 0.5) * fit.scale
      expect(mapPointToSource(center, center, fit)).toEqual({ x: p, y: p })
    }
  })

  it('round-trips pixel centers under down-scaling', () => {
    const fit = fitRect(50, 50, 100, 100)
    for (const p of [0, 1, 50, 99]) {
      const center = fit.offsetX + (p + 0.5) * fit.scale
      expect(mapPointToSource(center, center, fit)).toEqual({ x: p, y: p })
    }
  })
})

describe('readPixel', () => {
  const buffer = new Uint8ClampedArray([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  ])

  it('reads the correct channel offset', () => {
    expect(readPixel(buffer, 2, 2, 0, 0)).toEqual({ r: 1, g: 2, b: 3, a: 4 })
    expect(readPixel(buffer, 2, 2, 1, 0)).toEqual({ r: 5, g: 6, b: 7, a: 8 })
    expect(readPixel(buffer, 2, 2, 0, 1)).toEqual({ r: 9, g: 10, b: 11, a: 12 })
    expect(readPixel(buffer, 2, 2, 1, 1)).toEqual({ r: 13, g: 14, b: 15, a: 16 })
  })

  it('returns null out of bounds', () => {
    expect(readPixel(buffer, 2, 2, 2, 0)).toBeNull()
    expect(readPixel(buffer, 2, 2, 0, -1)).toBeNull()
  })
})
