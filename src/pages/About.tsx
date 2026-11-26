import { useEffect } from 'react'
import { Link } from 'react-router'
import { SITE } from '../content/site'
import s from './about.module.css'

const FUTURE_IDEAS: { heading: string; items: string[] }[] = [
  {
    heading: 'For students',
    items: [
      'More IB topics: stacks and queues, linked lists, graphs and hashing.',
      'A “write it yourself” stage: run your own Python in the browser and compare it with the visualisation.',
      'Armenian and Russian versions alongside English.',
    ],
  },
  {
    heading: 'For teachers',
    items: [
      'Share a set of exercises with a class through a short code, and see which questions the class found hardest.',
      'Printable worksheets and exam-style questions generated from the same exercises.',
    ],
  },
  {
    heading: 'For everyone',
    items: [
      'Spoken step-by-step descriptions for screen reader users.',
      'Offline mode for classrooms with unreliable internet.',
    ],
  },
]

export function About() {
  useEffect(() => {
    document.title = 'About · CS Playground'
  }, [])

  return (
    <article className={`container ${s.page}`}>
      <h1 className={s.title}>About this demo</h1>

      <section className={s.contactCard} aria-labelledby="author">
        <h2 id="author" className={s.contactName}>
          {SITE.author}
        </h2>
        <p className={s.bylineNote}>Built for demo purposes for {SITE.school}</p>
        <dl className={s.contactList}>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>
            </dd>
          </div>
          <div>
            <dt>LinkedIn</dt>
            <dd>
              <a href={SITE.linkedin} target="_blank" rel="noreferrer">
                linkedin.com/in/avag-sargsyan
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <p className={s.lead}>
        CS Playground is a small set of interactive lessons on three basic computer science ideas:
        sorting, binary search and recursion.
      </p>

      <section className={s.section} aria-labelledby="why">
        <h2 id="why">Why I built it</h2>
        <p>
          I believe students understand algorithms best when they can see every step, change the
          input and try it themselves.
        </p>
        <p>
          Algorithms are easy to memorise and hard to understand. Students can repeat that binary
          search is &ldquo;O(log n)&rdquo; without ever feeling why it is so fast. In these lessons
          the idea makes sense first, and the notation comes after.
        </p>
      </section>

      <section className={s.section} aria-labelledby="approach">
        <h2 id="approach">How the lessons teach</h2>
        <p>
          Every lesson has the same three stages, inspired by PRIMM (Predict, Run, Investigate,
          Modify, Make), a well-known approach to teaching programming:
        </p>
        <ul>
          <li>
            <strong>Learn:</strong> short explanations and examples. Students predict what will
            happen before a walkthrough shows them.
          </li>
          <li>
            <strong>Explore:</strong> students run the algorithm step by step, go back, change the
            data and watch the code and counters.
          </li>
          <li>
            <strong>Practice:</strong> students carry out the algorithm themselves, spot mistakes
            and get an explanation for every answer.
          </li>
        </ul>
        <p>
          There are also short <Link to="/teachers">notes for teachers</Link> with a lesson plan for
          each topic.
        </p>
      </section>

      <section className={s.section} aria-labelledby="built">
        <h2 id="built">How it&rsquo;s built</h2>
        <p>
          I designed and built CS Playground myself, using my experience as a software engineer. It
          runs in any browser, works on phones, needs no accounts or installation, and is tested for
          accessibility. The{' '}
          <a href={SITE.github} target="_blank" rel="noreferrer">
            source code is on GitHub
          </a>
          .
        </p>
      </section>

      <section className={s.section} aria-labelledby="next">
        <h2 id="next">Future ideas</h2>
        <div className={s.ideas}>
          {FUTURE_IDEAS.map((g) => (
            <div key={g.heading} className={s.ideaGroup}>
              <h3 className={s.ideaHeading}>{g.heading}</h3>
              <ul>
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
