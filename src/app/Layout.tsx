import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { DEMO_NOTICE, SITE } from '../content/site'
import { AuthorAvatar, BrandMark } from '../illustrations/BrandMark'
import { bannerDismissed } from '../store/preferencesSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import s from './layout.module.css'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/sorting', label: 'Sorting' },
  { to: '/binary-search', label: 'Binary Search' },
  { to: '/recursion', label: 'Recursion' },
  { to: '/teachers', label: 'For Teachers' },
  { to: '/about', label: 'About' },
]

/** A personal note from the author, shown on every page so the site is never taken for a UWC page. */
function DemoNote() {
  const dismissed = useAppSelector((st) => st.preferences.bannerDismissed)
  const dispatch = useAppDispatch()
  if (dismissed) return null
  return (
    <div className={`${s.note} no-print`} role="region" aria-label="Demo notice">
      <div className={`container ${s.noteInner}`}>
        <AuthorAvatar size={28} />
        <p className={s.noteText}>
          <strong>Hi, I&rsquo;m {SITE.author}.</strong> This is my personal teaching demo for the{' '}
          {SITE.school} {SITE.role} application. It is not an official {SITE.school} website.{' '}
          <Link to="/about">Why I built it →</Link>
        </p>
        <button
          type="button"
          className={s.noteClose}
          aria-label="Hide this note for this visit"
          onClick={() => dispatch(bannerDismissed())}
        >
          ×
        </button>
      </div>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return NAV.map((n) => (
    <li key={n.to}>
      <NavLink
        to={n.to}
        end={n.end}
        onClick={onNavigate}
        className={({ isActive }) => `${s.navLink} ${isActive ? s.navLinkActive : ''}`}
      >
        {n.label}
      </NavLink>
    </li>
  ))
}

function Header() {
  // The menu remembers which page it was opened on, so it closes by itself after navigation.
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname

  return (
    <header className={`${s.header} no-print`}>
      <nav aria-label="Main" className={`container ${s.navInner}`}>
        <Link to="/" className={s.brand}>
          <BrandMark className={s.brandMark} />
          <span className={s.brandName}>
            {SITE.name}
            <small>by {SITE.author}</small>
          </span>
        </Link>
        <ul className={s.navList}>
          <NavLinks />
        </ul>
        <button
          type="button"
          className={s.menuButton}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" />
            )}
          </svg>
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className={s.mobileMenu}>
          <ul className="container">
            <NavLinks onNavigate={() => setOpenOn(null)} />
          </ul>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`container ${s.footerGrid}`}>
        <div className={s.author}>
          <AuthorAvatar size={56} />
          <div>
            <p className={s.authorName}>Made by {SITE.author}</p>
            <p className={s.authorText}>
              I designed and built CS Playground to show how I would teach computer science:
              students predict, experiment and run the algorithms themselves.
            </p>
            <p className={s.authorLinks}>
              <a href={SITE.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={SITE.github} target="_blank" rel="noreferrer">
                Source code
              </a>
              <Link to="/about">About this demo</Link>
            </p>
          </div>
        </div>
        <div>
          <p className={s.footerHeading}>Lessons</p>
          <ul className={s.footerList}>
            <li>
              <Link to="/sorting">Sorting Algorithms</Link>
            </li>
            <li>
              <Link to="/binary-search">Binary Search</Link>
            </li>
            <li>
              <Link to="/recursion">Recursion</Link>
            </li>
            <li>
              <Link to="/teachers">For Teachers</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={`container ${s.footerNotice}`}>
        <p>
          {DEMO_NOTICE} © {SITE.year} {SITE.author}.
        </p>
      </div>
    </footer>
  )
}

export function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <DemoNote />
      <Header />
      <main id="main" className={s.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}
