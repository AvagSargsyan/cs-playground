import type { ModuleId } from './modules'

/*
 * Alignment with the IB Diploma Programme Computer Science course (first assessment 2027).
 *
 * Section codes are deliberately omitted. The only codes found (e.g. "B2.4") came from
 * unofficial third-party excerpts, not from the official guide on ibo.org, so they could not
 * be confirmed. Topic names below follow the course's published structure: Theme A "Concepts
 * of computer science" and Theme B "Computational thinking and problem-solving"
 * (ibo.org/programmes/diploma-programme/curriculum/sciences/computer-science/).
 * Teachers should check exact references against the current official subject guide.
 */

export type IbAlignmentRow = {
  module: ModuleId
  /** Course theme the lesson sits in. */
  theme: string
  /** Topic area, in plain words. */
  topic: string
  level: 'SL and HL' | 'HL'
  /** What students practise in the lesson. */
  skills: string
}

export const IB_ALIGNMENT: IbAlignmentRow[] = [
  {
    module: 'sorting',
    theme: 'Computational thinking and problem-solving',
    topic:
      'Algorithms: sorting (Bubble Sort and Selection Sort, plus Insertion Sort and Merge Sort)',
    level: 'SL and HL',
    skills: 'Trace an algorithm, count comparisons, compare efficiency with Big O',
  },
  {
    module: 'binary-search',
    theme: 'Computational thinking and problem-solving',
    topic: 'Algorithms: searching (Linear Search and Binary Search)',
    level: 'SL and HL',
    skills: 'Trace Binary Search, explain why it needs sorted data, compare O(n) and O(log n)',
  },
  {
    module: 'recursion',
    theme: 'Computational thinking and problem-solving',
    topic: 'Recursion: base case, recursive case and the call stack',
    level: 'HL',
    skills: 'Trace recursive calls, identify base cases, predict return values',
  },
]

export const IB_NOTE =
  'Topic names follow the IB DP Computer Science course (first assessment 2027). Section codes are not shown here; check the official subject guide for exact references.'
