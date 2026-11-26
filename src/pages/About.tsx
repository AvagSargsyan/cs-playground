import { useEffect } from 'react'
import { Link } from 'react-router'
import { SITE } from '../content/site'
import { AuthorAvatar } from '../illustrations/BrandMark'
import s from './about.module.css'

export function About() {
  useEffect(() => {
    document.title = 'About · CS Playground'
  }, [])

  return (
    <article className={`container ${s.page}`}>
      <p className={s.byline}>
        <AuthorAvatar size={40} />
        <span>
          <strong>{SITE.author}</strong>
          <span className={s.bylineNote}>Built for demo purposes for {SITE.school}</span>
        </span>
      </p>
      <h1 className={s.title}>About this demo</h1>

      <p className={s.lead}>
        CS Playground is a small set of interactive lessons on three basic computer science ideas:
        sorting, binary search and recursion. I built it for demo purposes for {SITE.school}, to
        show how I like to teach computer science.
      </p>

      <section className={s.section} aria-labelledby="why">
        <h2 id="why">Why I built it</h2>
        <p>
          Algorithms are easy to memorise and hard to understand. Students can repeat that binary
          search is &ldquo;O(log n)&rdquo; without ever feeling why it is so fast. I wanted lessons
          where students see each step, change the input and try it themselves, so the idea makes
          sense before the notation arrives.
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
          There are also <Link to="/teachers">notes for teachers</Link> with lesson plans,
          misconceptions and discussion questions.
        </p>
      </section>

      <section className={s.section} aria-labelledby="world">
        <h2 id="world">For an international classroom</h2>
        <p>
          The examples come from many languages and cultures: names from around the world, countries
          by population, dictionaries in different alphabets. In &ldquo;Sorting around the
          world&rdquo; students sort the same list of words with different language rules and find
          that even &ldquo;alphabetical order&rdquo; depends on where you are from. It is a good
          starting point for a class discussion.
        </p>
      </section>

      <section className={s.section} aria-labelledby="built">
        <h2 id="built">How it&rsquo;s built</h2>
        <ul>
          <li>React and TypeScript, built with Vite and hosted as a static site.</li>
          <li>
            Redux Toolkit keeps each student&rsquo;s progress and settings in their own browser.
            There are no accounts and no server.
          </li>
          <li>
            Every algorithm records a full list of its steps. The visualisations and exercises
            replay that list, so stepping backwards and &ldquo;predict the next step&rdquo;
            questions always match the real algorithm.
          </li>
          <li>
            Unit tests check every algorithm; browser tests check every page on desktop and mobile.
          </li>
        </ul>
        <p>
          The source code is on{' '}
          <a href={SITE.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </section>

      <section className={s.section} aria-labelledby="next">
        <h2 id="next">Future ideas</h2>
        <p>
          An Armenian and English version, more lessons (for example graphs and hashing), and a
          simple way for teachers to share a set of exercises with a class.
        </p>
      </section>

      <section className={s.section} aria-labelledby="contact">
        <h2 id="contact">Contact</h2>
        <p>
          You can find me on{' '}
          <a href={SITE.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          .
        </p>
      </section>
    </article>
  )
}
