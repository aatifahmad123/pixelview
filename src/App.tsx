import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import CanvasStage from './components/CanvasStage'
import FormatGuide from './components/FormatGuide'
import PixelPanel from './components/PixelPanel'
import SampleGallery from './components/SampleGallery'
import { CloseIcon, CrosshairIcon, LinkIcon, UploadIcon } from './components/icons'
import { useImageLoader } from './hooks/useImageLoader'
import type { PixelSample } from './types'
import { ACCEPTED_INPUT } from './utils/image'

const SAMPLE_IMAGE = '/sample-image.png'
const LOGO = new URL('logo.png', document.baseURI).toString()

export default function App() {
  const { image, status, error, loadImage, loadSource, loadUrl, clear } = useImageLoader()

  const [hovered, setHovered] = useState<PixelSample | null>(null)
  const [locked, setLocked] = useState<PixelSample | null>(null)
  const [urlValue, setUrlValue] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const loading = status === 'loading'

  useEffect(() => {
    void loadSource(SAMPLE_IMAGE, 'sample-image.png')
  }, [loadSource])

  const resetSamples = useCallback(() => {
    setHovered(null)
    setLocked(null)
  }, [])

  const handleFile = useCallback(
    (file: File) => {
      resetSamples()
      void loadImage(file)
    },
    [loadImage, resetSamples],
  )

  const handleSubmitUrl = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      const value = urlValue.trim()
      if (!value) return
      resetSamples()
      void loadUrl(value)
    },
    [loadUrl, resetSamples, urlValue],
  )

  const handleHover = useCallback((sample: PixelSample | null) => {
    setHovered(sample)
  }, [])

  const handleLock = useCallback((sample: PixelSample) => {
    setLocked(sample)
  }, [])

  const handleClearLock = useCallback(() => {
    setLocked(null)
  }, [])

  const handleSelectSample = useCallback(
    (src: string, name: string) => {
      resetSamples()
      void loadSource(src, name)
    },
    [loadSource, resetSamples],
  )

  const handleClearImage = useCallback(() => {
    clear()
    resetSamples()
    setUrlValue('')
  }, [clear, resetSamples])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLocked(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const sample = locked ?? hovered

  return (
    <>
      <div className="mx-auto flex min-h-svh w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:py-8">
        <header className="flex flex-col gap-6">
          <nav className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={LOGO}
                alt="PixelView"
                className="h-10 w-10 object-contain"
              />
              <span className="text-2xl font-bold tracking-tight text-ink">PixelView</span>
            </div>

            <div className="flex items-center gap-2">
              {image && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  aria-label="Close image"
                  title="Close image"
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-ink/80 p-3 text-sm font-semibold text-paper transition-transform hover:scale-[1.01] active:scale-95 sm:px-5 sm:py-3"
                >
                  <CloseIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Close image</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                aria-label="Upload image"
                title="Upload image"
                className="inline-flex items-center justify-center gap-2 rounded-none bg-ink p-3 text-sm font-semibold text-paper transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-wait disabled:opacity-60 sm:px-5 sm:py-3"
              >
                <UploadIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Upload image</span>
              </button>
            </div>
          </nav>

          <div className="border-t border-dashed border-ink/15" />

          <div className="flex w-full flex-col items-start gap-4 text-left">
            <h1 className="max-w-5xl text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
              Find the <span className="text-accent">exact color</span> hiding in any image
            </h1>
            <p className="max-w-4xl text-base leading-relaxed text-pretty text-ink/70 sm:text-lg">
              Upload, hover or tap, and lock a pixel to get precise color values in different
              color formats.
            </p>
          </div>

          <form onSubmit={handleSubmitUrl} className="w-full">
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <div className="relative flex flex-1 items-center">
                <LinkIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink/40" />
                <input
                  type="url"
                  inputMode="url"
                  value={urlValue}
                  onChange={(event) => setUrlValue(event.target.value)}
                  placeholder="Paste image URL (PNG, JPG, JPEG, WEBP)"
                  aria-label="Image URL"
                  className="h-full w-full rounded-none border border-ink/20 bg-white/70 py-3 pr-3 pl-10 text-sm text-ink placeholder:text-ink/35 focus:border-accent focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || urlValue.trim().length === 0}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-none bg-accent px-5 py-3 text-sm font-semibold text-paper shadow-[0_16px_30px_-18px_rgba(252,109,37,0.95)] transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-none border-2 border-paper/40 border-t-paper" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                Load URL
              </button>
            </div>
          </form>

          {error && (
            <p role="alert" className="animate-pop mx-auto flex max-w-2xl items-center gap-2 rounded-none border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-ink">
              <span className="h-1.5 w-1.5 shrink-0 bg-accent" />
              {error}
            </p>
          )}
        </header>

        <main className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_520px]">
          <section className="flex h-[75svh] min-h-[460px] flex-col gap-3 lg:h-auto lg:min-h-[75svh]">
            {image ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-xs">
                  <span className="max-w-[60ch] truncate text-base font-medium text-ink/70">
                    {image.name}
                  </span>
                  <span className="font-sans text-sm font-medium tracking-tight text-ink/55">
                    {image.width} × {image.height} px
                    {image.downscaled &&
                      ` · downscaled from ${image.originalWidth} × ${image.originalHeight}`}
                  </span>
                </div>
                <div className="min-h-0 flex-1">
                  <CanvasStage
                    image={image}
                    locked={locked}
                    onHover={handleHover}
                    onLock={handleLock}
                  />
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-none border border-dashed border-ink/20 bg-white/40 px-6 text-center">
                {loading ? (
                  <>
                    <span className="h-8 w-8 animate-spin rounded-none border-2 border-ink/20 border-t-accent" />
                    <p className="text-base font-medium text-ink/70 sm:text-lg">Loading image…</p>
                  </>
                ) : (
                  <>
                    <span className="flex h-12 w-12 items-center justify-center rounded-none bg-accent/12 text-accent">
                      <CrosshairIcon className="h-6 w-6" />
                    </span>
                    <p className="text-base font-medium text-ink sm:text-lg">No image loaded</p>
                    <p className="max-w-[30ch] text-sm leading-relaxed text-ink/50">
                      Upload a file or paste an image link above to start inspecting pixels.
                    </p>
                    <button
                      type="button"
                      onClick={() => void loadSource(SAMPLE_IMAGE, 'sample-image.png')}
                      className="inline-flex items-center gap-2 rounded-none border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                    >
                      Load sample image
                    </button>
                  </>
                )}
              </div>
            )}
          </section>

          <div>
            <PixelPanel
              sample={sample}
              locked={locked !== null}
              onLock={handleLock}
              onClearLock={handleClearLock}
            />
          </div>
        </main>

        <SampleGallery
          activeName={image?.name ?? null}
          loading={loading}
          onSelect={handleSelectSample}
        />

        <FormatGuide />

        <footer className="flex items-center justify-center gap-2 pb-2 text-base font-medium text-ink/70">
          Made with
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-accent"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          by Aatif
        </footer>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_INPUT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) handleFile(file)
          event.target.value = ''
        }}
      />
    </>
  )
}
