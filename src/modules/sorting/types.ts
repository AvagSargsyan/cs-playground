import type { SortAlgorithmId, SortState, SortStepKind, Step } from '../../engine/types'

export type { SortAlgorithmId, SortState }
export type SortStep = Step<SortState, SortStepKind>
