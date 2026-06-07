'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faEnvelope, faBug, faPalette, faCalendarDays, faMotorcycle, faUsers, faUser, faWrench, faListCheck, faComment, faPaperPlane, faChartBar } from '@fortawesome/free-solid-svg-icons'
import IconBurger from './IconBurger'
import IconBurgerFries from './IconBurgerFries'
import ThemeToggle from './ThemeToggle'
import MessagesBadge from './MessagesBadge'

export default function Nav() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)

  const handleLogout = async () => {
    setOpen(false)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const close = () => setOpen(false)

  return (
    <>
      <nav className="zh-nav">
        <div className="zh-nav-inner">
        <Link href="/" className="zh-nav-logo" onClick={close}>
          Zweitakt<span>hoden</span>
        </Link>

        <ul className="zh-nav-links">
          {!loading && user ? (
            <>
              <li><Link id="tour-termine" href="/events"       className={pathname.startsWith('/events')         ? 'active' : ''}>Termine</Link></li>
              <li><Link id="tour-bikes"   href="/vehicles"     className={pathname.startsWith('/vehicles')       ? 'active' : ''}>Bikes</Link></li>
              <li><Link href="/profiles"                       className={pathname.startsWith('/profiles')       ? 'active' : ''}>Schrauber</Link></li>
              <li><Link id="tour-halle" href="/schrauberhalle" className={pathname.startsWith('/schrauberhalle') ? 'active' : ''}>Schrauberhalle</Link></li>
              <li><Link id="tour-forum" href="/forum"          className={pathname.startsWith('/forum')          ? 'active' : ''}>Forum</Link></li>
              <li><Link id="tour-profil"  href={`/profile/${user.id}`} className={pathname.startsWith('/profile/') ? 'active' : ''}>Profil</Link></li>
              <li>
                <Link href="/messages" className={`msg-nav-text${pathname.startsWith('/messages') ? ' active' : ''}`} title="Nachrichten">
                  <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 16 }} />
                  <MessagesBadge />
                </Link>
              </li>
              {user?.email === 'martin@delavega.de' && (
                <li className="zh-nav-dropdown-wrap">
                  <button
                    className={`zh-nav-dropdown-trigger${adminOpen ? ' open' : ''}${pathname.startsWith('/admin') || pathname.startsWith('/styleguide') ? ' active' : ''}`}
                    onClick={() => setAdminOpen(v => !v)}
                    onBlur={e => { if (!e.currentTarget.closest('.zh-nav-dropdown-wrap').contains(e.relatedTarget)) setAdminOpen(false) }}
                  >
                    Admin
                    <span className="zh-nav-chevron">▾</span>
                  </button>
                  <div className={`zh-nav-dropdown${adminOpen ? ' open' : ''}`}>
                    <Link href="/admin/statistiken" onClick={() => setAdminOpen(false)}>
                      <FontAwesomeIcon icon={faChartBar} /> Statistiken
                    </Link>
                    <Link href="/admin/newsletter" onClick={() => setAdminOpen(false)}>
                      <FontAwesomeIcon icon={faPaperPlane} /> Newsletter
                    </Link>
                    <Link href="/admin/feedback" onClick={() => setAdminOpen(false)}>
                      <FontAwesomeIcon icon={faBug} /> Feedback
                    </Link>
                    <Link href="/admin/changelog" onClick={() => setAdminOpen(false)}>
                      <FontAwesomeIcon icon={faListCheck} /> Changelog
                    </Link>
                    <Link href="/styleguide" onClick={() => setAdminOpen(false)}>
                      <FontAwesomeIcon icon={faPalette} /> Style Guide
                    </Link>
                  </div>
                </li>
              )}
            </>
          ) : !loading ? (
            <>
              <li><Link href="/events"         className={pathname.startsWith('/events')         ? 'active' : ''}>Termine</Link></li>
              <li><Link href="/vehicles"       className={pathname.startsWith('/vehicles')       ? 'active' : ''}>Bikes</Link></li>
              <li><Link href="/profiles"       className={pathname.startsWith('/profiles')       ? 'active' : ''}>Schrauber</Link></li>
              <li><Link href="/schrauberhalle" className={pathname.startsWith('/schrauberhalle') ? 'active' : ''}>Schrauberhalle</Link></li>
              <li><Link href="/forum"          className={pathname.startsWith('/forum')          ? 'active' : ''}>Forum</Link></li>
              <li><Link href="/auth/login"     className={pathname === '/auth/login'             ? 'active' : ''}>Anmelden</Link></li>
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
            <span className="burger-label" aria-hidden="true">{open ? 'schließen' : 'menu'}</span>
          </button>
        </div>
        </div>
      </nav>

      <div id="mobile-menu" className={`zh-mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        {!loading && user ? (
          <>
            <Link href="/events" onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 14, width: 16 }} />
                Termine
              </span>
            </Link>
            <Link href="/vehicles" onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FontAwesomeIcon icon={faMotorcycle} style={{ fontSize: 14, width: 16 }} />
                Bikes
              </span>
            </Link>
            <Link href="/profiles" onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FontAwesomeIcon icon={faUsers} style={{ fontSize: 14, width: 16 }} />
                Schrauber
              </span>
            </Link>
            <Link href="/schrauberhalle" onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FontAwesomeIcon icon={faWrench} style={{ fontSize: 14, width: 16 }} />
                Schrauberhalle
              </span>
            </Link>
            <Link href="/forum" onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FontAwesomeIcon icon={faComment} style={{ fontSize: 14, width: 16 }} />
                Forum
              </span>
            </Link>
            <Link href={`/profile/${user.id}`} onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FontAwesomeIcon icon={faUser} style={{ fontSize: 14, width: 16 }} />
                Profil
              </span>
            </Link>
            <Link href="/messages" onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 14, width: 16 }} />
                Nachrichten
                <MessagesBadge />
              </span>
            </Link>
            {user?.email === 'martin@delavega.de' && (
              <>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', padding: '16px 0 4px', borderTop: '1px solid var(--hairline)', marginTop: 4 }}>
                  Admin
                </div>
                <Link href="/admin/statistiken" onClick={close}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FontAwesomeIcon icon={faChartBar} style={{ fontSize: 14, width: 16 }} />
                    Statistiken
                  </span>
                </Link>
                <Link href="/admin/newsletter" onClick={close}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 14, width: 16 }} />
                    Newsletter
                  </span>
                </Link>
                <Link href="/admin/feedback" onClick={close}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FontAwesomeIcon icon={faBug} style={{ fontSize: 14, width: 16 }} />
                    Feedback
                  </span>
                </Link>
                <Link href="/admin/changelog" onClick={close}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FontAwesomeIcon icon={faListCheck} style={{ fontSize: 14, width: 16 }} />
                    Changelog
                  </span>
                </Link>
                <Link href="/styleguide" onClick={close}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FontAwesomeIcon icon={faPalette} style={{ fontSize: 14, width: 16 }} />
                    Style Guide
                  </span>
                </Link>
              </>
            )}
            <button className="mm-cta" onClick={handleLogout} style={{ fontFamily: 'var(--display)', fontSize: '22px', textAlign: 'center', borderBottom: 0 }}>
              Abmelden <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '18px' }} />
            </button>
          </>
        ) : (
          <>
            <Link href="/events"         onClick={close}>Termine</Link>
            <Link href="/vehicles"       onClick={close}>Bikes</Link>
            <Link href="/profiles"       onClick={close}>Schrauber</Link>
            <Link href="/schrauberhalle" onClick={close}>Schrauberhalle</Link>
            <Link href="/forum"          onClick={close}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FontAwesomeIcon icon={faComment} style={{ fontSize: 14, width: 16 }} />
                Forum
              </span>
            </Link>
            <Link href="/auth/login"     onClick={close}>Anmelden</Link>
            <Link href="/auth/register" onClick={close} className="mm-cta">Dabei sein <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '18px' }} /></Link>
          </>
        )}
      </div>
    </>
  )
}
