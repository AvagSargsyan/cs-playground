/* Shared helpers for the algorithm layer: random inputs, presets, parsing and code listings. */

export type ArrayPreset = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique'

export const ARRAY_PRESETS: { id: ArrayPreset; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'nearly-sorted', label: 'Nearly sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'few-unique', label: 'Few unique values' },
]

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle<T>(items: T[]): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function randomArray(size: number, min = 1, max = 99): number[] {
  return Array.from({ length: size }, () => randomInt(min, max))
}

/** Builds an input array for the sorting playground. Always ascending-based; callers flip for desc. */
export function presetArray(preset: ArrayPreset, size: number, min = 1, max = 99): number[] {
  switch (preset) {
    case 'random':
      return randomArray(size, min, max)
    case 'nearly-sorted': {
      const values = randomArray(size, min, max).sort((a, b) => a - b)
      // A couple of neighbour swaps keeps it "almost" in order.
      const swaps = Math.max(1, Math.floor(size / 6))
      for (let s = 0; s < swaps && size > 1; s++) {
        const i = randomInt(0, size - 2)
        ;[values[i], values[i + 1]] = [values[i + 1], values[i]]
      }
      return values
    }
    case 'reversed':
      return randomArray(size, min, max).sort((a, b) => b - a)
    case 'few-unique': {
      const pool = shuffle(Array.from({ length: max - min + 1 }, (_, i) => i + min)).slice(0, 3)
      return Array.from({ length: size }, () => pool[randomInt(0, pool.length - 1)])
    }
  }
}

export type ParseOptions = { min?: number; max?: number; minLength?: number; maxLength?: number }

/** Parses "5, 3, 8 1" into numbers, with a student-friendly error message on bad input. */
export function parseNumberList(
  text: string,
  { min = 1, max = 99, minLength = 2, maxLength = 32 }: ParseOptions = {},
): { values: number[] } | { error: string } {
  const parts = text
    .split(/[\s,;]+/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length === 0) return { error: 'Type some numbers separated by commas, e.g. 5, 3, 8.' }
  const values: number[] = []
  for (const part of parts) {
    if (!/^-?\d+$/.test(part)) return { error: `"${part}" is not a whole number.` }
    const n = Number(part)
    if (n < min || n > max) return { error: `Use numbers from ${min} to ${max} (found ${n}).` }
    values.push(n)
  }
  if (values.length < minLength) return { error: `Enter at least ${minLength} numbers.` }
  if (values.length > maxLength) return { error: `Enter at most ${maxLength} numbers.` }
  return { values }
}

/* -------------------------------- Code listings -------------------------------- */

/**
 * A code listing whose important lines are tagged with keys, so traces can refer to
 * `at.compare` instead of hard-coded line numbers that drift when the listing changes.
 */
export type Listing<K extends string> = { text: string; lines: number; at: Record<K, number> }

export function defineListing<K extends string>(
  keys: readonly K[],
  rows: ReadonlyArray<string | readonly [K, string]>,
): Listing<K> {
  const at = {} as Record<K, number>
  const text: string[] = []
  rows.forEach((row, i) => {
    if (typeof row === 'string') {
      text.push(row)
    } else {
      const [key, line] = row
      if (key in at) throw new Error(`Listing key "${key}" used twice`)
      at[key] = i + 1
      text.push(line)
    }
  })
  for (const key of keys) {
    if (!(key in at)) throw new Error(`Listing key "${key}" is missing`)
  }
  return { text: text.join('\n'), lines: rows.length, at }
}

/** Relation symbol between two numbers, for step messages. */
export function rel(a: number, b: number): '<' | '>' | '=' {
  return a < b ? '<' : a > b ? '>' : '='
}
