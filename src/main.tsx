import '@fontsource/lexend/500.css'
import '@fontsource/lexend/600.css'
import '@fontsource/noto-sans/400.css'
import '@fontsource/noto-sans/500.css'
import '@fontsource/noto-sans/600.css'
import '@fontsource/noto-sans/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './theme/globals.css'

import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router/dom'
import { router } from './app/router'
import { store } from './store'

// The app loaded, so a later missing-file error may auto-reload once again (see RouteError).
try {
  sessionStorage.removeItem('cs-playground:reloaded-after-error')
} catch {
  // storage blocked
}

// Vercel Web Analytics only exists on the deployed site; skip it locally and in tests.
const onVercel = window.location.hostname.endsWith('.vercel.app')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    {/* Anonymous, cookie-free page view counts (Vercel Web Analytics). */}
    {onVercel && <Analytics />}
  </StrictMode>,
)
