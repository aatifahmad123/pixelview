interface Sample {
  file: string
  name: string
}

const SAMPLES: Sample[] = [
  { file: 'flower.jpg', name: 'Flower' },
  { file: 'bust.jpg', name: 'Bust' },
  { file: 'park.jpg', name: 'Park' },
  { file: 'whale.jpg', name: 'Whale' },
]

interface SampleGalleryProps {
  activeName: string | null
  loading: boolean
  onSelect: (src: string, name: string) => void
}

export default function SampleGallery({ activeName, loading, onSelect }: SampleGalleryProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-[0.16em] text-ink uppercase">
        Try a sample image
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SAMPLES.map((sample) => {
          const src = `/sample-images/${sample.file}`
          const name = `sample-images/${sample.file}`
          const active = activeName === name
          return (
            <button
              key={sample.file}
              type="button"
              disabled={loading}
              onClick={() => onSelect(src, name)}
              className={`group flex flex-col gap-2 rounded-none border bg-white/40 p-2 text-left transition-all disabled:cursor-wait disabled:opacity-60 ${
                active ? 'border-accent' : 'border-ink/10 hover:border-accent/60'
              }`}
            >
              <span className="checkerboard block w-full overflow-hidden border border-ink/10">
                <img
                  src={src}
                  alt={sample.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}