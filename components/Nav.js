'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import IconBurger from './IconBurger'
import IconBurgerFries from './IconBurgerFries'

export default function Nav() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    setOpen(false)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const close = () => setOpen(false)

  return (
    <>
      <nav className="zh-nav">
        <Link href="/" className="zh-nav-logo" onClick={close}>
          Zweitakt<span>hoden</span>
        </Link>

        <ul className="zh-nav-links">
          {!loading && user ? (
            <>
              <li><Link href="/events"       className={pathname.startsWith('/events')   ? 'active' : ''}>Termine</Link></li>
              <li><Link href="/profiles"     className={pathname.startsWith('/profiles') || pathname.startsWith('/profile') ? 'active' : ''}>Schrauber</Link></li>
              <li><Link href="/profile/edit" className={pathname === '/profile/edit'     ? 'active' : ''}>Profil</Link></li>
            </>
          ) : !loading ? (
            <>
              <li><Link href="/events"      className={pathname.startsWith('/events')   ? 'active' : ''}>Termine</Link></li>
              <li><Link href="/profiles"    className={pathname.startsWith('/profiles') ? 'active' : ''}>Schrauber</Link></li>
              <li><Link href="/auth/login"  className={pathname === '/auth/login'       ? 'active' : ''}>Anmelden</Link></li>
            </>
          ) : null}
        </ul>

        {!loading && (
          user ? (
            <button className="zh-nav-cta" onClick={handleLogout}>
              Abmelden <span className="zh-nav-cta-dot" />
            </button>
          ) : (
            <Link href="/auth/register" className="zh-nav-cta">
              Dabei sein <span className="zh-nav-cta-dot" />
            </Link>
          )
        )}

        <button
          className={`zh-burger${open ? ' open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className="burger-icon-wrap">
            <IconBurger className="i-burger" />
            <IconBurgerFries className="i-close" />
          </span>
          <span className="burger-label">{open ? 'schließen' : 'menu'}</span>
        </button>
      </nav>

      <div id="mobile-menu" className={`zh-mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        {!loading && user ? (
          <>
            <Link href="/events"       onClick={close}>Termine</Link>
            <Link href="/profiles"     onClick={close}>Schrauber</Link>
            <Link href="/vehicles"     onClick={close}>Garage</Link>
            <Link href="/profile/edit" onClick={close}>Profil bearbeiten</Link>
            <button className="mm-cta" onClick={handleLogout} style={{ fontFamily: 'var(--display)', fontSize: '22px', textAlign: 'center', borderBottom: 0 }}>
              Abmelden <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '18px' }} />
            </button>
          </>
        ) : (
          <>
            <Link href="/events"        onClick={close}>Termine</Link>
            <Link href="/profiles"      onClick={close}>Schrauber</Link>
            <Link href="/auth/login"    onClick={close}>Anmelden</Link>
            <Link href="/auth/register" onClick={close} className="mm-cta">Dabei sein <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '18px' }} /></Link>
          </>
        )}
      </div>
    </>
  )
}
