'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'

export default function MessagesBadge() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) { setCount(0); return }

    const fetchCount = () => {
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false)
        .then(({ count: n }) => setCount(n || 0))
    }

    fetchCount()

    const channel = supabase
      .channel(`messages-badge-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      }, fetchCount)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      }, fetchCount)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  if (!count) return null

  return (
    <span className="msg-badge" aria-label={`${count} ungelesene Nachrichten`}>
      {count > 9 ? '9+' : count}
    </span>
  )
}
