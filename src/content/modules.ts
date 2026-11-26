export const MODULE_IDS = ['sorting', 'binary-search', 'recursion'] as const
export type ModuleId = (typeof MODULE_IDS)[number]

export const STAGE_IDS = ['learn', 'explore', 'practice'] as const
export type StageId = (typeof STAGE_IDS)[number]

export const STAGE_LABELS: Record<StageId, string> = {
  learn: 'Learn',
  explore: 'Explore',
  practice: 'Practice',
}

export const STAGE_BLURBS: Record<StageId, string> = {
  learn: 'Understand the idea with short explanations and examples.',
  explore: 'Run the algorithm step by step and experiment with it.',
  practice: 'Solve exercises and get instant feedback.',
}

export type ModuleMeta = {
  id: ModuleId
  title: string
  short: string
  description: string
  minutes: number
  /** CSS custom property holding the module color. */
  colorVar: string
  ibTag: string
  /** Ids of the Practice exercises, in order. Used for progress totals. */
  exerciseIds: string[]
}

export const MODULES: Record<ModuleId, ModuleMeta> = {
  sorting: {
    id: 'sorting',
    title: 'Sorting Algorithms',
    short: 'Sorting',
    description:
      'How do computers put things in order? Compare Bubble, Selection, Insertion and Merge Sort, and see why some are much faster than others.',
    minutes: 45,
    colorVar: 'var(--module-sorting)',
    ibTag: 'IB DP CS · Algorithms',
    exerciseIds: [
      'sorting-predict',
      'sorting-manual',
      'sorting-identify',
      'sorting-choose',
      'sorting-count',
    ],
  },
  'binary-search': {
    id: 'binary-search',
    title: 'Binary Search',
    short: 'Binary Search',
    description:
      'Find anything in a sorted list in a few steps by throwing away half of the possibilities every time.',
    minutes: 30,
    colorVar: 'var(--module-search)',
    ibTag: 'IB DP CS · Algorithms',
    exerciseIds: [
      'search-midpoint',
      'search-direction',
      'search-complete',
      'search-mistake',
      'search-complexity',
    ],
  },
  recursion: {
    id: 'recursion',
    title: 'Recursion',
    short: 'Recursion',
    description:
      'A function that calls itself? Discover base cases, recursive cases and the call stack with countdowns and factorials.',
    minutes: 30,
    colorVar: 'var(--module-recursion)',
    ibTag: 'IB DP CS · HL: Recursion',
    exerciseIds: [
      'recursion-next-call',
      'recursion-base-case',
      'recursion-arrange',
      'recursion-result',
      'recursion-fix',
    ],
  },
}

export const isModuleId = (v: string | undefined): v is ModuleId =>
  !!v && (MODULE_IDS as readonly string[]).includes(v)

export const isStageId = (v: string | undefined): v is StageId =>
  !!v && (STAGE_IDS as readonly string[]).includes(v)
