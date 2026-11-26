import { Callout } from '../components/ui'

export function About() {
  return (
    <section className="container reading" style={{ paddingTop: 'var(--space-7)' }}>
      <h1>About this demo</h1>
      <Callout kind="info" title="Under construction">
        <p>This page is being built right now and will appear here soon.</p>
      </Callout>
    </section>
  )
}
