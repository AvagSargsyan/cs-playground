import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { DEMO_NOTICE, SITE } from '../content/site'
import { BrandMark } from '../illustrations/BrandMark'
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

function DemoBanner() {
  const dismissed = useAppSelector((st) => st.preferences.bannerDismissed)
  const dispatch = useAppDispatch()
  if (dismissed) return null
  return (
    <div className={`${s.banner} no-print`} role="region" aria-label="Demo notice">
      <div className={`container ${s.bannerInner}`}>
        <p className={s.bannerText}>
          {DEMO_NOTICE} <Link to="/about">About this demo →</Link>
        </p>
        <button
          type="button"
          className={s.bannerClose}
          aria-label="Hide demo notice for this visit"
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
  const setOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((typeof v === 'function' ? v(open) : v) ? pathname : null)

  return (
    <header className={`${s.header} no-print`}>
      <nav aria-label="Main" className={`container ${s.navInner}`}>
        <Link to="/" className={s.brand}>
          <BrandMark className={s.brandMark} />
          <span className={s.brandName}>
            {SITE.name}
            <small>Demo · for {SITE.school}</small>
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
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.2" />
            )}
          </svg>
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className={s.mobileMenu}>
          <ul className="container">
            <NavLinks onNavigate={() => setOpen(false)} />
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
        <div>
          <p className={s.footerTitle}>{SITE.name}</p>
          <p>
            {SITE.tagline}. Learn, explore and practise sorting, binary search and recursion through
            interactive visualizations.
          </p>
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
        <div>
          <p className={s.footerHeading}>Made by {SITE.author}</p>
          <ul className={s.footerList}>
            <li>
              <Link to="/about">About this demo</Link>
            </li>
            <li>
              <a href={SITE.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={SITE.github} target="_blank" rel="noreferrer">
                Source code on GitHub
              </a>
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
      <DemoBanner />
      <Header />
      <main id="main" className={s.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}
