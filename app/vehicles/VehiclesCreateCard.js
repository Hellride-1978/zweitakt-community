'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

export default function VehiclesCreateCard() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <div className="zd-card dark">
        <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Mitmachen</div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.0, letterSpacing: 0.3 }}>
          bike eintragen?
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'color-mix(in oklab, var(--cream) 80%, transparent)' }}>
          Meld dich an, um deine Kisten einzutragen.
        </div>
        <Link href="/auth/register" className="zd-btn accent" style={{ marginTop: 12, padding: '8px 14px', fontSize: 15, display: 'inline-flex' }}>
          Jetzt dabei sein →
        </Link>
      </div>
    )
  }

  return (
    <div className="zd-card dark">
      <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Deine Garage</div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.0, letterSpacing: 0.3 }}>
        trag deine<br/>kiste ein.
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: 'color-mix(in oklab, var(--cream) 80%, transparent)' }}>
        Damit andere sehen, was du fährst.
      </div>
      <Link href="/vehicles/new" className="zd-btn accent" style={{ marginTop: 12, padding: '8px 14px', fontSize: 15, display: 'inline-flex' }}>
        Bike anlegen →
      </Link>
    </div>
  )
}
