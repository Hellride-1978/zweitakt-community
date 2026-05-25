'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

function NavIcon({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

function getActive(pathname) {
  if (pathname.startsWith('/events')) return 'rides'
  if (pathname.startsWith('/profiles')) return 'schrauber'
  if (pathname.startsWith('/profile')) return 'schrauber'
  if (pathname.startsWith('/vehicles')) return 'schrauber'
  return ''
}

export default function DesktopSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const active = getActive(pathname)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [user?.id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const displayName = profile?.name || user?.email?.split('@')[0] || '—'
  const initials = displayName.substring(0, 2).toUpperCase()
  return (
    <aside className="zd-side">
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="brand">
          <div className="wordmark">zweitakt<em>hoden</em></div>
          <div className="tag">Club &amp; Cruise</div>
        </div>
      </Link>

      <nav className="zd-nav" aria-label="Hauptnavigation">
        <Link href="/events" className={active === 'rides' ? 'on' : ''} aria-current={active === 'rides' ? 'page' : undefined}>
          <NavIcon>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
          </NavIcon>
          <span>Ausfahrten</span>
        </Link>
        <Link href="/profiles" className={active === 'schrauber' ? 'on' : ''} aria-current={active === 'schrauber' ? 'page' : undefined}>
          <NavIcon>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </NavIcon>
          <span>Schrauber</span>
        </Link>

        <div className="grp">Konto</div>
        <Link href="/profile/edit" className={pathname === '/profile/edit' ? 'on' : ''} aria-current={pathname === '/profile/edit' ? 'page' : undefined}>
          <NavIcon>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </NavIcon>
          <span>Einstellungen</span>
        </Link>
      </nav>

      <Link href="/events/new" className="cta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }} aria-hidden="true">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Ausfahrt erstellen
      </Link>

      {!loading && user && (
        <div className="meprofile">
          <div className="zh-avatar offline" style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          <div className="who">
            <div className="nm">{displayName}</div>
            <div className="hn">{user.email?.split('@')[0]}</div>
          </div>
          <button className="ck" onClick={handleLogout} aria-label="Abmelden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      )}
    </aside>
  )
}
