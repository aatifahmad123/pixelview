import { useCallback, useEffect, useRef, useState } from 'react'
import type { LoadedImage } from '../types'
import { ImageLoadError, loadImageFile, loadImageSrc, loadImageUrl } from '../utils/image'

export type LoaderStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useImageLoader() {
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [status, setStatus] = useState<LoaderStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const run = useCallback(async (loader: () => Promise<LoadedImage>) => {
    const id = ++requestId.current
    setStatus('loading')
    setError(null)
    try {
      const loaded = await loader()
      if (id !== requestId.current) return
      setImage(loaded)
      setStatus('ready')
      return loaded
    } catch (err) {
      if (id !== requestId.current) return
      const message =
        err instanceof ImageLoadError
          ? err.message
          : 'Something went wrong while loading that image.'
      setError(message)
      setStatus('error')
    }
  }, [])

  const loadImage = useCallback((file: File) => run(() => loadImageFile(file)), [run])

  const loadSource = useCallback((src: string, name?: string) => run(() => loadImageSrc(src, name)), [run])

  const loadUrl = useCallback((url: string) => run(() => loadImageUrl(url)), [run])

  const clear = useCallback(() => {
    requestId.current++
    setImage(null)
    setStatus('idle')
    setError(null)
  }, [])

  useEffect(
    () => () => {
      requestId.current++
    },
    [],
  )

  return { image, status, error, loadImage, loadSource, loadUrl, clear }
}
