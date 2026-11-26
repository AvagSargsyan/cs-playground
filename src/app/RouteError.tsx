import { useEffect } from 'react'
import { useRouteError } from 'react-router'
import { Button } from '../components/ui'

const RELOAD_FLAG = 'cs-playground:reloaded-after-error'

/** A lazy-loaded file is missing, usually because a new version was deployed while the tab was open. */
function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    message,
  )
}

function readFlag() {
  try {
    return sessionStorage.getItem(RELOAD_FLAG) === '1'
  } catch {
    return true // storage blocked: don't risk a reload loop
  }
}

/** Friendly error screen for the whole app instead of React Router's default one. */
export function RouteError() {
  const error = useRouteError()
  const autoReload = isChunkLoadError(error) && !readFlag()

  useEffect(() => {
    if (!autoReload) return
    try {
      sessionStorage.setItem(RELOAD_FLAG, '1')
    } catch {
      return
    }
    window.location.reload()
  }, [autoReload])

  if (autoReload) return null

  return (
    <section className="container" style={{ padding: 'var(--space-8) var(--gutter)' }}>
      <h1>Something went wrong</h1>
      <p className="lead reading">
        This page could not be loaded. A new version of the site may have just been published.
        Reloading the page usually fixes it.
      </p>
      <Button
        onClick={() => {
          try {
            sessionStorage.removeItem(RELOAD_FLAG)
          } catch {
            // ignore
          }
          window.location.reload()
        }}
      >
        Reload the page
      </Button>
    </section>
  )
}
