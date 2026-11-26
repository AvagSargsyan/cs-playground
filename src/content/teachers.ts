import type { ModuleId, StageId } from './modules'

export type Misconception = {
  /** What students often believe. */
  belief: string
  /** Why it's wrong and how the lesson tackles it. */
  howAddressed: string
}

export type PlanStep = {
  minutes: number
  title: string
  /** What happens in this part of the lesson. */
  activity: string
  /** Optional link into the app for this step. */
  stage?: StageId
}

export type TeacherNotes = {
  summary: string
  objectives: string[]
  priorKnowledge: string[]
  misconceptions: Misconception[]
  plan: PlanStep[]
  discussion: { question: string; kind: 'concept' | 'intercultural' | 'ethical' }[]
  differentiation: { support: string[]; stretch: string[] }
  assessment: string[]
  ibLinks: { tok?: string; cas?: string }
}

export const LESSON_MINUTES = 60

export const TEACHER_NOTES: Record<ModuleId, TeacherNotes> = {
  sorting: {
    summary:
      'Students compare four sorting algorithms on the same data, see why some do far less work than others, and practise tracing them by hand.',
    objectives: [
      'Describe how bubble, selection, insertion and merge sort put a list in order.',
      'Trace one pass of bubble sort and one step of selection sort on a short list.',
      'Count comparisons and swaps, and use them to compare algorithms.',
      'Explain O(n²) and O(n log n) in plain words and choose a sensible algorithm for a situation.',
    ],
    priorKnowledge: [
      'What a list (array) and an index are.',
      'Comparing two values with < and >.',
      'Reading simple pseudocode with loops and if statements.',
    ],
    misconceptions: [
      {
        belief: 'Bubble sort is always slow.',
        howAddressed:
          'With the early-exit check, bubble sort finishes in one pass on data that is already sorted (O(n)). Students try the "Nearly sorted" preset in Explore and watch the comparison count stay low.',
      },
      {
        belief: 'Merge sort sorts the list in place.',
        howAddressed:
          'The Explore view shows the extra buffer merge sort writes into, and the stats count "writes" instead of swaps. The Learn page lists its O(n) extra memory.',
      },
      {
        belief: 'Longer or cleverer code always runs slower.',
        howAddressed:
          'Merge sort has the most code but the fewest comparisons on large random lists. The “Race two algorithms” view in Explore puts two algorithms side by side on the same array.',
      },
      {
        belief: 'Alphabetical order is the same in every language.',
        howAddressed:
          '"Sorting around the world" sorts one list of names with different language rules, showing that the comparison rule decides the order, not the algorithm.',
      },
    ],
    plan: [
      {
        minutes: 5,
        title: 'Hook',
        activity:
          'Give each pair 8 numbered cards and ask them to sort them and write down the steps they used. Collect two different strategies on the board.',
      },
      {
        minutes: 10,
        title: 'Learn',
        activity:
          'Students read the introduction and one algorithm of their choice, answering the "Check yourself" questions. Link their card strategies to the algorithm names.',
        stage: 'learn',
      },
      {
        minutes: 15,
        title: 'Explore in pairs',
        activity:
          'Pairs run each algorithm on the same array, then on "Reversed" and "Nearly sorted". They record comparisons and swaps in a table and predict before pressing Play.',
        stage: 'explore',
      },
      {
        minutes: 20,
        title: 'Practice',
        activity:
          'Individual work on the five exercises. Circulate and ask students to explain a wrong answer out loud before they retry.',
        stage: 'practice',
      },
      {
        minutes: 10,
        title: 'Plenary',
        activity:
          'Compare the pairs’ tables. Ask: which algorithm would you use for 10 items? For 1 million? Finish with the exit ticket.',
      },
    ],
    discussion: [
      {
        question:
          'Why does a nearly sorted list make insertion sort fast but barely helps selection sort?',
        kind: 'concept',
      },
      {
        question:
          'In your language, how are words ordered alphabetically? What would a program need to know to sort names from every student in this class correctly?',
        kind: 'intercultural',
      },
      {
        question:
          'Online shops let you sort products by "relevance". Who decides what is relevant, and is that sorting neutral?',
        kind: 'ethical',
      },
    ],
    differentiation: {
      support: [
        'Use arrays of 5–6 values and the 0.5× speed in Explore.',
        'Focus on bubble and selection sort first; leave merge sort for later.',
        'Give a printed table for recording comparisons and swaps.',
      ],
      stretch: [
        'Explain why merge sort is O(n log n) by counting the levels of splitting.',
        'Find an input where insertion sort beats merge sort on comparisons, and explain why.',
        'Research a stable vs unstable sort and test stability with "Few unique values".',
      ],
    },
    assessment: [
      'Exit ticket: show the list after the first pass of bubble sort on [5, 1, 4, 2].',
      'Practice exercises "Predict the next step" and "Count the comparisons" as a quick check.',
      'Short written answer: choose an algorithm for a nearly sorted class list and justify it.',
    ],
    ibLinks: {
      tok: 'Is an algorithm "better" in itself, or only for a particular kind of data and purpose?',
    },
  },
  'binary-search': {
    summary:
      'Students discover why binary search needs sorted data, run it step by step, and compare how many guesses it needs against checking every item.',
    objectives: [
      'Explain linear and binary search in their own words.',
      'Explain why binary search only works on sorted data.',
      'Trace binary search: find the middle, compare, and update the left and right bounds.',
      'Compare O(n) and O(log n) using real numbers of comparisons.',
    ],
    priorKnowledge: [
      'Lists and indexes, starting at 0.',
      'Integer division / rounding down.',
      'What a sorted list is (from the Sorting lesson).',
    ],
    misconceptions: [
      {
        belief: 'Binary search works on any list.',
        howAddressed:
          'The Learn page runs binary search on an unsorted list and it fails to find a value that is there. Custom input in Explore is checked and rejected if it is not sorted.',
      },
      {
        belief: 'The middle is always exactly in the middle.',
        howAddressed:
          'With an even number of items there are two middles. The app always uses mid = floor((left + right) / 2), and the "Find the midpoint" exercise practises it.',
      },
      {
        belief: 'Binary search is about twice as fast as linear search.',
        howAddressed:
          'The comparison feature shows 1,000 items need up to 1,000 linear checks but only 10 binary ones. The "Complexity challenge" exercise matches sizes to comparisons.',
      },
      {
        belief: 'If the value is not found, the search broke.',
        howAddressed:
          'Explore lets students search for missing values and shows the range becoming empty (left > right), which is the correct "not found" ending.',
      },
    ],
    plan: [
      {
        minutes: 5,
        title: 'Hook',
        activity:
          '"Guess my number between 1 and 100" with the class. Count the guesses. Ask: what is the best first guess, and why?',
      },
      {
        minutes: 10,
        title: 'Learn',
        activity:
          'Students read linear vs binary search and the walkthrough, then answer the "Check yourself" questions.',
        stage: 'learn',
      },
      {
        minutes: 15,
        title: 'Explore in pairs',
        activity:
          'One student predicts the next middle index, the other steps the visualization. Swap roles. Then run linear vs binary on the same target and record both counts.',
        stage: 'explore',
      },
      {
        minutes: 20,
        title: 'Practice',
        activity:
          'Individual work on the five exercises, especially "Complete the search" and "Find the mistake".',
        stage: 'practice',
      },
      {
        minutes: 10,
        title: 'Plenary',
        activity:
          'How many guesses for a list of 1 million names? Link the answer to the phone contact list and dictionaries. Exit ticket.',
      },
    ],
    discussion: [
      {
        question:
          'Each comparison halves the remaining list. Why does doubling the list size add only one more comparison?',
        kind: 'concept',
      },
      {
        question:
          'Paper dictionaries in different languages are ordered differently. How would binary search work in a dictionary of a language you speak?',
        kind: 'intercultural',
      },
      {
        question:
          'Fast search lets organisations look people up in huge databases in milliseconds. What should limit who can search for whom?',
        kind: 'ethical',
      },
    ],
    differentiation: {
      support: [
        'Start with 7 or 15 items so the middle is easy to find.',
        'Let students write left, mid and right on mini whiteboards at each step.',
        'Use the "Choose the next direction" exercise before "Complete the search".',
      ],
      stretch: [
        'Show why the maximum number of comparisons is floor(log₂ n) + 1.',
        'Change the algorithm to find the first of several equal values.',
        'Write binary search recursively (links to the Recursion lesson).',
      ],
    },
    assessment: [
      'Exit ticket: trace binary search for 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72], listing left, mid and right.',
      'Practice exercise "Find the mistake" as evidence of understanding the bounds.',
      'Explain in two sentences why binary search cannot be used on an unsorted list.',
    ],
    ibLinks: {
      tok: 'When we say an algorithm is "efficient", efficient for whom and by what measure?',
    },
  },
  recursion: {
    summary:
      'An introduction to recursion with two small examples, countdown and factorial. Students see each call as a frame on the call stack and watch the results return.',
    objectives: [
      'Explain what it means for a function to call itself.',
      'Identify the base case and the recursive case in a short function.',
      'Trace the call stack for countdown(n) and factorial(n), including the return order.',
      'Explain what goes wrong without a correct base case.',
    ],
    priorKnowledge: [
      'What a function, a parameter and a return value are.',
      'Simple if/else statements.',
      'Multiplication, and the idea of factorial (4! = 4 × 3 × 2 × 1).',
    ],
    misconceptions: [
      {
        belief: 'Recursion is just a loop.',
        howAddressed:
          'Factorial needs each call to wait for the result of the next one. The call stack view shows the pending "4 × ?" frames that a simple loop does not need.',
      },
      {
        belief: 'The function runs once and finishes.',
        howAddressed:
          'Each call appears as its own frame with its own value of n. The stats show the number of calls and the stack depth.',
      },
      {
        belief: 'The base case is optional.',
        howAddressed:
          'The Learn page animates a stack that keeps growing without a base case. The "Fix the recursion" exercise asks students to find the missing or wrong base case.',
      },
      {
        belief: 'Results come back in the same order the calls were made.',
        howAddressed:
          'The return phase pops frames from the top: the last call returns first. The "Arrange the call stack" exercise practises the order.',
      },
    ],
    plan: [
      {
        minutes: 5,
        title: 'Hook',
        activity:
          'Show nesting dolls (or a picture). Ask: how do you count the dolls if you can only open one at a time? Agree on a rule that stops.',
      },
      {
        minutes: 10,
        title: 'Learn',
        activity:
          'Students read base case and recursive case, then the countdown and factorial walkthroughs, answering the "Check yourself" questions.',
        stage: 'learn',
      },
      {
        minutes: 15,
        title: 'Explore in pairs',
        activity:
          'Pairs step through countdown(4) and factorial(4). Before each return, they predict the value that comes back. Then try n = 0.',
        stage: 'explore',
      },
      {
        minutes: 20,
        title: 'Practice',
        activity:
          'Individual work on the five exercises. "Fix the recursion" is good for pair talk.',
        stage: 'practice',
      },
      {
        minutes: 10,
        title: 'Plenary',
        activity:
          'Role-play the call stack: each student is a frame and passes a value back. Exit ticket.',
      },
    ],
    discussion: [
      {
        question:
          'Every recursive function could be written with a loop. When would you still choose recursion?',
        kind: 'concept',
      },
      {
        question:
          'Nesting dolls, stories inside stories, repeating patterns in carpets and buildings: what "recursive" patterns do you know from your own culture?',
        kind: 'intercultural',
      },
      {
        question:
          'A program with a missing base case can crash a system. Who is responsible when code like this causes harm: the programmer, the tester or the company?',
        kind: 'ethical',
      },
    ],
    differentiation: {
      support: [
        'Stay with countdown and inputs of 3–4.',
        'Give a printed stack diagram to fill in while stepping through Explore.',
        'Use the "Predict the next call" exercise first.',
      ],
      stretch: [
        'Write a recursive sum of a list and trace its stack.',
        'Compare recursive and loop versions of factorial for memory use.',
        'Write binary search recursively and identify its base cases.',
      ],
    },
    assessment: [
      'Exit ticket: what does factorial(3) return, and in what order do the calls return?',
      'Practice exercise "Identify the base case" as a quick check.',
      'Explain in one sentence what would happen to countdown without its base case.',
    ],
    ibLinks: {
      tok: 'Can something be defined in terms of itself? How do recursive definitions in mathematics and language avoid being circular?',
      cas: 'Students could run a short "unplugged" recursion workshop for younger students using nesting dolls or a human call stack.',
    },
  },
}
