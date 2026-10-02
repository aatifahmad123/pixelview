<div align="center">

![PixelView logo](./public/logo.png)

# PixelView

**Find the exact color hiding in any image.**

Hover over any pixel to read its exact color, click to lock it in place, and copy the value in any format — HEX, RGB, RGBA, HSL, HSLA, or CMYK.

### Try it live

**[pixelview.vercel.app](https://pixelview.vercel.app)**

![PixelView demo](./public/sample-image.png)

</div>

## What it does

- **Upload an image** from your device or load one from a URL (PNG, JPG, JPEG, WEBP)
- **Hover** to inspect any pixel — a crosshair magnifier follows your cursor
- **Click** to lock a pixel so its values stay on screen while you move around
- **Copy** any color format to the clipboard with one click
- **Sample images** included so you can try it instantly without uploading
- Big images are transparently downscaled for fast, responsive inspection (values are still read at the original pixel coordinates)

## Color formats

| Format | Example |
| --- | --- |
| HEX | `#FC6D25` |
| RGB | `rgb(252, 109, 37)` |
| RGBA | `rgba(252, 109, 37, 0.5)` |
| HSL | `hsl(20, 97%, 57%)` |
| HSLA | `hsla(20, 97%, 57%, 0.5)` |
| CMYK | `cmyk(0%, 58%, 86%, 1%)` |

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) + [Vitest](https://vitest.dev) for linting and tests

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run lint      # oxlint
npm run test      # vitest
npm run build     # typecheck + production build
```