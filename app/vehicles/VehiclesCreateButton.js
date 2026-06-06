'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

export default function VehiclesCreateButton() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <Link href="/vehicles/new" className="forum-submit-btn" style={{ textDecoration: 'none', whiteSpace: 'nowrap', padding: '11px 24px' }}>
      + Bike anlegen
    </Link>
  )
}
