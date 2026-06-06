'use client'

import { Suspense } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useRouter } from 'next/navigation'
import DesktopLayout from '@/components/DesktopLayout'
import GarageEdit from '@/components/GarageEdit'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

function SchrauberhalleNewInner() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) return <div style={{ padding: 40 }}>Lädt…</div>

  if (!user) return (
    <div className="zh-page"><div className="zh-page-inner">
      <p style={{ marginTop: 40 }}>
        Du musst <Link href="/auth/login" style={{ color: 'var(--accent-ink)' }}>angemeldet sein</Link>.
      </p>
    </div></div>
  )

  return (
    <div className="zh-page">
      <div className="zh-page-inner" style={{ maxWidth: 680 }}>
        <Link href={`/profile/${user.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 24, textDecoration: 'none' }}>
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} /> Zurück zum Profil
        </Link>
        <div>
          <div className="zd-mono accent">Schrauberhalle</div>
          <h1 className="zd-h1" style={{ marginTop: 6 }}>Schrauberhalle <em>einrichten.</em></h1>
        </div>
        <div className="zh-card" style={{ marginTop: 28 }}>
          <GarageEdit user={user} onSaved={() => { router.refresh(); router.push(`/profile/${user.id}`) }} />
        </div>
      </div>
    </div>
  )
}

export default function SchrauberhalleNewPage() {
  return (
    <DesktopLayout crumb="Schrauberhalle einrichten">
      <Suspense fallback={null}>
        <SchrauberhalleNewInner />
      </Suspense>
    </DesktopLayout>
  )
}
