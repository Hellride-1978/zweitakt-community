'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
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
              <li><Link href="/dashboard"   className={pathname === '/dashboard'    ? 'active' : ''}>Dashboard</Link></li>
              <li><Link href="/events"      className={pathname.startsWith('/events') ? 'active' : ''}>Events</Link></li>
              <li><Link href="/clubs"       className={pathname.startsWith('/clubs')  ? 'active' : ''}>Clubs</Link></li>
              <li><Link href="/feed"        className={pathname === '/feed'           ? 'active' : ''}>Feed</Link></li>
              <li><Link href="/profiles"    className={pathname === '/profiles'       ? 'active' : ''}>Community</Link></li>
            </>
          ) : !loading ? (
            <>
              <li><Link href="/events"   className={pathname.startsWith('/events') ? 'active' : ''}>Events</Link></li>
              <li><Link href="/clubs"    className={pathname.startsWith('/clubs')  ? 'active' : ''}>Clubs</Link></li>
              <li><Link href="/profiles" className={pathname === '/profiles'       ? 'active' : ''}>Community</Link></li>
              <li><Link href="/auth/login" className={pathname === '/auth/login'   ? 'active' : ''}>Anmelden</Link></li>
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
        </button>
      </nav>

      <div id="mobile-menu" className={`zh-mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        {!loading && user ? (
          <>
            <Link href="/dashboard"    onClick={close}>Dashboard</Link>
            <Link href="/events"       onClick={close}>Events</Link>
            <Link href="/clubs"        onClick={close}>Clubs</Link>
            <Link href="/feed"         onClick={close}>Feed</Link>
            <Link href="/profiles"     onClick={close}>Community</Link>
            <Link href="/profile/edit" onClick={close}>Profil</Link>
            <button className="mm-cta" onClick={handleLogout} style={{fontFamily:'var(--display)',fontSize:'22px',textAlign:'center',borderBottom:0}}>
              Abmelden →
            </button>
          </>
        ) : (
          <>
            <Link href="/events"         onClick={close}>Events</Link>
            <Link href="/clubs"          onClick={close}>Clubs</Link>
            <Link href="/profiles"       onClick={close}>Community</Link>
            <Link href="/auth/login"     onClick={close}>Anmelden</Link>
            <Link href="/auth/register"  onClick={close} className="mm-cta">Dabei sein →</Link>
          </>
        )}
      </div>
    </>
  )
}
