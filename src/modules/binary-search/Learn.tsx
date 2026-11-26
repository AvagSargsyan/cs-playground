import { maxBinaryComparisons, SEARCH_LISTINGS } from '../../algorithms/search'
import { Callout } from '../../components/ui'
import { CodeBlock } from '../../components/visualizers/Panels'
import type { ModuleId } from '../../content/modules'
import {
  AnnotatedCode,
  CheckYourself,
  DataTable,
  ExampleGrid,
  Figure,
  LearnPage,
  LessonSection,
  SubSection,
} from '../shared/lesson'
import { CellArray, SearchLegend } from './CellArray'
import { GrowthChart, GuessGame, Walkthrough } from './LearnWidgets'
import s from './binarySearch.module.css'

const SORTED = [3, 8, 12, 19, 24, 31, 40, 47, 52]
const UNSORTED = [8, 3, 11, 1, 6, 14, 2]
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const fmt = (n: number) => n.toLocaleString('en-US')

export default function Learn({ moduleId }: { moduleId: ModuleId }) {
  const at = SEARCH_LISTINGS.binary.pseudocode.at
  return (
    <LearnPage
      moduleId={moduleId}
      intro={
        <>
          How do you find one item among thousands, or millions, without checking them all? In this
          lesson you will learn Binary Search: a way to find things in sorted data by throwing away
          half of the possibilities with every question.
        </>
      }
      toc={[
        ['searching', 'What is searching?'],
        ['sorted', 'Sorted vs unsorted data'],
        ['linear-vs-binary', 'Linear vs Binary Search'],
        ['how-it-works', 'How Binary Search works'],
        ['game', 'Guess my number'],
        ['complexity', 'How fast is it?'],
      ]}
    >
      <LessonSection id="searching" title="What is searching?">
        <p>
          <strong>Searching</strong> means finding where an item is in a collection of data, or
          finding out that it is not there. The item you are looking for is called the{' '}
          <strong>target</strong>.
        </p>
        <p>
          Computers search all the time: every time you look up a contact, a word or a product, some
          search algorithm is doing the work. Here are some searches you already do:
        </p>
        <ExampleGrid
          items={[
            {
              title: 'A word in a dictionary',
              text: 'English, Armenian, Spanish or Japanese: dictionaries are sorted, so you open near the right letter instead of reading from page 1.',
            },
            {
              title: 'A name in your contacts',
              text: 'Contacts are sorted alphabetically, so you can jump straight to the right part of the list.',
            },
            {
              title: 'A page in a book',
              text: 'Looking for page 214? You open somewhere in the middle and move forwards or backwards.',
            },
            {
              title: 'A product by price',
              text: 'In an online shop sorted by price, finding items around €20 is quick because cheaper ones come first.',
            },
          ]}
        />
        <Callout kind="predict">
          <p>
            You have a 1,000-page dictionary and need the word “moon”. Where do you open it first?
            Think about it before reading on.
          </p>
        </Callout>
      </LessonSection>

      <LessonSection id="sorted" title="Sorted vs unsorted data">
        <p>
          Data is <strong>sorted</strong> when it is in order, for example from smallest to largest
          number or from A to Z. In <strong>unsorted</strong> data, the items are in no particular
          order.
        </p>
        <Figure caption="The same kind of data, unsorted (top) and sorted from smallest to largest (bottom).">
          <div className={s.compareRows}>
            <div>
              <p className={s.rowLabel}>Unsorted</p>
              <CellArray
                view={{ values: [31, 8, 52, 3, 24, 47, 12, 40, 19] }}
                size="sm"
                label="Unsorted array"
              />
            </div>
            <div>
              <p className={s.rowLabel}>Sorted</p>
              <CellArray view={{ values: SORTED }} size="sm" label="Sorted array" />
            </div>
          </div>
        </Figure>
        <p>
          In unsorted data, the only safe way to find something is to look at every item. In sorted
          data you can be much smarter, because the position of an item tells you something about
          where the others are.
        </p>
      </LessonSection>

      <LessonSection id="linear-vs-binary" title="Linear Search vs Binary Search">
        <SubSection title="Linear Search: one by one">
          <p>
            <strong>Linear Search</strong> checks the items one at a time, from the first to the
            last, until it finds the target or runs out of items. It works on any data, sorted or
            not. But with 1,000 items it may need 1,000 checks.
          </p>
        </SubSection>
        <SubSection title="Binary Search: check the middle, throw away half">
          <p>
            <strong>Binary Search</strong> only works on sorted data. It looks at the{' '}
            <strong>middle</strong> item first:
          </p>
          <ul>
            <li>If the middle item is the target, you are done.</li>
            <li>
              If the target is <em>bigger</em>, it can only be in the right half, so the whole left
              half is ruled out.
            </li>
            <li>
              If the target is <em>smaller</em>, it can only be in the left half, so the right half
              is ruled out.
            </li>
          </ul>
          <p>Then it repeats on the half that is left, again and again.</p>
        </SubSection>
        <SubSection title="Why the data must be sorted">
          <p>
            Ruling out half of the data only makes sense if everything on the left is smaller and
            everything on the right is bigger. Watch what goes wrong when we use Binary Search to
            look for <strong>2</strong> in an unsorted list:
          </p>
          <Walkthrough
            steps={[
              {
                title: 'Middle is 1, and 1 < 2, so go right',
                view: { values: UNSORTED, left: 0, right: 6, mid: 3 },
                note: 'Binary Search assumes everything left of the middle is smaller than 1, so also smaller than 2, and rules out indices 0–3.',
              },
              {
                title: 'Middle is 14, and 14 > 2, so go left',
                view: { values: UNSORTED, left: 4, right: 6, mid: 5, eliminated: range(0, 3) },
                note: 'Now it rules out indices 5 and 6, but 2 is at index 6!',
              },
              {
                title: 'Middle is 6, and 6 > 2, so go left… nothing left',
                view: {
                  values: UNSORTED,
                  left: 4,
                  right: 4,
                  mid: 4,
                  eliminated: [0, 1, 2, 3, 5, 6],
                },
                note: 'The range is empty and the search answers “not found”, even though 2 is in the list.',
              },
            ]}
          />
          <Callout kind="warning" title="Binary Search needs sorted data">
            <p>
              On unsorted data Binary Search can give the wrong answer. Sort first (see the Sorting
              lesson), or use Linear Search.
            </p>
          </Callout>
        </SubSection>
      </LessonSection>

      <LessonSection id="how-it-works" title="How Binary Search works">
        <p>Binary Search keeps track of a few things while it works:</p>
        <ul className={s.termList}>
          <li>
            <span className={s.term}>Target</span>
            <span>The value we are looking for.</span>
          </li>
          <li>
            <span className={s.term}>Left (L)</span>
            <span>The index of the first item that could still be the target.</span>
          </li>
          <li>
            <span className={s.term}>Right (R)</span>
            <span>The index of the last item that could still be the target.</span>
          </li>
          <li>
            <span className={s.term}>Middle (M)</span>
            <span>
              The index halfway between them: <code>MID = (LEFT + RIGHT) div 2</code>.{' '}
              <code>div</code> divides and rounds <em>down</em>, so (5 + 8) div 2 = 6.
            </span>
          </li>
        </ul>
        <p>
          Everything from LEFT to RIGHT is the <strong>search range</strong>. Each step either finds
          the target or makes the range smaller by moving LEFT or RIGHT past the middle.
        </p>
        <SubSection title="Example: find 31">
          <SearchLegend />
          <Walkthrough
            steps={[
              {
                title: 'LEFT = 0, RIGHT = 8, so MID = (0 + 8) div 2 = 4',
                view: { values: SORTED, left: 0, right: 8, mid: 4 },
                note: 'A[4] = 24. 24 < 31, so 31 must be to the right. Move LEFT to MID + 1 = 5.',
              },
              {
                title: 'LEFT = 5, RIGHT = 8, so MID = (5 + 8) div 2 = 6',
                view: { values: SORTED, left: 5, right: 8, mid: 6, eliminated: range(0, 4) },
                note: 'A[6] = 40. 40 > 31, so 31 must be to the left. Move RIGHT to MID − 1 = 5.',
              },
              {
                title: 'LEFT = 5, RIGHT = 5, so MID = (5 + 5) div 2 = 5',
                view: {
                  values: SORTED,
                  left: 5,
                  right: 5,
                  mid: 5,
                  eliminated: [...range(0, 4), 6, 7, 8],
                },
                note: 'A[5] = 31. Found it, after only 3 comparisons out of 9 items.',
              },
            ]}
          />
        </SubSection>
        <SubSection title="What if the target is not there?">
          <p>
            Search for 20 in the same list: 24 is too big (RIGHT = 3), 8 is too small (LEFT = 2), 12
            is too small (LEFT = 3), 19 is too small (LEFT = 4). Now LEFT (4) is greater than RIGHT
            (3): the range is empty, so 20 is not in the list.
          </p>
          <Figure caption="After 4 comparisons LEFT has passed RIGHT. Every item has been ruled out.">
            <CellArray
              view={{ values: SORTED, eliminated: range(0, 8), foundIndex: -1 }}
              size="sm"
              label="Every item ruled out"
            />
          </Figure>
        </SubSection>
        <CheckYourself
          question="In [2, 5, 9, 13, 20, 27], LEFT = 0 and RIGHT = 5. Which index is MID?"
          options={['2', '3', '2.5']}
          correct={0}
          explanation="(0 + 5) div 2 = 5 div 2 = 2, because div rounds down. Index 2 holds 9. Indices are always whole numbers, so 2.5 is impossible."
        />
        <SubSection title="The algorithm in pseudocode">
          <AnnotatedCode
            notes={[
              {
                line: `Lines 2–${at.bounds}`,
                text: 'At the start the whole array is in range: LEFT is the first index, RIGHT the last.',
              },
              {
                line: `Line ${at.loop}`,
                text: 'Keep going while the range still has at least one item (LEFT ≤ RIGHT).',
              },
              { line: `Line ${at.mid}`, text: 'Find the middle. div rounds down.' },
              {
                line: `Lines ${at.compare}–${at.found}`,
                text: 'Found the target: return where it is.',
              },
              {
                line: `Lines ${at.goRight - 1}–${at.goLeft}`,
                text: 'Otherwise rule out the middle and one half by moving LEFT or RIGHT past MID.',
              },
              {
                line: `Line ${at.notFound}`,
                text: 'The range is empty: return −1, which means “not found”.',
              },
            ]}
          >
            <CodeBlock code={SEARCH_LISTINGS.binary.pseudocode.text} language="pseudocode" />
          </AnnotatedCode>
        </SubSection>
        <Callout kind="didyouknow">
          <p>
            In the <code>MID</code> line, writing <code>LEFT + (RIGHT - LEFT) div 2</code> gives the
            same answer. Some programming languages need that version: with very large arrays, LEFT
            + RIGHT can be too big for the computer to store.
          </p>
        </Callout>
      </LessonSection>

      <LessonSection id="game" title="Play: guess my number">
        <p>
          The computer picks a number from 1 to 100. Each time you guess, it tells you “higher” or
          “lower”. Try to find it in as few guesses as you can. Then try the “Guess the middle”
          button every time.
        </p>
        <GuessGame />
      </LessonSection>

      <LessonSection id="complexity" title="How fast is it?">
        <p>
          Every comparison in Binary Search cuts the range in half. So the question “how many
          comparisons?” becomes “how many times can I halve the list before one item is left?”
        </p>
        <ul className={s.halving} aria-label="Halving 1,000 items">
          {[1000, 500, 250, 125, 62, 31, 15, 7, 3, 1].map((n) => (
            <li key={n}>{fmt(n)}</li>
          ))}
        </ul>
        <p>
          Starting from 1,000 items, you only need about <strong>10</strong> comparisons (9
          halvings, then one last check). Double the list to 2,000 items and you need just{' '}
          <strong>one</strong> more step. Linear Search, in the worst case, needs 1,000 and then
          2,000 checks.
        </p>
        <Figure caption="Worst-case number of comparisons as the list grows.">
          <GrowthChart />
        </Figure>
        <p>
          Computer scientists write this with <strong>Big O notation</strong>, which describes how
          the work grows as the input gets bigger:
        </p>
        <ul>
          <li>
            Linear Search is <strong>O(n)</strong>: twice as many items, about twice as much work.
          </li>
          <li>
            Binary Search is <strong>O(log n)</strong>: twice as many items, just one more step.
            log₂ n means “how many times can you halve n”.
          </li>
        </ul>
        <DataTable
          caption="Worst-case comparisons"
          head={['Items (n)', 'Linear Search', 'Binary Search']}
          rows={[10, 100, 1000, 1_000_000].map((n) => [
            fmt(n),
            fmt(n),
            String(maxBinaryComparisons(n)),
          ])}
        />
        <Callout kind="didyouknow">
          <p>
            A list of every person on Earth, about 8 billion names sorted alphabetically, can be
            searched with at most <strong>33</strong> comparisons.
          </p>
        </Callout>
        <CheckYourself
          question="Binary Search needs at most 10 comparisons for 1,000 sorted items. About how many does it need for 2,000?"
          options={['11', '20', '2,000']}
          correct={0}
          explanation="Doubling the list adds just one halving step: the first comparison cuts 2,000 down to 1,000, then it is the same as before."
        />
      </LessonSection>
    </LearnPage>
  )
}
