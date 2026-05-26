'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { useRouter } from 'next/navigation'

export default function EventsCreateCard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) return null

  if (!user) {
    return (
      <div className="zd-card dark">
        <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Mitmachen</div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.0, letterSpacing: 0.3 }}>
          termin erstellen?
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'color-mix(in oklab, var(--cream) 80%, transparent)' }}>
          Meld dich an, um eigene Ausfahrten zu erstellen.
        </div>
        <Link href="/auth/register" className="zd-btn accent" style={{ marginTop: 12, padding: '8px 14px', fontSize: 15, display: 'inline-flex' }}>
          Jetzt dabei sein →
        </Link>
      </div>
    )
  }

  return (
    <div className="zd-card dark">
      <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Neu dabei?</div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.0, letterSpacing: 0.3 }}>
        erstell deinen<br/>eigenen termin.
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: 'color-mix(in oklab, var(--cream) 80%, transparent)' }}>
        Ausfahrt, Stammtisch, Schraubertreffen — alles geht.
      </div>
      <Link href="/events/new" className="zd-btn accent" style={{ marginTop: 12, padding: '8px 14px', fontSize: 15, display: 'inline-flex' }}>
        Termin erstellen →
      </Link>
    </div>
  )
}
