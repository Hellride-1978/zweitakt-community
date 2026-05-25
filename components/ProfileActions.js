'use client'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

export default function ProfileActions({ profileId }) {
  const { user, loading } = useAuth()
  if (loading || !user || user.id !== profileId) return null
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
