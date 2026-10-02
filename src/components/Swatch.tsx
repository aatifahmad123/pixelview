import type { Rgba } from '../types'
import { toCssColor } from '../utils/color'

export default function Swatch({ color }: { color: Rgba }) {
  return (
    <div className="checkerboard relative h-20 w-20 shrink-0 overflow-hidden rounded-none border border-ink/15">
      <div className="absolute inset-0" style={{ backgroundColor: toCssColor(color) }} />
    </div>
  )
}
