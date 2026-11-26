import { ButtonLink } from '../components/ui'

export function NotFound() {
  return (
    <section className="container" style={{ padding: 'var(--space-8) var(--gutter)' }}>
      <p className="eyebrow">Error 404</p>
      <h1>This page went missing</h1>
      <p className="lead reading">
        A binary search would have found it by now… but this page doesn&rsquo;t exist. Let&rsquo;s
        get you back to the lessons.
      </p>
      <ButtonLink to="/">Go to the homepage</ButtonLink>
    </section>
  )
}
