"use client"

const PALETTE = ["#017321", "#e6b313", "#264653", "#e76f51", "#2a9d8f"]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h)
  }
  return Math.abs(h)
}

function pick(name: string, index: number): string {
  return PALETTE[(hash(name + index) + index) % PALETTE.length]!
}

/**
 * SVG-based gradient avatar seeded by name.
 * Renders as a circle (default) or fills a rectangular container.
 */
export function GradientAvatar({
  name,
  size = 32,
  square = false,
  className,
}: {
  name: string
  size?: number
  square?: boolean
  className?: string
}) {
  const h = hash(name)
  const c1 = pick(name, 0)
  const c2 = pick(name, 1)
  const c3 = pick(name, 2)
  const rot = h % 360
  const x1 = 10 + (h % 80)
  const y1 = 10 + ((h >> 4) % 80)
  const x2 = 10 + ((h >> 8) % 80)
  const y2 = 10 + ((h >> 12) % 80)
  const id = `ga-${h}`

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={square ? undefined : { borderRadius: "50%" }}
    >
      <defs>
        <linearGradient id={`${id}-bg`} gradientTransform={`rotate(${rot})`}>
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`${id}-blob`} cx={`${x1}%`} cy={`${y1}%`} r="55%">
          <stop offset="0%" stopColor={c3} stopOpacity="0.8" />
          <stop offset="100%" stopColor={c3} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-blob2`} cx={`${x2}%`} cy={`${y2}%`} r="45%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.6" />
          <stop offset="100%" stopColor={c1} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <rect width="100" height="100" fill={`url(#${id}-blob)`} />
      <rect width="100" height="100" fill={`url(#${id}-blob2)`} />
    </svg>
  )
}

/**
 * Course placeholder — fills parent with a gradient seeded by title.
 */
export function CoursePlaceholder({ title }: { title: string }) {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
      <GradientAvatar name={title} size={400} square className="h-full w-full" />
    </div>
  )
}
