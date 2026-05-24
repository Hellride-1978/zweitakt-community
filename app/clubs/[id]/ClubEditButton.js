'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

export default function ClubEditButton({ clubId, members }) {
  const { user, loading } = useAuth()
  const isAdmin = user ? members.some(m => m.user_id === user.id && m.role === 'admin') : false

  if (loading || !isAdmin) return null

  return (
    <Link href={`/clubs/${clubId}/edit`} className="zh-btn zh-btn-outline" style={{ fontSize: 13, display: 'block', textAlign: 'center' }}>
      Club bearbeiten →
    </Link>
  )
}
