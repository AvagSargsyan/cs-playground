import type { ModuleId } from './modules'

/*
 * References and further reading shown at the end of each Learn page and in the teacher notes.
 * Every link was checked by hand (November 2026). Free sources come first; the IB textbooks are
 * listed as further reading only, without chapter numbers, because their contents were not
 * checked page by page.
 */

export type Reference = {
  title: string
  /** Author or publisher, shown after the title. */
  source: string
  url?: string
  /** One short line: what the student will find there. */
  note: string
}

export type ReferenceGroup = { heading: string; items: Reference[] }

const IB_GUIDE: Reference = {
  title: 'Diploma Programme Computer Science (first assessment 2027)',
  source: 'International Baccalaureate',
  url: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/computer-science/',
  note: 'The official course this lesson is written for.',
}

const CS50_WEEK3: Reference = {
  title: 'CS50x, Week 3: Algorithms',
  source: 'Harvard University',
  url: 'https://cs50.harvard.edu/x/weeks/3/',
  note: 'Lecture and notes on searching, sorting, Big O and recursion.',
}

const KHAN = 'Khan Academy (Thomas Cormen and Devin Balkcom)'
const KHAN_BASE = 'https://www.khanacademy.org/computing/computer-science/algorithms'
const ISAAC = 'Isaac Computer Science (Raspberry Pi Foundation and University of Cambridge)'
const ISAAC_BASE = 'https://isaaccomputerscience.org/topics'

const TEXTBOOKS: ReferenceGroup = {
  heading: 'IB textbooks',
  items: [
    {
      title: 'Computer Science for the IB Diploma',
      source: 'Carl Turland, Ioana Ganea and Paul Baumgarten, Hodder Education, 2025',
      note: 'Course textbook for the 2027 syllabus.',
    },
    {
      title: 'Oxford Resources for IB DP Computer Science: Course Book',
      source: 'Bill MacKenty, Oxford University Press',
      note: 'Course textbook for the 2027 syllabus.',
    },
  ],
}

export const REFERENCES: Record<ModuleId, ReferenceGroup[]> = {
  sorting: [
    {
      heading: 'Course and free online resources',
      items: [
        IB_GUIDE,
        CS50_WEEK3,
        {
          title: 'Selection sort',
          source: KHAN,
          url: `${KHAN_BASE}/sorting-algorithms`,
          note: 'Step-by-step articles, pseudocode and coding challenges.',
        },
        {
          title: 'Insertion sort',
          source: KHAN,
          url: `${KHAN_BASE}/insertion-sort`,
          note: 'How insertion works, with an analysis of its running time.',
        },
        {
          title: 'Merge sort',
          source: KHAN,
          url: `${KHAN_BASE}/merge-sort`,
          note: 'Divide and conquer, merging, and why it runs in O(n log n).',
        },
        {
          title: 'Sorting',
          source: ISAAC,
          url: `${ISAAC_BASE}/sorting`,
          note: 'Free topic pages on Bubble, Insertion and Merge Sort.',
        },
      ],
    },
    TEXTBOOKS,
  ],
  'binary-search': [
    {
      heading: 'Course and free online resources',
      items: [
        IB_GUIDE,
        CS50_WEEK3,
        {
          title: 'Binary search',
          source: KHAN,
          url: `${KHAN_BASE}/binary-search`,
          note: 'The guessing game, implementing binary search, and its running time.',
        },
        {
          title: 'Asymptotic notation',
          source: KHAN,
          url: `${KHAN_BASE}/asymptotic-notation`,
          note: 'Big O and comparing how functions grow.',
        },
        {
          title: 'Searching',
          source: ISAAC,
          url: `${ISAAC_BASE}/searching`,
          note: 'Free topic pages on linear and binary search.',
        },
      ],
    },
    TEXTBOOKS,
  ],
  recursion: [
    {
      heading: 'Course and free online resources',
      items: [
        IB_GUIDE,
        CS50_WEEK3,
        {
          title: 'Recursive algorithms',
          source: KHAN,
          url: `${KHAN_BASE}/recursive-algorithms`,
          note: 'Recursion, the factorial function and recursive challenges.',
        },
        {
          title: 'Recursion',
          source: ISAAC,
          url: `${ISAAC_BASE}/recursion`,
          note: 'Recursion basics and worked examples.',
        },
      ],
    },
    TEXTBOOKS,
  ],
}

/** Extra references for the teacher notes (teaching approach, not content). */
export const TEACHING_REFERENCES: Reference[] = [
  {
    title: 'Teaching computer programming with PRIMM: a sociocultural perspective',
    source: 'Sue Sentance, Jane Waite and Maria Kallia, Computer Science Education 29(2–3), 2019',
    url: 'https://qmro.qmul.ac.uk/xmlui/handle/123456789/57800',
    note: 'The Predict–Run–Investigate–Modify–Make approach the lesson stages are inspired by.',
  },
]
