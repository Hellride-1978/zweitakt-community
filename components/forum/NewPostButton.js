'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

export default function NewPostButton() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <Link href="/forum/neu" className="forum-submit-btn" style={{ textDecoration: 'none', whiteSpace: 'nowrap', padding: '11px 24px' }}>
      + Neue Frage
    </Link>
  )
}
