'use client'
import { useAuth } from '@/lib/useAuth'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

export default function ProfileActions({ profileId }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const settingsOpen = searchParams.get('settings') === '1'

  if (loading || !user) return null

  if (user.id === profileId) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => router.push(settingsOpen ? pathname : `${pathname}?settings=1`)}
          className="zd-btn outline"
          style={{ flex: 1, fontSize: 15, padding: '10px 16px' }}
        >
          {settingsOpen ? 'Schließen' : 'Bearbeiten'}
        </button>
        <Link href="/vehicles/new" className="zd-btn accent" style={{ flex: 1, fontSize: 15, padding: '10px 16px' }}>
          + Bike
        </Link>
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
