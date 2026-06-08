'use client'
import { useAuth } from '@/lib/useAuth'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons'

export default function ProfileActions({ profileId, hasPlz }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const settingsOpen = searchParams.get('settings') === '1'

  if (loading || !user) return null

  if (user.id === profileId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* PLZ-Nudge: nur wenn eigenes Profil und keine PLZ hinterlegt */}
        {!hasPlz && (
          <Link
            href="/profile/edit"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 12,
              background: 'color-mix(in oklab, var(--accent) 12%, var(--cream))',
              border: '1.5px solid var(--accent)',
              fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--accent-accessible)',
              textDecoration: 'none', lineHeight: 1.4,
            }}
          >
            <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 14, flexShrink: 0 }} />
            <span>
              <strong>PLZ hinterlegen</strong> — damit andere Schrauber dich in der Umkreissuche finden können.
            </span>
          </Link>
        )}
        <button
          onClick={() => router.push(settingsOpen ? pathname : `${pathname}?settings=1`)}
          className="zd-btn outline"
          style={{ width: '100%', fontSize: 15, padding: '10px 16px' }}
        >
          {settingsOpen ? 'Schließen' : 'Bearbeiten'}
        </button>
      </div>
    )
  }

  return (
    <Link
      href={`/messages/new?to=${profileId}`}
      className="zd-btn accent"
      style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 15, padding: '10px 16px' }}
    >
      <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 14 }} />
      Nachricht senden
    </Link>
  )
}
