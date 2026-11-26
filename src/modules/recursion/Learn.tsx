import { RECURSION_EXAMPLES } from '../../algorithms/recursion'
import { Callout } from '../../components/ui'
import { CodeBlock } from '../../components/visualizers/Panels'
import type { ModuleId } from '../../content/modules'
import {
  AnnotatedCode,
  CheckYourself,
  ExampleGrid,
  Figure,
  LearnPage,
  LessonSection,
  StepFrames,
  SubSection,
} from '../shared/lesson'
import { MiniStack, NestingDolls, PlatesArt, StackOverflowDemo } from './LearnWidgets'
import s from './recursion.module.css'

const GREET_CODE = `def greet(name):
    print("Hello, " + name + "!")

greet("Ana")    # Hello, Ana!
greet("Kofi")   # Hello, Kofi!`

const TOC: [string, string][] = [
  ['function', 'What is a function?'],
  ['calling-itself', 'A function that calls itself'],
  ['two-ideas', 'Base case and recursive case'],
  ['no-base-case', 'What if there is no base case?'],
  ['countdown', 'Example 1: countdown'],
  ['factorial', 'Example 2: factorial'],
  ['call-stack', 'The call stack'],
]

export default function Learn({ moduleId }: { moduleId: ModuleId }) {
  const countdown = RECURSION_EXAMPLES.countdown.code
  const factorial = RECURSION_EXAMPLES.factorial.code

  return (
    <LearnPage
      moduleId={moduleId}
      toc={TOC}
      intro={
        <>
          Recursion is when a function solves a problem by calling itself on a smaller version of
          the same problem. It sounds strange at first, so we will build it up slowly.
        </>
      }
    >
      <LessonSection id="function" title="What is a function?">
        <p>
          A <strong>function</strong> is a named set of instructions. You give it an input, it does
          its job, and it may give back a result. You write it once and use it as often as you like.
        </p>
        <Figure caption="A function is like a small machine: input goes in, the instructions run, output comes out.">
          <div className={s.machine}>
            <span className={s.machineValue}>"Ana"</span>
            <span className={s.arrow} aria-hidden="true">
              →
            </span>
            <span className={s.machineBox}>greet(name)</span>
            <span className={s.arrow} aria-hidden="true">
              →
            </span>
            <span className={s.machineValue}>Hello, Ana!</span>
          </div>
        </Figure>
        <CodeBlock code={GREET_CODE} language="python" label="A simple greet function in Python" />
        <p style={{ marginTop: 'var(--space-4)' }}>
          Using a function is called <strong>calling</strong> it. Above, <code>greet</code> is
          called twice with two different inputs.
        </p>
      </LessonSection>

      <LessonSection id="calling-itself" title="A function that calls itself">
        <p>
          Functions can call other functions. A <strong>recursive</strong> function goes one step
          further: it calls <em>itself</em>. Each time, it works on a smaller piece of the problem,
          until the piece is so small that the answer is obvious.
        </p>
        <Callout kind="predict">
          <p>
            A set of nesting dolls has 5 dolls. If “open a doll” is the instruction, how do you know
            when to stop? Think about it, then open the dolls below.
          </p>
        </Callout>
        <Figure caption="Each doll contains a smaller version of itself, until the last, solid one.">
          <NestingDolls />
        </Figure>
        <p>Recursion is everywhere once you start looking:</p>
        <ExampleGrid
          items={[
            {
              icon: '🪆',
              title: 'Nesting dolls',
              text: 'Open a doll and find a smaller doll. Stop at the solid one.',
            },
            {
              icon: '📦',
              title: 'Boxes inside boxes',
              text: 'To find a key, open the box. If there is another box inside, do the same again.',
            },
            {
              icon: '🪜',
              title: 'Walking down stairs',
              text: 'Go down one step, then “walk down the stairs” again. Stop at the ground floor.',
            },
            {
              icon: '📁',
              title: 'Folders in folders',
              text: 'Counting files in a folder means counting the files in each folder inside it.',
            },
          ]}
        />
      </LessonSection>

      <LessonSection id="two-ideas" title="Base case and recursive case">
        <p>Every recursive function needs two parts:</p>
        <ul>
          <li>
            <strong>Base case</strong>: the simplest situation, where the function knows the answer
            straight away and <em>does not</em> call itself. This is what stops the recursion. (The
            solid doll.)
          </li>
          <li>
            <strong>Recursive case</strong>: the function calls itself with a{' '}
            <em>smaller or simpler</em> input, so each call gets closer to the base case. (Open the
            doll, then deal with the smaller one inside.)
          </li>
        </ul>
        <AnnotatedCode
          notes={[
            { line: 'line 2', text: 'The base case check. When N reaches 0 there is no new call.' },
            { line: 'line 3', text: 'What to do in the base case: print “Done”.' },
            { line: 'line 5', text: 'Recursive case: do a little bit of work (print N)…' },
            {
              line: 'line 6',
              text: '…then call the same procedure with N - 1, a smaller problem that is one step closer to 0.',
            },
          ]}
        >
          <CodeBlock
            code={countdown.pseudocode}
            language="pseudocode"
            label="Countdown pseudocode"
          />
        </AnnotatedCode>
        <CheckYourself
          question="In COUNTDOWN, which part makes sure each call gets closer to the base case?"
          options={['output N', 'COUNTDOWN(N - 1)', 'output "Done"']}
          correct={1}
          explanation="Calling with N - 1 makes the input one smaller every time, so it must eventually reach 0."
        />
      </LessonSection>

      <LessonSection id="no-base-case" title="What if there is no base case?">
        <p>
          If a function keeps calling itself and nothing ever stops it, the calls pile up forever.
          This is called <strong>infinite recursion</strong>. Each waiting call takes up a little
          memory, so the computer eventually runs out of room and the program crashes with a{' '}
          <strong>stack overflow</strong>.
        </p>
        <Figure caption="Without a base case, countdown goes 3, 2, 1, 0, -1, -2… and never stops by itself.">
          <StackOverflowDemo />
        </Figure>
        <Callout kind="didyouknow">
          <p>
            Python stops a program after about 1,000 nested calls and shows{' '}
            <code>RecursionError: maximum recursion depth exceeded</code>. The website Stack
            Overflow, where programmers ask questions, is named after this error.
          </p>
        </Callout>
        <p>
          A base case can also be <em>wrong</em> instead of missing. If countdown started at 3 but
          stepped by 2 (3, 1, -1, …), it would jump right over 0 and never stop.
        </p>
      </LessonSection>

      <LessonSection id="countdown" title="Example 1: countdown">
        <p>
          Let’s trace <code>COUNTDOWN(3)</code>. Each call prints its number and then calls the next
          one. The highlighted frame is the call that is running right now.
        </p>
        <StepFrames
          frames={[
            {
              label: '1. Call countdown(3)',
              body: <MiniStack frames={['countdown(3)']} output="3" />,
              note: 'Not 0, so print 3 and call countdown(2).',
            },
            {
              label: '2. Call countdown(2)',
              body: <MiniStack frames={['countdown(3)', 'countdown(2)']} output="3 2" />,
              note: 'countdown(3) waits underneath.',
            },
            {
              label: '3. Call countdown(1)',
              body: (
                <MiniStack
                  frames={['countdown(3)', 'countdown(2)', 'countdown(1)']}
                  output="3 2 1"
                />
              ),
              note: 'The stack keeps growing.',
            },
            {
              label: '4. Call countdown(0)',
              body: (
                <MiniStack
                  frames={['countdown(3)', 'countdown(2)', 'countdown(1)', 'countdown(0)']}
                  baseTop
                  output="3 2 1 Done"
                />
              ),
              note: 'Base case! Print “Done”. No new call.',
            },
            {
              label: '5. Returning',
              body: <MiniStack frames={['countdown(3)', 'countdown(2)']} output="3 2 1 Done" />,
              note: 'countdown(0) and countdown(1) have finished and left the stack.',
            },
            {
              label: '6. All done',
              body: <MiniStack frames={[]} output="3 2 1 Done" />,
              note: 'The last call returns. The stack is empty.',
            },
          ]}
        />
        <p style={{ marginTop: 'var(--space-4)' }}>
          Notice the order: calls go <strong>down</strong> from 3 to 0, then the returns come back{' '}
          <strong>up</strong> from 0 to 3. The last call made is the first one to finish.
        </p>
      </LessonSection>

      <LessonSection id="factorial" title="Example 2: factorial">
        <p>
          The <strong>factorial</strong> of a whole number N, written N!, means multiplying all the
          whole numbers from N down to 1. For example, 4! = 4 × 3 × 2 × 1 = 24. By definition, 0! =
          1.
        </p>
        <p>
          The recursive idea: <strong>4! = 4 × 3!</strong>. To know 4!, you only need 3!, which is a
          smaller version of the same problem. And 3! = 3 × 2!, and so on, until 0! = 1, the base
          case.
        </p>
        <AnnotatedCode
          notes={[
            { line: 'line 2–3', text: 'Base case: 0! is 1, so return 1 without another call.' },
            {
              line: 'line 5',
              text: 'Recursive case: N! is N times (N - 1)!. The multiplication has to wait until FACTORIAL(N - 1) gives back its answer.',
            },
          ]}
        >
          <CodeBlock
            code={factorial.pseudocode}
            language="pseudocode"
            label="Factorial pseudocode"
          />
        </AnnotatedCode>
        <SubSection title="Tracing factorial(3)">
          <p>
            Unlike countdown, factorial has work left to do after each call: a multiplication. Each
            frame waits with a “?” until the call above it returns a value.
          </p>
          <StepFrames
            frames={[
              {
                label: 'Going down',
                body: <MiniStack frames={['3 × ?', '2 × ?', '1 × ?']} />,
                note: 'Each call waits for the next one.',
              },
              {
                label: 'Base case',
                body: (
                  <MiniStack frames={['3 × ?', '2 × ?', '1 × ?', 'factorial(0) = 1']} baseTop />
                ),
                note: 'factorial(0) returns 1 straight away.',
              },
              {
                label: 'Coming back up',
                body: <MiniStack frames={['3 × ?', '2 × ?', '1 × 1 = 1']} />,
                note: 'factorial(1) can now finish: 1 × 1 = 1.',
              },
              {
                label: 'Still coming up',
                body: <MiniStack frames={['3 × ?', '2 × 1 = 2']} />,
                note: 'factorial(2) gets 1 back: 2 × 1 = 2.',
              },
              {
                label: 'Answer',
                body: <MiniStack frames={['3 × 2 = 6']} />,
                note: 'factorial(3) gets 2 back: 3 × 2 = 6.',
              },
            ]}
          />
        </SubSection>
        <CheckYourself
          question="What does factorial(4) return?"
          options={['10', '16', '24', '4']}
          correct={2}
          explanation="4! = 4 × 3! = 4 × 6 = 24."
        />
      </LessonSection>

      <LessonSection id="call-stack" title="The call stack">
        <p>
          How does the computer remember all those waiting calls? It keeps them on the{' '}
          <strong>call stack</strong>. Think of a pile of plates:
        </p>
        <ul>
          <li>
            When a function is called, a new plate (a <em>frame</em>) goes on top.
          </li>
          <li>Only the plate on top is running. All the plates underneath are waiting.</li>
          <li>When a function returns, its plate is taken off the top.</li>
        </ul>
        <Figure caption="The newest call is on top, and the first one to finish. This rule is called last in, first out.">
          <PlatesArt />
        </Figure>
        <CheckYourself
          question="When factorial(3) runs, which call finishes first?"
          options={['factorial(3)', 'factorial(2)', 'factorial(0)']}
          correct={2}
          explanation="factorial(0) is the last call made, so it sits on top of the stack and is the first to return."
        />
        <Callout kind="tip" title="Next: explore it yourself">
          <p>
            In the Explore stage you can run countdown and factorial step by step and watch the call
            stack grow and shrink.
          </p>
        </Callout>
      </LessonSection>
    </LearnPage>
  )
}
