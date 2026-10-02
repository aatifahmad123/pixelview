import { useEffect, useRef, useState } from 'react'
import { copyText } from '../utils/clipboard'
import { CheckIcon, CopyIcon } from './icons'

interface ValueRowProps {
  label: string
  value: string
}

export default function ValueRow({ label, value }: ValueRowProps) {
  const [copied, setCopied] = useState(false)
  const timeout = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timeout.current != null) window.clearTimeout(timeout.current)
    },
    [],
  )

  const handleCopy = async () => {
    const ok = await copyText(value)
    if (!ok) return
    setCopied(true)
    if (timeout.current != null) window.clearTimeout(timeout.current)
    timeout.current = window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="group flex items-center justify-between gap-3 rounded-none border border-ink/10 bg-white/45 px-3.5 py-3 transition-colors hover:border-accent/60">
      <span className="w-[4.5rem] shrink-0 text-sm font-semibold tracking-[0.16em] text-ink uppercase">
        {label}
      </span>
      <span className="min-w-0 flex-1 font-mono text-base font-medium text-ink">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label} value`}
        title="Copy"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-none transition-colors ${
          copied
            ? 'bg-accent text-paper'
            : 'text-ink/45 hover:bg-accent hover:text-paper'
        }`}
      >
        {copied ? <CheckIcon className="h-4.5 w-4.5" /> : <CopyIcon className="h-4.5 w-4.5" />}
      </button>
    </div>
  )
}
