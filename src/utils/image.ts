import type { LoadedImage } from '../types'

export const SUPPORTED_MIME = ['image/png', 'image/jpeg', 'image/webp'] as const
export const SUPPORTED_EXT = ['png', 'jpg', 'jpeg', 'webp'] as const
export const ACCEPTED_INPUT = '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp'

/** Images larger than this on their longest edge are downscaled for inspection. */
export const MAX_DIMENSION = 8192

export type ImageErrorCode = 'unsupported' | 'decode' | 'empty' | 'invalid-url' | 'network'

export class ImageLoadError extends Error {
  code: ImageErrorCode

  constructor(code: ImageErrorCode, message: string) {
    super(message)
    this.name = 'ImageLoadError'
    this.code = code
  }
}

export function isSupportedFile(file: File): boolean {
  const type = file.type.toLowerCase()
  if ((SUPPORTED_MIME as readonly string[]).includes(type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return (SUPPORTED_EXT as readonly string[]).includes(ext)
}

interface DecodedSource {
  bitmap: ImageBitmap | HTMLImageElement
  width: number
  height: number
  release: () => void
}

function rasterizeDecodedSource(
  name: string,
  type: string,
  size: number,
  width: number,
  height: number,
  source: DecodedSource,
): LoadedImage {
  const ratio = Math.min(1, MAX_DIMENSION / Math.max(width, height))
  const targetW = Math.max(1, Math.round(width * ratio))
  const targetH = Math.max(1, Math.round(height * ratio))
  const downscaled = ratio < 1

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new ImageLoadError('decode', 'Canvas is unavailable in this browser.')

  ctx.imageSmoothingEnabled = downscaled
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source.bitmap, 0, 0, targetW, targetH)

  let imageData: ImageData
  try {
    imageData = ctx.getImageData(0, 0, targetW, targetH)
  } catch {
    throw new ImageLoadError('decode', 'Could not read pixel data from this image.')
  }

  return {
    name,
    type,
    size,
    width: targetW,
    height: targetH,
    originalWidth: width,
    originalHeight: height,
    downscaled,
    buffer: imageData.data,
    source: canvas,
  }
}

async function decodeImageElement(src: string): Promise<DecodedSource> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new ImageLoadError('decode', 'Could not decode image.'))
    el.src = src
  })

  if (img.naturalWidth === 0 || img.naturalHeight === 0) {
    throw new ImageLoadError('empty', 'Image has no pixels.')
  }

  return {
    bitmap: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    release: () => {},
  }
}

async function decodeFile(file: File): Promise<DecodedSource> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      if (bitmap.width > 0 && bitmap.height > 0) {
        return {
          bitmap,
          width: bitmap.width,
          height: bitmap.height,
          release: () => bitmap.close(),
        }
      }
      bitmap.close()
    } catch {
      // Fall through to the <img> decoder.
    }
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new ImageLoadError('decode', 'Could not decode image.'))
      el.src = url
    })
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      throw new ImageLoadError('empty', 'Image has no pixels.')
    }
    return {
      bitmap: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    if (error instanceof ImageLoadError) throw error
    throw new ImageLoadError('decode', 'Could not decode image.')
  }
}

/**
 * Validate, decode and rasterize an image into raw pixels ready for fast
 * per-pixel inspection. Large images are downscaled to `MAX_DIMENSION`.
 */
export async function loadImageFile(file: File): Promise<LoadedImage> {
  if (!file) throw new ImageLoadError('empty', 'No file selected.')
  if (!isSupportedFile(file)) {
    throw new ImageLoadError(
      'unsupported',
      'Unsupported format. Use a PNG, JPG, JPEG or WebP image.',
    )
  }

  const decoded = await decodeFile(file)
  try {
    return rasterizeDecodedSource(
      file.name || 'image',
      file.type || 'image',
      file.size,
      decoded.width,
      decoded.height,
      decoded,
    )
  } finally {
    decoded.release()
  }
}

export async function loadImageSrc(src: string, name = 'image'): Promise<LoadedImage> {
  const decoded = await decodeImageElement(src)
  try {
    return rasterizeDecodedSource(name, 'image/png', 0, decoded.width, decoded.height, decoded)
  } finally {
    decoded.release()
  }
}

const URL_MIME = /^image\/(png|jpe?g|webp|gif|bmp|avif|svg\+xml)$/i

/**
 * Parse and validate a user-supplied image URL. Accepts absolute http(s)
 * links as well as same-origin relative paths. Throws on anything else.
 */
export function parseImageUrl(raw: string): URL {
  const value = raw.trim()
  if (!value) throw new ImageLoadError('empty', 'Enter an image URL first.')

  let parsed: URL
  try {
    parsed = new URL(value, window.location.href)
  } catch {
    throw new ImageLoadError('invalid-url', 'That does not look like a valid URL.')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ImageLoadError('invalid-url', 'Only http and https links are supported.')
  }
  return parsed
}

function filenameFromUrl(url: URL): string {
  const segment = url.pathname.split('/').filter(Boolean).pop()
  if (!segment) return 'image'
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/**
 * Verify that a URL points at a real image, then download and rasterize it.
 * The image is fetched as a blob so the canvas never becomes cross-origin
 * tainted and pixel inspection keeps working.
 */
export async function loadImageUrl(raw: string): Promise<LoadedImage> {
  const url = parseImageUrl(raw)

  let response: Response
  try {
    response = await fetch(url.toString(), { mode: 'cors', credentials: 'omit' })
  } catch {
    throw new ImageLoadError(
      'network',
      'Could not reach that link. The server may block cross-origin requests.',
    )
  }

  if (!response.ok) {
    throw new ImageLoadError('network', `That link responded with ${response.status}.`)
  }

  const blob = await response.blob()
  let type = blob.type.toLowerCase()
  const extension = url.pathname.split('.').pop()?.toLowerCase() ?? ''
  const looksLikeImage =
    URL_MIME.test(type) || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif'].includes(extension)

  if (!looksLikeImage) {
    throw new ImageLoadError(
      'unsupported',
      'That link is not an image. Try a direct PNG, JPG or WebP link.',
    )
  }
  if (!type.startsWith('image/')) type = 'image/png'

  const file = new File([blob], filenameFromUrl(url), { type })
  return loadImageFile(file)
}
