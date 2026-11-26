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

/**
 * Hero visual: a small preview of the Explore playground, so the first thing visitors see is
 * the product itself.
 */
export function HeroPreview() {
  // Bubble sort mid-run: the largest values have already "bubbled" to the right end.
  const bars = [
    { v: 4, state: '' },
    { v: 7, state: 'compare' },
    { v: 5, state: 'compare' },
    { v: 2, state: '' },
    { v: 9, state: '' },
    { v: 8, state: '' },
    { v: 13, state: 'sorted' },
    { v: 15, state: 'sorted' },
  ]
  const fill = (s: string) =>
    s === 'sorted' ? 'var(--uwc-teal)' : s === 'compare' ? 'var(--uwc-orange)' : '#9fc2dc'
  return (
    <svg
      viewBox="0 0 440 330"
      role="img"
      aria-label="Preview of the sorting playground: bars being compared, with play controls and a step explanation"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        filter: 'drop-shadow(0 12px 24px rgba(27, 30, 35, 0.12))',
      }}
    >
      <rect x="10" y="10" width="420" height="300" rx="18" fill="#fff" />
      <rect x="10.5" y="10.5" width="419" height="299" rx="17.5" fill="none" stroke="#e4e0d8" />
      {/* window header */}
      <circle cx="36" cy="34" r="5" fill="#f1b8a3" />
      <circle cx="52" cy="34" r="5" fill="#f4d88a" />
      <circle cx="68" cy="34" r="5" fill="#a6d8d3" />
      <text x="410" y="38" textAnchor="end" fontSize="11" fontFamily={FONT} fill="#62666d">
        Bubble Sort · step 19 of 52
      </text>
      <line x1="10" y1="54" x2="430" y2="54" stroke="#eeebe5" />
      {/* bars */}
      {bars.map((b, i) => {
        const h = b.v * 10
        const x = 46 + i * 46
        return (
          <g key={i}>
            <rect x={x} y={200 - h} width="32" height={h} rx="6" fill={fill(b.state)} />
            <text
              x={x + 16}
              y={218}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily={FONT}
              fill="#26292e"
            >
              {b.v}
            </text>
            {b.state === 'compare' && (
              <text x={x + 16} y={232} textAnchor="middle" fontSize="10" fill="var(--uwc-orange)">
                ▲
              </text>
            )}
          </g>
        )
      })}
      {/* explanation */}
      <rect x="30" y="244" width="380" height="26" rx="8" fill="#fff0e8" />
      <text x="42" y="261" fontSize="12" fontFamily={FONT} fill="#26292e">
        Compare 7 and 5. 7 &gt; 5, so swap them.
      </text>
      {/* controls */}
      <rect x="30" y="278" width="76" height="22" rx="6" fill="var(--uwc-blue)" />
      <text
        x="68"
        y="293"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fontFamily={FONT}
        fill="#fff"
      >
        ▶ Play
      </text>
      <rect x="114" y="278" width="26" height="22" rx="6" fill="#f4f2ee" />
      <rect x="146" y="278" width="26" height="22" rx="6" fill="#f4f2ee" />
      <rect x="184" y="288" width="226" height="3" rx="1.5" fill="#ebe8e2" />
      <rect x="184" y="288" width="58" height="3" rx="1.5" fill="var(--uwc-blue)" />
    </svg>
  )
}
