'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Props {
  username: string
  isAdmin: boolean
}

export default function WmSubNav({ username, isAdmin }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/wm/logout', { method: 'POST' })
    router.push('/wm/login')
    router.refresh()
  }

  const links = [
    { href: '/wm/dashboard', label: 'Dashboard' },
    { href: '/wm/matches', label: 'Spiele' },
    { href: '/wm/leaderboard', label: 'Tabelle' },
    { href: '/wm/history', label: 'Historie' },
  ]

  return (
    <div className="wm-subnav">
      <div className="wm-subnav-inner">
        <div className="wm-subnav-brand">
          <span className="wm-subnav-trophy">⚽</span>
          <span className="wm-subnav-title">WM 2026</span>
        </div>
        <nav className="wm-subnav-links">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`wm-subnav-link ${pathname.startsWith(l.href) ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <Link href="/wm/admin" className={`wm-subnav-link ${pathname.startsWith('/wm/admin') ? 'active' : ''}`}>
                Admin
              </Link>
              <a href="/api/wm/sync-matches" className="wm-subnav-link" target="_blank" rel="noopener noreferrer">
                Sync
              </a>
            </>
          )}
        </nav>
        <div className="wm-subnav-user">
          <span className="wm-subnav-username">@{username}</span>
          <button onClick={handleLogout} className="wm-subnav-logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
