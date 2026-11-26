/**
 * "Sorting around the world": the same words, sorted with each language's own alphabetical
 * rules (Intl.Collator), next to the plain character-code order a computer uses by default.
 */
export const WORLD_WORDS = [
  'Zebra',
  'Apfel',
  'Ärzte',
  'Ölberg',
  'Ångström',
  'Cesta',
  'Čapek',
  'Chalupa',
  'Hotel',
  'Արամ',
  'Անի',
  'Анна',
  'Иван',
]

export type WorldRule = { id: string; label: string; note: string }

export const WORLD_RULES: WorldRule[] = [
  {
    id: 'codes',
    label: 'Character codes (computer default)',
    note: 'Without language rules, a computer compares the numeric codes of characters. Every accented letter ends up after Z, and uppercase/lowercase would be split apart too.',
  },
  {
    id: 'en',
    label: 'English',
    note: 'English ignores accents for ordering: Ä is filed with A, Ö with O.',
  },
  {
    id: 'de',
    label: 'German',
    note: 'German dictionaries also treat Ä like A and Ö like O.',
  },
  {
    id: 'sv',
    label: 'Swedish',
    note: 'In Swedish, Å, Ä and Ö are separate letters that come after Z.',
  },
  {
    id: 'cs',
    label: 'Czech',
    note: 'In Czech, Č is its own letter after C, and "Ch" counts as one letter that comes after H.',
  },
  {
    id: 'hy',
    label: 'Armenian',
    note: 'Armenian rules put words in the Armenian alphabet first, in Armenian alphabetical order.',
  },
  {
    id: 'ru',
    label: 'Russian',
    note: 'Russian rules put Cyrillic words first, in Russian alphabetical order.',
  },
]

export function sortWords(words: readonly string[], rule: string): string[] {
  const copy = words.slice()
  if (rule === 'codes') return copy.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  return copy.sort(new Intl.Collator(rule).compare)
}

/** Words whose position differs between two orderings. */
export function movedWords(a: readonly string[], b: readonly string[]): Set<string> {
  return new Set(b.filter((w, i) => a[i] !== w))
}
