import { useEffect } from 'react'
import { Link } from 'react-router'
import { IB_ALIGNMENT, IB_NOTE } from '../content/ib-alignment'
import { MODULE_IDS, MODULES } from '../content/modules'
import { TEACHER_NOTES } from '../content/teachers'
import s from './teachers.module.css'

/** Learn and Explore map onto PRIMM stages; Practice is students applying the algorithm. */
const APPROACH: { stage: string; primm: string | null; text: string }[] = [
  {
    stage: 'Learn',
    primm: 'Predict',
    text: 'Short explanations with examples. Students make a prediction before each walkthrough shows the answer.',
  },
  {
    stage: 'Explore',
    primm: 'Run, Investigate',
    text: 'Students run the algorithm step by step, change the input and watch the code and counters change.',
  },
  {
    stage: 'Practice',
    primm: null,
    text: 'Students carry out the algorithm themselves, find mistakes and choose between algorithms, with feedback on every answer.',
  },
]

export function Teachers() {
  useEffect(() => {
    document.title = 'For teachers · CS Playground'
  }, [])

  return (
    <div className={`container ${s.page}`}>
      <h1 className={s.title}>For teachers</h1>
      <p className={s.lead}>
        CS Playground works best in a normal 60-minute lesson: a short hook, students working in
        pairs on Learn and Explore, individual Practice, and a class discussion at the end. It runs
        in any browser, needs no accounts, and saves each student&rsquo;s progress on their own
        device.
      </p>

      <section className={s.section} aria-labelledby="approach">
        <h2 id="approach" className={s.h2}>
          Teaching approach
        </h2>
        <p className={s.text}>
          Every lesson follows the same three stages, inspired by PRIMM (Predict, Run, Investigate,
          Modify, Make), a well-known approach to teaching programming. Learn asks for predictions,
          Explore is for running and investigating, and in Practice students carry out and check the
          algorithm themselves.
        </p>
        <ul className={s.approach}>
          {APPROACH.map((a) => (
            <li key={a.stage}>
              <p className={s.approachStage}>
                {a.stage} {a.primm && <span className={s.primm}>PRIMM: {a.primm}</span>}
              </p>
              <p className={s.approachText}>{a.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="notes">
        <h2 id="notes" className={s.h2}>
          Lesson notes
        </h2>
        <p className={s.text}>
          Each set of notes has objectives, common misconceptions, a timed lesson plan, discussion
          questions and ideas for support and stretch. They print cleanly on paper.
        </p>
        <ul className={s.lessonLinks}>
          {MODULE_IDS.map((id, n) => (
            <li key={id} style={{ '--module-color': MODULES[id].colorVar } as React.CSSProperties}>
              <Link to={`/teachers/${id}`} className={s.lessonLink}>
                <span className={s.lessonNumber}>Lesson {n + 1}</span>
                <span className={s.lessonTitle}>{MODULES[id].title}</span>
                <span className={s.lessonSummary}>{TEACHER_NOTES[id].summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="ib">
        <h2 id="ib" className={s.h2}>
          Alignment with IB DP Computer Science
        </h2>
        <div className={s.tableWrap} tabIndex={0} role="region" aria-label="IB alignment table">
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">Lesson</th>
                <th scope="col">Topic</th>
                <th scope="col">Level</th>
                <th scope="col">Students practise</th>
              </tr>
            </thead>
            <tbody>
              {IB_ALIGNMENT.map((row) => (
                <tr key={row.module}>
                  <th scope="row">
                    <Link to={`/teachers/${row.module}`}>{MODULES[row.module].title}</Link>
                  </th>
                  <td>
                    {row.topic}
                    <span className={s.theme}>{row.theme}</span>
                  </td>
                  <td>{row.level}</td>
                  <td>{row.skills}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.note}>{IB_NOTE}</p>
      </section>
    </div>
  )
}
