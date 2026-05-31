'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faEnvelope, faBug } from '@fortawesome/free-solid-svg-icons'
import IconBurger from './IconBurger'
import IconBurgerFries from './IconBurgerFries'
import ThemeToggle from './ThemeToggle'
import MessagesBadge from './MessagesBadge'

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
              <li><Link id="tour-termine" href="/events"       className={pathname.startsWith('/events')    ? 'active' : ''}>Termine</Link></li>
              <li><Link id="tour-bikes"   href="/vehicles"     className={pathname.startsWith('/vehicles')  ? 'active' : ''}>Bikes</Link></li>
              <li><Link href="/profiles"                       className={pathname.startsWith('/profiles')  ? 'active' : ''}>Schrauber</Link></li>
              <li><Link id="tour-profil"  href={`/profile/${user.id}`} className={pathname.startsWith('/profile/') ? 'active' : ''}>Profil</Link></li>
              <li>
                <Link href="/messages" className={`msg-nav-text${pathname.startsWith('/messages') ? ' active' : ''}`} title="Nachrichten">
                  <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 16 }} />
                  <MessagesBadge />
                </Link>
              </li>
              {user?.email === 'martin@delavega.de' && (
                <li>
                  <Link href="/admin/feedback" className={`zh-nav-icon${pathname.startsWith('/admin') ? ' active' : ''}`} title="Admin: Feedback">
                    <FontAwesomeIcon icon={faBug} style={{ fontSize: 15 }} />
                  </Link>
                </li>
              )}
            </>
          ) : !loading ? (
            <>
              <li><Link href="/events"      className={pathname.startsWith('/events')   ? 'active' : ''}>Termine</Link></li>
              <li><Link href="/vehicles"    className={pathname.startsWith('/vehicles') ? 'active' : ''}>Bikes</Link></li>
              <li><Link href="/profiles"    className={pathname.startsWith('/profiles') ? 'active' : ''}>Schrauber</Link></li>
              <li><Link href="/auth/login"  className={pathname === '/auth/login'       ? 'active' : ''}>Anmelden</Link></li>
            </>
          ) : null}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <ThemeToggle />

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
              {!loading && user && <MessagesBadge />}
            </span>
            <span className="burger-label">{open ? 'schließen' : 'menu'}</span>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className={`zh-mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        {!loading && user ? (
          <>
            <Link href="/events"       onClick={close}>Termine</Link>
            <Link href="/vehicles"     onClick={close}>Bikes</Link>
            <Link href="/profiles"     onClick={close}>Schrauber</Link>
            <Link href={`/profile/${user.id}`} onClick={close}>Profil</Link>
            <Link href="/messages"     onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Nachrichten
                <MessagesBadge />
              </span>
            </Link>
            {user?.email === 'martin@delavega.de' && (
              <Link href="/admin/feedback" onClick={close}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FontAwesomeIcon icon={faBug} style={{ fontSize: 14 }} />
                  Feedback Admin
                </span>
              </Link>
            )}
            <button className="mm-cta" onClick={handleLogout} style={{ fontFamily: 'var(--display)', fontSize: '22px', textAlign: 'center', borderBottom: 0 }}>
              Abmelden <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '18px' }} />
            </button>
          </>
        ) : (
          <>
            <Link href="/events"        onClick={close}>Termine</Link>
            <Link href="/vehicles"      onClick={close}>Bikes</Link>
            <Link href="/profiles"      onClick={close}>Schrauber</Link>
            <Link href="/auth/login"    onClick={close}>Anmelden</Link>
            <Link href="/auth/register" onClick={close} className="mm-cta">Dabei sein <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '18px' }} /></Link>
          </>
        )}
      </div>
    </>
  )
}
