import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { DEMO_NOTICE, SITE } from '../content/site'
import { BrandMark } from '../illustrations/BrandMark'
import s from './layout.module.css'

const NAV = [
  { to: '/sorting', label: 'Sorting' },
  { to: '/binary-search', label: 'Binary Search' },
  { to: '/recursion', label: 'Recursion' },
  { to: '/teachers', label: 'For Teachers' },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return NAV.map((n) => (
    <li key={n.to}>
      <NavLink
        to={n.to}
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
        {/* The brand states on every page that this is a personal demo. */}
        <Link to="/" className={s.brand}>
          <BrandMark className={s.brandMark} size={32} />
          <span className={s.brandName}>
            {SITE.name}
            <small>Demo by {SITE.author}</small>
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
      <div className={`container ${s.footerInner}`}>
        <p className={s.footerNotice}>{DEMO_NOTICE}</p>
        <p className={s.footerLinks}>
          <Link to="/about">About this demo</Link>
          <a href={SITE.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={SITE.github} target="_blank" rel="noreferrer">
            Source code
          </a>
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
      <Header />
      <main id="main" className={s.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}
