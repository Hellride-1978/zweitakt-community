'use client'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

export default function VehicleOwnerActions({ vehicleId, ownerId }) {
  const { user, loading } = useAuth()
  if (loading || !user || user.id !== ownerId) return null
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Link href={`/vehicles/${vehicleId}/edit`} className="zd-btn accent" style={{ flex: 1 }}>
        Bearbeiten
      </Link>
      <Link href="/vehicles/new" className="zd-btn outline">
        + Weiteres Bike
      </Link>
    </div>
  )
}
