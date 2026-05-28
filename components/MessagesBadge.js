'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'

export default function MessagesBadge() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) { setCount(0); return }
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false)
      .then(({ count: n }) => setCount(n || 0))
  }, [user, pathname])

  if (!count) return null

  return (
    <span className="msg-badge" aria-label={`${count} ungelesene Nachrichten`}>
      {count > 9 ? '9+' : count}
    </span>
  )
}
