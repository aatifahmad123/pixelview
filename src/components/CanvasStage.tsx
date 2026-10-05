import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { FitRect, LoadedImage, PixelSample } from '../types'
import { fitRect, mapPointToSource, readPixel } from '../utils/geometry'
import Magnifier, { type MagnifierHandle } from './Magnifier'

interface CanvasStageProps {
  image: LoadedImage
  locked: PixelSample | null
  onHover: (sample: PixelSample | null) => void
  onLock: (sample: PixelSample) => void
}

interface Point {
  x: number
  y: number
}

const maxDpr = () => Math.min(window.devicePixelRatio || 1, 3)

function CanvasStage({ image, locked, onHover, onLock }: CanvasStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const magnifierRef = useRef<MagnifierHandle>(null)

  const sizeRef = useRef({ width: 0, height: 0 })
  const fitRef = useRef<FitRect>(fitRect(0, 0, 1, 1))
  const imageRef = useRef(image)
  const lockedRef = useRef(locked)
  const hoverRef = useRef(onHover)
  const lockRef = useRef(onLock)

  const pendingRef = useRef<Point | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastSampleRef = useRef<PixelSample | null>(null)
  const lastHoverPixelRef = useRef<Point | null>(null)
  const touchPlaceRef = useRef<{ point: Point; sample: PixelSample } | null>(null)
  const downPointRef = useRef<Point | null>(null)
  const isTouchRef = useRef(false)

  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    imageRef.current = image
    touchPlaceRef.current = null
    downPointRef.current = null
    magnifierRef.current?.setVisible(false)
  }, [image])
  useEffect(() => {
    lockedRef.current = locked
  }, [locked])
  useEffect(() => {
    hoverRef.current = onHover
  }, [onHover])
  useEffect(() => {
    lockRef.current = onLock
  }, [onLock])

  const renderOverlay = useCallback((cursor: Point | null, sample: PixelSample | null) => {
    const canvas = overlayRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = sizeRef.current
    const dpr = maxDpr()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const fit = fitRef.current
    const drawMarker = (target: PixelSample, pinned: boolean) => {
      const cx = fit.offsetX + (target.x + 0.5) * fit.scale
      const cy = fit.offsetY + (target.y + 0.5) * fit.scale
      const box = Math.max(fit.scale, 9)
      ctx.strokeStyle = pinned ? '#fc6d25' : '#fba326'
      ctx.lineWidth = pinned ? 2 : 1.5
      ctx.strokeRect(cx - box / 2, cy - box / 2, box, box)
      if (pinned) {
        const dot = Math.max(2, Math.min(4, fit.scale))
        ctx.fillStyle = '#fc6d25'
        ctx.fillRect(cx - dot / 2, cy - dot / 2, dot, dot)
      }
    }

    if (cursor) {
      ctx.strokeStyle = 'rgba(96, 78, 139, 0.28)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(Math.round(cursor.x) + 0.5, 0)
      ctx.lineTo(Math.round(cursor.x) + 0.5, height)
      ctx.moveTo(0, Math.round(cursor.y) + 0.5)
      ctx.lineTo(width, Math.round(cursor.y) + 0.5)
      ctx.stroke()
    }

    const pinned = lockedRef.current
    if (pinned) {
      if (sample && sample.x === pinned.x && sample.y === pinned.y) {
        drawMarker(pinned, true)
      } else {
        drawMarker(pinned, true)
        if (sample) drawMarker(sample, false)
      }
    } else if (sample) {
      drawMarker(sample, false)
    }
  }, [])

  const tick = useCallback(() => {
    rafRef.current = null
    const point = pendingRef.current
    const img = imageRef.current
    if (!point || !img) return

    const fit = fitRef.current
    const source = mapPointToSource(point.x, point.y, fit)
    if (!source) {
      lastSampleRef.current = null
      lastHoverPixelRef.current = null
      renderOverlay(point, null)
      magnifierRef.current?.setVisible(false)
      if (!lockedRef.current) hoverRef.current(null)
      return
    }

    const color = readPixel(img.buffer, img.width, img.height, source.x, source.y)
    if (!color) return
    const sample: PixelSample = { x: source.x, y: source.y, color }
    lastSampleRef.current = sample
    renderOverlay(point, sample)

    const magnifier = magnifierRef.current
    if (magnifier) {
      magnifier.draw({
        buffer: img.buffer,
        width: img.width,
        height: img.height,
        x: source.x,
        y: source.y,
      })
      magnifier.move(point.x, point.y, sizeRef.current)
      magnifier.setVisible(true)
    }

    if (!lockedRef.current) {
      const prev = lastHoverPixelRef.current
      if (!prev || prev.x !== source.x || prev.y !== source.y) {
        lastHoverPixelRef.current = { x: source.x, y: source.y }
        hoverRef.current(sample)
      }
    }
  }, [renderOverlay])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const next = { width: rect.width, height: rect.height }
      sizeRef.current = next
      setSize(next)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const base = baseRef.current
    const overlay = overlayRef.current
    if (!base || !overlay || size.width <= 0 || size.height <= 0) return
    const dpr = maxDpr()
    base.width = Math.round(size.width * dpr)
    base.height = Math.round(size.height * dpr)
    overlay.width = Math.round(size.width * dpr)
    overlay.height = Math.round(size.height * dpr)

    const ctx = base.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.width, size.height)

    const fit = fitRect(size.width, size.height, image.width, image.height)
    fitRef.current = fit

    ctx.imageSmoothingEnabled = fit.scale < 1
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image.source, fit.offsetX, fit.offsetY, fit.drawW, fit.drawH)

    ctx.strokeStyle = 'rgba(96, 78, 139, 0.16)'
    ctx.lineWidth = 1
    ctx.strokeRect(fit.offsetX + 0.5, fit.offsetY + 0.5, fit.drawW - 1, fit.drawH - 1)

    renderOverlay(null, lockedRef.current)
  }, [image, size, renderOverlay])

  useEffect(() => {
    if (locked) {
      renderOverlay(null, locked)
    } else {
      touchPlaceRef.current = null
      magnifierRef.current?.setVisible(false)
      renderOverlay(null, null)
    }
  }, [locked, renderOverlay])

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  const pointFromEvent = useCallback(
    (event: { clientX: number; clientY: number }): Point | null => {
      const el = containerRef.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    },
    [],
  )

  const sampleAtPoint = useCallback((point: Point): PixelSample | null => {
    const img = imageRef.current
    if (!img) return null
    const source = mapPointToSource(point.x, point.y, fitRef.current)
    if (!source) return null
    const color = readPixel(img.buffer, img.width, img.height, source.x, source.y)
    if (!color) return null
    return { x: source.x, y: source.y, color }
  }, [])

  const scheduleTick = useCallback(() => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const point = pointFromEvent(event)
      if (!point) return
      isTouchRef.current = event.pointerType === 'touch'
      downPointRef.current = point
      pendingRef.current = point
      scheduleTick()
      if (isTouchRef.current) magnifierRef.current?.setVisible(true)
    },
    [pointFromEvent, scheduleTick],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const point = pointFromEvent(event)
      if (!point) return
      const down = downPointRef.current
      if (down && touchPlaceRef.current && Math.hypot(point.x - down.x, point.y - down.y) > 5) {
        touchPlaceRef.current = null
      }
      pendingRef.current = point
      scheduleTick()
    },
    [pointFromEvent, scheduleTick],
  )

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      pendingRef.current = null
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (event.pointerType === 'touch') {
        const placed = touchPlaceRef.current
        if (placed) {
          magnifierRef.current?.move(placed.point.x, placed.point.y, sizeRef.current)
          renderOverlay(placed.point, placed.sample)
        }
        return
      }
      magnifierRef.current?.setVisible(false)
      lastHoverPixelRef.current = null
    if (lockedRef.current) {
      renderOverlay(null, lockedRef.current)
    } else {
      lastSampleRef.current = null
      renderOverlay(null, null)
      hoverRef.current(null)
    }
  }, [renderOverlay])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const point = pointFromEvent(event)
      if (!point) return
      const sample = sampleAtPoint(point)
      if (!sample) {
        touchPlaceRef.current = null
        return
      }
      if (isTouchRef.current) {
        const placed = touchPlaceRef.current
        if (placed && placed.sample.x === sample.x && placed.sample.y === sample.y) {
          touchPlaceRef.current = null
          lockRef.current(sample)
        } else {
          touchPlaceRef.current = { point, sample }
          lastSampleRef.current = sample
          if (!lockedRef.current) hoverRef.current(sample)
        }
        magnifierRef.current?.setVisible(true)
        magnifierRef.current?.move(point.x, point.y, sizeRef.current)
      } else {
        lockRef.current(sample)
      }
      renderOverlay(point, sample)
    },
    [pointFromEvent, sampleAtPoint, renderOverlay],
  )

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className="checkerboard relative h-full w-full cursor-crosshair touch-none overflow-hidden rounded-none border border-ink/10"
    >
      <canvas ref={baseRef} className="absolute inset-0 h-full w-full" />
      <canvas
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <Magnifier ref={magnifierRef} />
    </div>
  )
}

export default memo(CanvasStage)
