import type { ModuleId } from '../content/modules'

/** Original illustrations for each lesson. Pure SVG, no external assets. */

const FONT = 'Inter, system-ui, sans-serif'

function SortingArt() {
  const heights = [26, 40, 54, 68, 84, 100]
  return (
    <svg viewBox="0 0 240 130" role="img" aria-label="Bars arranged from shortest to tallest">
      <rect width="240" height="130" fill="#f8eef1" />
      {heights.map((h, i) => (
        <rect
          key={h}
          x={36 + i * 30}
          y={116 - h}
          width="22"
          height={h}
          rx="5"
          fill={i >= 4 ? 'var(--uwc-teal)' : 'var(--tile-bordo)'}
          opacity={i >= 4 ? 1 : 0.3 + i * 0.16}
        />
      ))}
      <path
        d="M98 18 q 30 -12 60 0"
        fill="none"
        stroke="var(--uwc-orange)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M151 12 l 8 6 -10 3"
        fill="none"
        stroke="var(--uwc-orange)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchArt() {
  const cells = [3, 8, 12, 19, 24, 31, 40]
  return (
    <svg
      viewBox="0 0 240 130"
      role="img"
      aria-label="A row of sorted numbers with the middle one highlighted"
    >
      <rect width="240" height="130" fill="#e7f4f3" />
      {cells.map((v, i) => {
        const mid = i === 3
        const gone = i < 3
        return (
          <g key={v} opacity={gone ? 0.35 : 1}>
            <rect
              x={16 + i * 30}
              y={56}
              width="26"
              height="26"
              rx="6"
              fill={mid ? 'var(--uwc-orange)' : '#fff'}
              stroke={mid ? 'var(--uwc-orange)' : 'var(--tile-green)'}
              strokeWidth="1.5"
            />
            <text
              x={29 + i * 30}
              y={73.5}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fontFamily={FONT}
              fill={mid ? '#fff' : 'var(--ink-heading)'}
            >
              {v}
            </text>
          </g>
        )
      })}
      <text
        x="105"
        y="100"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fontFamily={FONT}
        fill="var(--uwc-orange)"
      >
        middle
      </text>
      <circle cx="192" cy="34" r="14" fill="none" stroke="var(--tile-green)" strokeWidth="4" />
      <path d="M202 44 l 12 12" stroke="var(--tile-green)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function RecursionArt() {
  return (
    <svg
      viewBox="0 0 240 130"
      role="img"
      aria-label="Nested frames, each one smaller than the last"
    >
      <rect width="240" height="130" fill="#f3ecf4" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={52 + i * 14}
          y={14 + i * 11}
          width={136 - i * 28}
          height={102 - i * 22}
          rx={10 - i * 1.5}
          fill={i === 4 ? 'var(--uwc-teal)' : 'none'}
          stroke={i === 4 ? 'var(--uwc-teal)' : 'var(--tile-purple)'}
          strokeWidth="2.5"
          opacity={i === 4 ? 1 : 0.35 + i * 0.16}
        />
      ))}
    </svg>
  )
}

export function ModuleArt({ id }: { id: ModuleId }) {
  if (id === 'sorting') return <SortingArt />
  if (id === 'binary-search') return <SearchArt />
  return <RecursionArt />
}
