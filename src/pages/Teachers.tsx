import { useEffect } from 'react'
import { Link } from 'react-router'
import { IB_ALIGNMENT, IB_NOTE } from '../content/ib-alignment'
import { MODULE_IDS, MODULES } from '../content/modules'
import { LESSON_MINUTES, TEACHER_NOTES } from '../content/teachers'
import s from './teachers.module.css'

export function Teachers() {
  useEffect(() => {
    document.title = 'For teachers · CS Playground'
  }, [])

  return (
    <div className={`container ${s.page}`}>
      <h1 className={s.title}>For teachers</h1>
      <p className={s.lead}>
        Each lesson fits a {LESSON_MINUTES}-minute class: a short hook, Learn and Explore in pairs,
        individual Practice, and a wrap-up. It runs in any browser, needs no accounts, and saves
        each student&rsquo;s progress on their own device.
      </p>

      <section className={s.section} aria-labelledby="notes">
        <h2 id="notes" className={s.h2}>
          Lesson notes
        </h2>
        <p className={s.text}>
          One printable page per lesson: objectives, a timed plan, misconceptions to watch for,
          questions to ask, and ideas for support and stretch.
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
          IB DP Computer Science topics
        </h2>
        <div className={s.tableWrap} tabIndex={0} role="region" aria-label="IB topics table">
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">Lesson</th>
                <th scope="col">Topic</th>
                <th scope="col">Level</th>
              </tr>
            </thead>
            <tbody>
              {IB_ALIGNMENT.map((row) => (
                <tr key={row.module}>
                  <th scope="row">
                    <Link to={`/teachers/${row.module}`}>{MODULES[row.module].title}</Link>
                  </th>
                  <td>{row.topic}</td>
                  <td>{row.level}</td>
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
