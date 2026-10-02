interface FormatInfo {
  label: string
  example: string
  description: string
}

const FORMATS: FormatInfo[] = [
  {
    label: 'HEX',
    example: '#FC6D25',
    description:
      'Six-digit shorthand for red, green, and blue. The most common way to write color in CSS and design tools.',
  },
  {
    label: 'RGB',
    example: 'rgb(252, 109, 37)',
    description: 'Red, green, and blue channels, each from 0 to 255. The base model for what screens display.',
  },
  {
    label: 'RGBA',
    example: 'rgba(252, 109, 37, 0.5)',
    description: 'RGB plus an alpha value from 0 to 1 that controls transparency.',
  },
  {
    label: 'HSL',
    example: 'hsl(20, 97%, 57%)',
    description: 'Hue, saturation, and lightness. A more intuitive way to describe and adjust a color.',
  },
  {
    label: 'HSLA',
    example: 'hsla(20, 97%, 57%, 0.5)',
    description: 'HSL with an extra alpha channel so the color can be made transparent.',
  },
  {
    label: 'CMYK',
    example: 'cmyk(0%, 58%, 86%, 1%)',
    description: 'Cyan, magenta, yellow, and key (black) percentages. The model used for print.',
  },
]

export default function FormatGuide() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-[0.16em] text-ink uppercase">
        Color formats explained
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FORMATS.map((format) => (
          <article
            key={format.label}
            className="flex flex-col gap-2.5 rounded-none border border-ink/10 bg-white/35 p-5"
          >
            <header className="flex items-baseline justify-between gap-3">
              <h3 className="shrink-0 text-sm font-semibold tracking-[0.16em] text-ink uppercase">
                {format.label}
              </h3>
              <code className="min-w-0 truncate font-mono text-[15px] font-semibold text-ink">
                {format.example}
              </code>
            </header>
            <p className="text-[15px] leading-relaxed text-ink/70">{format.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}