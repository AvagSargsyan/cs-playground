import { PracticeRunner, type ExerciseDef } from '../../components/exercises/ExerciseShell'
import type { ModuleId } from '../../content/modules'
import { PracticeIntro } from '../shared/lesson'
import { Choose } from './exercises/Choose'
import { Count } from './exercises/Count'
import { Identify } from './exercises/Identify'
import { Manual } from './exercises/Manual'
import { Predict } from './exercises/Predict'

const EXERCISES: ExerciseDef[] = [
  {
    id: 'sorting-predict',
    title: 'Predict the next step',
    format: 'Select values',
    instructions: <p>Look at where the algorithm is, then predict its next swap.</p>,
    render: (p) => <Predict {...p} />,
    solution: (
      <p>
        The correct values are marked above. Bubble Sort swaps two neighbours only when the left one
        is bigger. Selection Sort swaps the smallest unsorted value with the first unsorted value,
        unless it is already there.
      </p>
    ),
  },
  {
    id: 'sorting-manual',
    title: 'Sort it yourself',
    format: 'Interactive execution',
    instructions: (
      <p>
        Run the algorithm by hand. Every move you make is checked against the real algorithm. Each
        retry switches between Bubble, Selection and Insertion Sort.
      </p>
    ),
    render: (p) => <Manual {...p} />,
    solution: (
      <p>
        Bubble Sort: swap neighbours when the left one is bigger. Selection Sort: always pick the
        smallest value that is not sorted yet. Insertion Sort: the key goes just after the last
        value in the sorted section that is smaller than it.
      </p>
    ),
  },
  {
    id: 'sorting-identify',
    title: 'Identify the algorithm',
    format: 'Replay + choice',
    instructions: <p>Study the steps carefully: each algorithm has its own pattern of moves.</p>,
    render: (p) => <Identify {...p} />,
    solution: (
      <p>
        Neighbours only → Bubble. One remembered value (◆) and a single swap per pass → Selection. A
        key and values moving right → Insertion. Splitting first → Merge.
      </p>
    ),
  },
  {
    id: 'sorting-choose',
    title: 'Choose the right algorithm',
    format: 'Two-part choice',
    instructions: <p>Read the situation, then choose an algorithm and the reason for it.</p>,
    render: (p) => <Choose {...p} />,
    solution: (
      <p>
        Nearly sorted data → Insertion Sort. Huge data that must always be fast → Merge Sort. As few
        writes as possible → Selection Sort.
      </p>
    ),
  },
  {
    id: 'sorting-count',
    title: 'Count the comparisons',
    format: 'Number',
    instructions: <p>Work it out on paper first. Every retry gives you a new list.</p>,
    render: (p) => <Count {...p} />,
    solution: (
      <p>
        Go through the algorithm step by step and add one for every comparison. The correct number
        is filled in above.
      </p>
    ),
  },
]

export default function Practice({ moduleId }: { moduleId: ModuleId }) {
  return (
    <>
      <PracticeIntro>
        Five exercises, one at a time. You get feedback straight away, and you can retry as often as
        you like. Most exercises give you a new problem on each try.
      </PracticeIntro>
      <div className="container">
        <PracticeRunner moduleId={moduleId} exercises={EXERCISES} />
      </div>
    </>
  )
}
