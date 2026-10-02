import { useCallback, useRef, useState } from 'react'
import type { LoaderStatus } from '../hooks/useImageLoader'
import { ACCEPTED_INPUT } from '../utils/image'
import { UploadIcon } from './icons'

interface DropzoneProps {
  onFile: (file: File) => void
  status: LoaderStatus
  error: string | null
}

export default function Dropzone({ onFile, status, error }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)

  const openPicker = () => inputRef.current?.click()

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  const onDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragging(false)
    }
  }

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const loading = status === 'loading'

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="flex min-h-svh w-full items-center justify-center px-6 py-16"
    >
      <div
        className={`animate-rise flex w-full max-w-xl flex-col items-center gap-6 rounded-none border-2 border-dashed px-8 py-14 text-center transition-colors sm:px-12 ${
          dragging ? 'border-accent bg-accent/[0.06]' : 'border-ink/15 bg-white/30'
        }`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-none bg-accent text-paper shadow-[0_14px_30px_-14px_rgba(238,90,41,0.9)]">
          <UploadIcon className="h-7 w-7" />
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Pixel View
          </h1>
          <p className="text-lg font-medium text-ink/80">Inspect every pixel.</p>
          <p className="text-sm leading-relaxed text-ink/55">
            Upload an image to explore its exact color values.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={openPicker}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-none bg-accent px-7 py-3 text-sm font-semibold text-paper shadow-[0_16px_34px_-16px_rgba(238,90,41,0.95)] transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-none border-2 border-paper/40 border-t-paper" />
                Loading…
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4" />
                Upload Image
              </>
            )}
          </button>

          <p className="text-xs tracking-wide text-ink/45">
            PNG · JPG · WEBP · Processed locally in your browser
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="animate-pop flex items-center gap-2 rounded-none border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-ink"
          >
            <span className="h-1.5 w-1.5 shrink-0 bg-accent" />
            {error}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_INPUT}
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
