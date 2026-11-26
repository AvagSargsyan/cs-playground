import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { SORT_ALGORITHM_IDS, SORT_ALGORITHMS, SORT_LISTINGS } from '../../algorithms/sorting'
import { Callout } from '../../components/ui'
import { CodePanel } from '../../components/visualizers/Panels'
import type { ModuleId } from '../../content/modules'
import {
  AnnotatedCode,
  CheckYourself,
  DataTable,
  ExampleGrid,
  Figure,
  LearnPage,
  LessonSection,
  StepFrames,
  SubSection,
} from '../shared/lesson'
import { MiniBars } from './MiniBars'
import type { SortAlgorithmId } from './types'
import { walkthroughFrames, WALKTHROUGH_INPUT } from './walkthrough'
import { WorldSort } from './WorldSort'
import s from './sorting.module.css'

const line = (id: SortAlgorithmId, key: string) =>
  `Line ${(SORT_LISTINGS[id].pseudocode.at as Record<string, number>)[key]}`

function Facts({ id }: { id: SortAlgorithmId }) {
  const c = SORT_ALGORITHMS[id].complexity
  const items: [string, string][] = [
    ['Best case', c.best],
    ['Average case', c.average],
    ['Worst case', c.worst],
    ['Extra memory', c.space],
    ['Stable?', c.stable ? 'Yes' : 'No'],
  ]
  return (
    <dl className={s.facts}>
      {items.map(([k, v]) => (
        <div key={k} className={s.fact}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Walkthrough({ id }: { id: SortAlgorithmId }) {
  const frames = walkthroughFrames(id)
  const max = Math.max(...WALKTHROUGH_INPUT[id])
  return (
    <Figure
      caption={`${SORT_ALGORITHMS[id].name} on [${WALKTHROUGH_INPUT[id].join(', ')}], step by step.`}
    >
      <StepFrames
        frames={frames.map((f, i) => ({
          label: i === 0 ? 'Start' : i === frames.length - 1 ? 'Done' : `Step ${i}`,
          body: <MiniBars state={f.state} max={max} />,
          note: f.note,
        }))}
      />
    </Figure>
  )
}

function UsesAndLimits({ uses, limits }: { uses: ReactNode[]; limits: ReactNode[] }) {
  return (
    <div className={s.uses}>
      <div>
        <h4>Good for</h4>
        <ul>
          {uses.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Watch out</h4>
        <ul>
          {limits.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Learn({ moduleId }: { moduleId: ModuleId }) {
  return (
    <LearnPage
      moduleId={moduleId}
      intro="Computers sort things all the time: search results, playlists, prices, names. In this lesson you will see four different ways to put a list in order, and why some are much faster than others."
      toc={[
        ['what', 'What is sorting?'],
        ['world', 'Sorting around the world'],
        ['bubble', 'Bubble Sort'],
        ['selection', 'Selection Sort'],
        ['insertion', 'Insertion Sort'],
        ['merge', 'Merge Sort'],
        ['compare', 'Comparing them'],
      ]}
    >
      <LessonSection id="what" title="What is sorting?">
        <p>
          <strong>Sorting</strong> means putting items in a chosen order, for example from smallest
          to largest (<em>ascending</em>) or from largest to smallest (<em>descending</em>). To do
          this, a computer can only do two simple things: <strong>compare</strong> two items, and{' '}
          <strong>move</strong> items to new positions. Every sorting algorithm is a clever plan for
          which items to compare and move.
        </p>
        <ExampleGrid
          items={[
            { icon: '📚', title: 'Books on a shelf', text: 'By title, author or height.' },
            { icon: '📝', title: 'Exam scores', text: 'From the highest mark to the lowest.' },
            { icon: '🛒', title: 'Online shop', text: '“Price: low to high”.' },
            { icon: '🌍', title: 'Countries', text: 'By population or by area.' },
            { icon: '🚆', title: 'Train timetable', text: 'By departure time.' },
            { icon: '📇', title: 'Contacts', text: 'Names from A to Z.' },
          ]}
        />
        <Callout kind="predict">
          <p>
            Imagine 8 cards with numbers on them, face up on a table. Before reading on, write down
            how <em>you</em> would sort them. Do you look for the smallest card first? Do you swap
            neighbours? Keep your idea in mind: you will probably meet it below.
          </p>
        </Callout>
        <p>
          Why bother? Sorted data makes many other jobs easy: finding the highest score is instant,
          duplicates end up next to each other, and you can search a sorted list very quickly (that
          is the next lesson, <Link to="/binary-search/learn">Binary Search</Link>).
        </p>
      </LessonSection>

      <LessonSection id="world" title="Sorting around the world">
        <p>
          Before we sort numbers, a surprise: even &ldquo;alphabetical order&rdquo; is not the same
          everywhere. Each language has its own rules for its letters.
        </p>
        <WorldSort />
        <Callout kind="world" title="Talk about it">
          <p>
            How is alphabetical order taught in your language? Are there letters with accents,
            letters made of two characters, or a different alphabet? What should a contact list app
            do when it has names from many languages?
          </p>
        </Callout>
        <p>
          The big idea for computer science: the sorting <em>algorithm</em> stays the same. Only the{' '}
          <strong>comparison rule</strong> (which of two items comes first) changes. In the rest of
          this lesson we sort numbers, where the rule is simple: smaller comes first.
        </p>
      </LessonSection>

      <LessonSection id="algorithms-intro" eyebrow="Four algorithms" title="Four ways to sort">
        <p>
          Each algorithm below sorts the same kind of list. For each one you will see the idea, an
          illustrated example, the code, and how fast it is. In the pictures,{' '}
          <strong style={{ color: 'var(--uwc-orange)' }}>▲ orange</strong> marks values being
          compared, <strong style={{ color: 'var(--uwc-raspberry)' }}>⇄ red</strong> marks values
          being moved, and <strong style={{ color: 'var(--uwc-teal)' }}>✓ green</strong> marks
          values in their final place.
        </p>

        <SubSection id="bubble" title="1. Bubble Sort">
          <p>
            Walk along the list and compare each pair of <strong>neighbours</strong>. If they are in
            the wrong order, swap them. After one full pass, the largest value has &ldquo;bubbled
            up&rdquo; to the end. Repeat for the rest of the list. If a whole pass makes no swaps,
            the list is already sorted and we can stop early.
          </p>
          <p>
            <strong>Main idea:</strong> repeated comparisons and swapping of neighbours.
          </p>
          <Walkthrough id="bubble" />
          <AnnotatedCode
            notes={[
              {
                line: line('bubble', 'pass'),
                text: 'One pass through the list. After pass I, the last I + 1 values are in place.',
              },
              { line: line('bubble', 'compare'), text: 'Compare two neighbours.' },
              { line: line('bubble', 'swap'), text: 'Swap them if they are in the wrong order.' },
              {
                line: line('bubble', 'check'),
                text: 'No swaps in a pass means the list is sorted: stop early.',
              },
            ]}
          >
            <CodePanel listing={SORT_ALGORITHMS.bubble.code} title="Bubble Sort" />
          </AnnotatedCode>
          <Facts id="bubble" />
          <UsesAndLimits
            uses={[
              'Very small lists',
              'Checking that a list is already sorted (one pass, O(n))',
              'Learning how sorting works',
            ]}
            limits={[
              'Very slow on big lists: about n²/2 comparisons',
              'Lots of swaps when the list is reversed',
            ]}
          />
          <CheckYourself
            question="After the first pass of Bubble Sort on [7, 3, 9, 2], which value is guaranteed to be in its final place?"
            options={['2', '3', '7', '9']}
            correct={3}
            explanation="The largest value always bubbles all the way to the end in the first pass, so 9 ends up last."
          />
        </SubSection>

        <SubSection id="selection" title="2. Selection Sort">
          <p>
            Look through the unsorted part and <strong>select the smallest</strong> value. Swap it
            into the first unsorted position. Now the first value is done; repeat with the rest.
          </p>
          <p>
            <strong>Main idea:</strong> find the smallest remaining value and put it next.
          </p>
          <Walkthrough id="selection" />
          <AnnotatedCode
            notes={[
              {
                line: line('selection', 'assume'),
                text: 'Start by assuming the first unsorted value is the smallest.',
              },
              {
                line: line('selection', 'compare'),
                text: 'Compare each remaining value with the smallest so far.',
              },
              {
                line: line('selection', 'newMin'),
                text: 'Remember the position of a new smallest value.',
              },
              {
                line: line('selection', 'swap'),
                text: 'At most one swap per pass puts the smallest value in place.',
              },
            ]}
          >
            <CodePanel listing={SORT_ALGORITHMS.selection.code} title="Selection Sort" />
          </AnnotatedCode>
          <Facts id="selection" />
          <UsesAndLimits
            uses={[
              'When moving data is expensive: at most n − 1 swaps',
              'Small lists',
              'Simple to write and explain',
            ]}
            limits={[
              'Always about n²/2 comparisons, even if the list is already sorted',
              'Not stable: equal values can change their order',
            ]}
          />
          <CheckYourself
            question="Selection Sort runs on a list that is already sorted. How many swaps does it make?"
            options={['0', '1', 'n − 1', 'n²']}
            correct={0}
            explanation="Each pass finds that the smallest value is already in place, so it never swaps. It still makes all the comparisons, though."
          />
        </SubSection>

        <SubSection id="insertion" title="3. Insertion Sort">
          <p>
            Keep a <strong>sorted section</strong> on the left. Take the next value (the{' '}
            <em>key</em>) and slide it left past every bigger value, then drop it into the gap. The
            sorted section grows by one each time. This is how most people sort a hand of playing
            cards.
          </p>
          <p>
            <strong>Main idea:</strong> build a sorted section one element at a time.
          </p>
          <Walkthrough id="insertion" />
          <AnnotatedCode
            notes={[
              { line: line('insertion', 'key'), text: 'Take the next value out as the key.' },
              {
                line: line('insertion', 'compare'),
                text: 'Keep going left while the values are bigger than the key.',
              },
              {
                line: line('insertion', 'shift'),
                text: 'Shift a bigger value one place right to make room.',
              },
              { line: line('insertion', 'insert'), text: 'Drop the key into the gap.' },
            ]}
          >
            <CodePanel listing={SORT_ALGORITHMS.insertion.code} title="Insertion Sort" />
          </AnnotatedCode>
          <Facts id="insertion" />
          <UsesAndLimits
            uses={[
              'Nearly sorted lists: almost O(n)',
              'Small lists (fast in practice)',
              'Adding new items to a list that is already sorted',
            ]}
            limits={['About n² work on random or reversed lists']}
          />
          <CheckYourself
            question="Which list makes Insertion Sort do the least work?"
            options={['[1, 2, 3, 5, 4]', '[5, 4, 3, 2, 1]', '[3, 5, 1, 4, 2]']}
            correct={0}
            explanation="In a nearly sorted list each key only moves a little (or not at all), so very few comparisons and shifts are needed."
          />
        </SubSection>

        <SubSection id="merge" title="4. Merge Sort">
          <p>
            <strong>Divide and conquer.</strong> Split the list in half, then split each half again,
            until every piece has one value (a list of one value is already sorted). Then{' '}
            <strong>merge</strong> pairs of sorted pieces: look at the front of both pieces, take
            the smaller value, and repeat. Merging is fast because both pieces are already sorted.
          </p>
          <p>
            <strong>Main idea:</strong> split, sort the halves, merge.
          </p>
          <Walkthrough id="merge" />
          <AnnotatedCode
            notes={[
              {
                line: line('merge', 'base'),
                text: 'A piece with 0 or 1 values is already sorted: this stops the splitting.',
              },
              {
                line: line('merge', 'split'),
                text: 'Find the middle and sort each half. Merge Sort calls itself: that is recursion (lesson 3).',
              },
              {
                line: line('merge', 'compare'),
                text: 'Take the smaller front value from the two halves.',
              },
              {
                line: line('merge', 'write'),
                text: 'Copy the merged values back. This needs an extra list, so Merge Sort uses O(n) memory.',
              },
            ]}
          >
            <CodePanel listing={SORT_ALGORITHMS.merge.code} title="Merge Sort" />
          </AnnotatedCode>
          <Facts id="merge" />
          <UsesAndLimits
            uses={[
              'Large lists: always O(n log n)',
              'When equal items must keep their order (stable)',
              'Data too big for memory, sorted in chunks',
            ]}
            limits={[
              'Needs an extra list as big as the input',
              'More complicated to write',
              'Slower than simple sorts on tiny lists',
            ]}
          />
          <CheckYourself
            question="Why is merging two halves quick?"
            options={[
              'Both halves are already sorted',
              'The halves are always the same size',
              'Merge Sort never compares values',
            ]}
            correct={0}
            explanation="Because both halves are sorted, the next smallest value is always at the front of one of them. Each comparison sends one value into the merged list, so merging k values takes at most k − 1 comparisons."
          />
        </SubSection>
      </LessonSection>

      <LessonSection id="compare" title="Comparing the algorithms">
        <p>
          We describe speed with <strong>Big O notation</strong>: how the amount of work grows when
          the list gets bigger. <em>n</em> is the number of values.
        </p>
        <ul>
          <li>
            <strong>O(n²)</strong>: double the list, about four times the work. For 1,000 values
            that is around 1,000,000 steps.
          </li>
          <li>
            <strong>O(n log n)</strong>: grows only a little faster than the list itself. For 1,000
            values it is around 10,000 steps, about 100 times less.
          </li>
          <li>
            <strong>O(n)</strong>: one quick look at every value. Bubble and Insertion Sort reach
            this only when the list is already sorted.
          </li>
        </ul>
        <DataTable
          head={['Algorithm', 'Best case', 'Average case', 'Worst case', 'Extra memory', 'Stable?']}
          rows={SORT_ALGORITHM_IDS.map((id) => {
            const c = SORT_ALGORITHMS[id].complexity
            return [
              SORT_ALGORITHMS[id].name,
              c.best,
              c.average,
              c.worst,
              c.space,
              c.stable ? 'Yes' : 'No',
            ]
          })}
        />
        <p>
          <strong>Stable</strong> means equal values keep their original order. That matters when
          you sort by one thing and then another, for example students by class and then by name.
        </p>
        <Callout kind="didyouknow">
          <p>
            Python&rsquo;s built-in <code>sorted()</code> uses <strong>Timsort</strong>, a mix of
            Merge Sort and Insertion Sort. It uses Insertion Sort for small pieces (where it is
            fast) and merging for the big picture.
          </p>
        </Callout>
        <CheckYourself
          question="You need to sort 1 million exam results as fast as possible. Which algorithm is the best choice here?"
          options={['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort']}
          correct={3}
          explanation="Merge Sort is O(n log n) in every case. The other three need about n² steps on random data: around a million million for a million results."
        />
        <p>
          Ready? In <Link to="/sorting/explore">Explore</Link> you can run all four algorithms on
          your own lists and race them against each other.
        </p>
      </LessonSection>
    </LearnPage>
  )
}
