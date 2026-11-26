import type { ModuleId } from '../content/modules'

/** Original illustrations for each module. Pure SVG, no external assets. */

function SortingArt() {
  const heights = [28, 44, 60, 76, 92, 108]
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="Bars arranged from shortest to tallest">
      <rect width="240" height="140" fill="#f6e8ee" />
      {heights.map((h, i) => (
        <rect
          key={h}
          x={30 + i * 32}
          y={124 - h}
          width="24"
          height={h}
          fill={i >= 4 ? 'var(--uwc-teal)' : 'var(--tile-bordo)'}
          opacity={i >= 4 ? 1 : 0.35 + i * 0.15}
        />
      ))}
      <path d="M84 20 q 32 -14 64 0" fill="none" stroke="var(--uwc-orange)" strokeWidth="3" />
      <path d="M142 14 l 7 6 -9 3" fill="none" stroke="var(--uwc-orange)" strokeWidth="3" />
    </svg>
  )
}

function SearchArt() {
  const cells = [3, 8, 12, 19, 24, 31, 40]
  return (
    <svg
      viewBox="0 0 240 140"
      role="img"
      aria-label="A row of sorted numbers with the middle one highlighted"
    >
      <rect width="240" height="140" fill="#e0f2f1" />
      {cells.map((v, i) => {
        const mid = i === 3
        const gone = i < 3
        return (
          <g key={v} opacity={gone ? 0.35 : 1}>
            <rect
              x={15 + i * 30}
              y={58}
              width="28"
              height="28"
              fill={mid ? 'var(--uwc-orange)' : '#fff'}
              stroke={mid ? 'var(--uwc-orange)' : 'var(--tile-green)'}
              strokeWidth="2"
            />
            <text
              x={29 + i * 30}
              y={77}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily="Cabin, sans-serif"
              fill={mid ? '#fff' : 'var(--ink-heading)'}
            >
              {v}
            </text>
          </g>
        )
      })}
      <text
        x="104"
        y="108"
        fontSize="11"
        fontWeight="800"
        fontFamily="Raleway, sans-serif"
        fill="var(--uwc-orange)"
      >
        M
      </text>
      <circle cx="190" cy="40" r="16" fill="none" stroke="var(--tile-green)" strokeWidth="5" />
      <path d="M201 52 l 14 14" stroke="var(--tile-green)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

function RecursionArt() {
  return (
    <svg
      viewBox="0 0 240 140"
      role="img"
      aria-label="Nested frames, each one smaller than the last"
    >
      <rect width="240" height="140" fill="#efe5f0" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={50 + i * 14}
          y={18 + i * 11}
          width={140 - i * 28}
          height={104 - i * 22}
          fill="none"
          stroke={i === 4 ? 'var(--uwc-teal)' : 'var(--tile-purple)'}
          strokeWidth={i === 4 ? 4 : 3}
          opacity={i === 4 ? 1 : 0.4 + i * 0.15}
        />
      ))}
      <rect x="106" y="62" width="28" height="16" fill="var(--uwc-teal)" />
    </svg>
  )
}

export function ModuleArt({ id }: { id: ModuleId }) {
  if (id === 'sorting') return <SortingArt />
  if (id === 'binary-search') return <SearchArt />
  return <RecursionArt />
}

/** Hero artwork: abstract sorted bars rising, on the dark UWC-style gradient. */
export function HeroArt() {
  const bars = [18, 30, 24, 46, 38, 60, 52, 74, 66, 88, 80, 100]
  return (
    <svg viewBox="0 0 480 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 40 + 6}
          y={220 - h * 2}
          width="28"
          height={h * 2}
          fill={
            i % 4 === 3 ? 'var(--uwc-teal)' : i % 4 === 1 ? 'var(--uwc-orange)' : 'var(--uwc-blue)'
          }
          opacity={0.35 + (i / bars.length) * 0.55}
        />
      ))}
    </svg>
  )
}
