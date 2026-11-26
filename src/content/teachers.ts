import type { ModuleId, StageId } from './modules'

export type PlanStep = {
  minutes: number
  title: string
  /** What happens in this part of the lesson. */
  activity: string
  /** Optional link into the app for this step. */
  stage?: StageId
}

/** Short, practical notes: one printed page per lesson. */
export type TeacherNotes = {
  summary: string
  objectives: string[]
  plan: PlanStep[]
  exitTicket: string
  /** What students often believe, and what to do about it in the app. */
  misconceptions: { belief: string; fix: string }[]
  questions: string[]
  support: string[]
  stretch: string[]
}

export const LESSON_MINUTES = 60

export const TEACHER_NOTES: Record<ModuleId, TeacherNotes> = {
  sorting: {
    summary:
      'Students compare four sorting algorithms, see why some do far less work than others, and trace them by hand.',
    objectives: [
      'Trace Bubble Sort and Selection Sort on a short list.',
      'Count comparisons and use them to compare algorithms.',
      'Explain O(n²) and O(n log n) in plain words and choose an algorithm for a situation.',
    ],
    plan: [
      {
        minutes: 5,
        title: 'Hook',
        activity:
          'Pairs sort 8 numbered cards and write down their method. Collect two different methods on the board.',
      },
      {
        minutes: 10,
        title: 'Learn',
        activity:
          'Students read the introduction and one algorithm, and answer the “Check yourself” questions. Match the card methods to algorithm names.',
        stage: 'learn',
      },
      {
        minutes: 15,
        title: 'Explore in pairs',
        activity:
          'Run each algorithm on the same array, then on “Reversed” and “Nearly sorted”. Predict before pressing Play and record the comparisons.',
        stage: 'explore',
      },
      {
        minutes: 20,
        title: 'Practice',
        activity:
          'Individual work on the five exercises. Ask students to explain a wrong answer out loud before they retry.',
        stage: 'practice',
      },
      {
        minutes: 10,
        title: 'Wrap-up',
        activity: 'Compare the pairs’ results: which algorithm for 10 items, and for 1 million?',
      },
    ],
    exitTicket: 'Show the list after the first pass of Bubble Sort on [5, 1, 4, 2].',
    misconceptions: [
      {
        belief: 'Bubble Sort is always slow.',
        fix: 'Run the “Nearly sorted” preset in Explore: with the early exit it stops after one or two passes.',
      },
      {
        belief: 'More code means a slower algorithm.',
        fix: 'Race Merge Sort against Bubble Sort on a large random list in Explore.',
      },
      {
        belief: 'Merge Sort sorts the list in place.',
        fix: 'Point to the extra buffer in Explore and the “writes” counter.',
      },
    ],
    questions: [
      'Why does a nearly sorted list help Insertion Sort but not Selection Sort?',
      'Which algorithm would you choose for 10 items? For 1 million? Why?',
      'Online shops sort by “relevance”. Who decides what is relevant?',
    ],
    support: [
      'Use 5–6 values and a slow speed in Explore.',
      'Start with Bubble Sort and Selection Sort only.',
    ],
    stretch: [
      'Explain why Merge Sort is O(n log n) by counting the levels of splitting.',
      'Find an input where Insertion Sort beats Merge Sort on comparisons.',
    ],
  },
  'binary-search': {
    summary:
      'Students find out why Binary Search needs sorted data, trace it step by step, and compare it with checking every item.',
    objectives: [
      'Explain why Binary Search only works on sorted data.',
      'Trace Binary Search using left, mid and right.',
      'Compare O(n) and O(log n) using real numbers of comparisons.',
    ],
    plan: [
      {
        minutes: 5,
        title: 'Hook',
        activity:
          'Play “Guess my number between 1 and 100” with the class. What is the best first guess, and why?',
      },
      {
        minutes: 10,
        title: 'Learn',
        activity:
          'Students read Linear vs Binary Search and the walkthrough, and answer the “Check yourself” questions.',
        stage: 'learn',
      },
      {
        minutes: 15,
        title: 'Explore in pairs',
        activity:
          'One student predicts the next middle, the other steps forward; then swap. Compare linear and binary on the same target.',
        stage: 'explore',
      },
      {
        minutes: 20,
        title: 'Practice',
        activity:
          'Individual work on the five exercises, especially “Complete the search” and “Find the mistake”.',
        stage: 'practice',
      },
      {
        minutes: 10,
        title: 'Wrap-up',
        activity: 'How many guesses for a list of 1 million names? Link it to contact lists.',
      },
    ],
    exitTicket:
      'Trace Binary Search for 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72], listing left, mid and right.',
    misconceptions: [
      {
        belief: 'Binary Search works on any list.',
        fix: 'Learn shows it failing on an unsorted list, and Explore rejects unsorted input.',
      },
      {
        belief: 'Binary Search is about twice as fast.',
        fix: 'For 1,000 items: up to 1,000 linear checks, but only 10 binary ones.',
      },
      {
        belief: '“Not found” means the search broke.',
        fix: 'Search for a missing value in Explore and watch the range become empty.',
      },
    ],
    questions: [
      'Why does doubling the list size add only one more comparison?',
      'Where do you use a “halving” search in everyday life?',
      'Fast search lets organisations find anyone in huge databases. What should limit that?',
    ],
    support: [
      'Start with 7 or 15 items so the middle is easy to find.',
      'Students write left, mid and right on mini whiteboards at each step.',
    ],
    stretch: [
      'Show why the maximum number of comparisons is ⌊log₂ n⌋ + 1.',
      'Write Binary Search recursively.',
    ],
  },
  recursion: {
    summary:
      'Students meet recursion through countdown and factorial, and see each call as a frame on the call stack.',
    objectives: [
      'Identify the base case and the recursive case in a short function.',
      'Trace the call stack for factorial(n), including the order of returns.',
      'Explain what goes wrong without a correct base case.',
    ],
    plan: [
      {
        minutes: 5,
        title: 'Hook',
        activity:
          'Show nesting dolls. How do you count them if you can open only one at a time? Agree on when to stop.',
      },
      {
        minutes: 10,
        title: 'Learn',
        activity:
          'Students read base case and recursive case and the walkthroughs, and answer the “Check yourself” questions.',
        stage: 'learn',
      },
      {
        minutes: 15,
        title: 'Explore in pairs',
        activity:
          'Step through countdown(4) and factorial(4). Predict each value before it returns, then try n = 0.',
        stage: 'explore',
      },
      {
        minutes: 20,
        title: 'Practice',
        activity: 'Individual work on the five exercises. “Fix the recursion” works well in pairs.',
        stage: 'practice',
      },
      {
        minutes: 10,
        title: 'Wrap-up',
        activity: 'Role-play the call stack: each student is a frame and passes a value back.',
      },
    ],
    exitTicket: 'What does factorial(3) return, and in what order do the calls return?',
    misconceptions: [
      {
        belief: 'Recursion is just a loop.',
        fix: 'Show the waiting “4 × ?” frames in the factorial call stack.',
      },
      {
        belief: 'The base case is optional.',
        fix: 'Run the “no base case” demo in Learn, then the “Fix the recursion” exercise.',
      },
      {
        belief: 'Calls return in the order they were made.',
        fix: 'Watch frames leave from the top in Explore, then practise with “Arrange the call stack”.',
      },
    ],
    questions: [
      'What does each frame on the stack need to remember?',
      'When would you choose recursion over a loop?',
      'Where do you see patterns inside patterns in art, language or nature?',
    ],
    support: [
      'Stay with countdown and n = 3 or 4.',
      'Give a printed stack diagram to fill in while stepping through.',
    ],
    stretch: [
      'Write a recursive sum of a list and trace its stack.',
      'Write Binary Search recursively and find its base cases.',
    ],
  },
}
