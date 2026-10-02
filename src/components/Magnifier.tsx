import { forwardRef, useImperativeHandle, useRef } from 'react'

export const MAGNIFIER_SIZE = 144
const CELLS = 13

export interface MagnifierInput {
  buffer: Uint8ClampedArray
  width: number
  height: number
  x: number
  y: number
}

export interface MagnifierHandle {
  draw(input: MagnifierInput): void
  move(x: number, y: number, bounds: { width: number; height: number }): void
  setVisible(visible: boolean): void
}

const OFFSCREEN = 'rgba(96, 78, 139, 0.16)'

const Magnifier = forwardRef<MagnifierHandle>(function Magnifier(_props, ref) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    draw({ buffer, width, height, x, y }) {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const side = Math.round(MAGNIFIER_SIZE * dpr)
      if (canvas.width !== side || canvas.height !== side) {
        canvas.width = side
        canvas.height = side
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, side, side)
      ctx.imageSmoothingEnabled = false

      const cell = side / CELLS
      const half = (CELLS - 1) / 2
      for (let dy = -half; dy <= half; dy += 1) {
        for (let dx = -half; dx <= half; dx += 1) {
          const sx = x + dx
          const sy = y + dy
          if (sx < 0 || sy < 0 || sx >= width || sy >= height) {
            ctx.fillStyle = OFFSCREEN
          } else {
            const i = (sy * width + sx) * 4
            const alpha = buffer[i + 3] / 255
            ctx.fillStyle = `rgba(${buffer[i]}, ${buffer[i + 1]}, ${buffer[i + 2]}, ${alpha})`
          }
          const left = Math.floor((dx + half) * cell)
          const top = Math.floor((dy + half) * cell)
          const right = Math.floor((dx + half + 1) * cell)
          const bottom = Math.floor((dy + half + 1) * cell)
          ctx.fillRect(left, top, right - left, bottom - top)
        }
      }

      const centerLeft = half * cell
      ctx.strokeStyle = '#fc6d25'
      ctx.lineWidth = Math.max(1, dpr * 1.25)
      ctx.strokeRect(centerLeft, centerLeft, cell, cell)
    },

    move(x, y, bounds) {
      const wrap = wrapRef.current
      if (!wrap) return
      const gap = 20
      let left = x + gap
      let top = y + gap
      if (left + MAGNIFIER_SIZE > bounds.width) left = x - gap - MAGNIFIER_SIZE
      if (top + MAGNIFIER_SIZE > bounds.height) top = y - gap - MAGNIFIER_SIZE
      left = Math.max(4, Math.min(left, bounds.width - MAGNIFIER_SIZE - 4))
      top = Math.max(4, Math.min(top, bounds.height - MAGNIFIER_SIZE - 4))
      wrap.style.transform = `translate3d(${left}px, ${top}px, 0)`
    },

    setVisible(visible) {
      const wrap = wrapRef.current
      if (!wrap) return
      wrap.style.opacity = visible ? '1' : '0'
      wrap.style.transform = visible
        ? wrap.style.transform
        : 'translate3d(-9999px, -9999px, 0)'
    },
  }))

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="checkerboard pointer-events-none absolute top-0 left-0 z-20 rounded-none border border-ink/15 opacity-0 shadow-[0_18px_40px_-16px_rgba(16,16,16,0.55)] transition-opacity duration-150 will-change-transform"
      style={{ width: MAGNIFIER_SIZE, height: MAGNIFIER_SIZE }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full rounded-none"
        style={{ width: MAGNIFIER_SIZE, height: MAGNIFIER_SIZE }}
      />
    </div>
  )
})

export default Magnifier
