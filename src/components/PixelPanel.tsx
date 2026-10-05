import { memo } from 'react'
import type { PixelSample } from '../types'
import {
  formatCmyk,
  formatHsl,
  formatHsla,
  formatRgb,
  formatRgba,
  rgbToHex,
} from '../utils/color'
import Swatch from './Swatch'
import ValueRow from './ValueRow'
import { CrosshairIcon, LockIcon } from './icons'

interface PixelPanelProps {
  sample: PixelSample | null
  locked: boolean
  onLock: (sample: PixelSample) => void
  onClearLock: () => void
}

function PixelPanel({ sample, locked, onLock, onClearLock }: PixelPanelProps) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-none border border-ink/10 bg-white/35 p-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-[0.16em] text-ink uppercase">
          Color formats
        </h2>
        {locked ? (
          <button
            type="button"
            onClick={onClearLock}
            className="rounded-none bg-accent px-3.5 py-1.5 text-sm font-semibold text-paper transition-transform hover:scale-[1.03] active:scale-95"
          >
            Locked
          </button>
        ) : sample ? (
          <button
            type="button"
            onClick={() => onLock(sample)}
            className="inline-flex items-center gap-1.5 rounded-none bg-accent/10 px-3.5 py-1.5 text-sm font-semibold text-accent transition-transform hover:scale-[1.03] active:scale-95"
          >
            <LockIcon className="h-3.5 w-3.5" />
            Lock
          </button>
        ) : (
          <span className="rounded-none border border-ink/15 px-3.5 py-1.5 text-sm font-medium text-ink/50">
            Idle
          </span>
        )}
      </header>

      {sample ? (
        <div key={locked ? 'locked' : 'hover'} className="animate-fade-in flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Swatch color={sample.color} />
            <div className="flex min-w-0 flex-col gap-2">
                <div className="flex items-baseline gap-4">
                  <div>
                  <div className="text-xs font-semibold tracking-[0.14em] text-ink/45 uppercase">
                    X
                  </div>
                  <div
                    data-coord="x"
                    className="font-mono text-lg leading-none font-semibold text-ink"
                  >
                    {sample.x}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-[0.14em] text-ink/45 uppercase">
                    Y
                  </div>
                  <div
                    data-coord="y"
                    className="font-mono text-lg leading-none font-semibold text-ink"
                  >
                    {sample.y}
                  </div>
                </div>
              </div>
              <div className="font-mono text-3xl leading-none font-semibold text-accent">
                {rgbToHex(sample.color.r, sample.color.g, sample.color.b)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <ValueRow label="HEX" value={rgbToHex(sample.color.r, sample.color.g, sample.color.b)} />
            <ValueRow label="RGB" value={formatRgb(sample.color)} />
            <ValueRow label="RGBA" value={formatRgba(sample.color)} />
            <ValueRow label="HSL" value={formatHsl(sample.color)} />
<ValueRow label="HSLA" value={formatHsla(sample.color)} />
          <ValueRow label="CMYK" value={formatCmyk(sample.color)} />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-none border border-dashed border-ink/15 px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-none bg-accent/12 text-accent">
            <CrosshairIcon className="h-6 w-6" />
          </span>
          <p className="text-base font-medium text-ink sm:text-lg">Hover over the image</p>
          <p className="max-w-[32ch] text-sm leading-relaxed text-ink/50">
            Hover — or tap a pixel — to inspect values, then click / tap the same spot to lock it.
          </p>
        </div>
      )}
    </section>
  )
}

export default memo(PixelPanel)
