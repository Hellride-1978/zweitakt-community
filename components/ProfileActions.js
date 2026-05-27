'use client'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

export default function ProfileActions({ profileId }) {
  const { user, loading } = useAuth()
  if (loading || !user) return null

  // Eigenes Profil: Bearbeiten + Bike hinzufügen
  if (user.id === profileId) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href="/profile/edit" className="zd-btn outline" style={{ flex: 1, fontSize: 15, padding: '10px 16px' }}>
          Bearbeiten
        </Link>
        <Link href="/vehicles/new" className="zd-btn accent" style={{ flex: 1, fontSize: 15, padding: '10px 16px' }}>
          + Bike
        </Link>
      </div>
    )
  }

  // Fremdes Profil: Nachricht senden
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
