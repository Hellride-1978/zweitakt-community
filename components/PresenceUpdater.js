'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

// Interval in dem last_seen aktualisiert wird (5 Minuten)
const HEARTBEAT_MS = 5 * 60 * 1000

export default function PresenceUpdater() {
  const { user } = useAuth()
  const intervalRef = useRef(null)

  const ping = async (userId) => {
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', userId)
  }

  useEffect(() => {
    if (!user?.id) return

    // Sofort beim Login/Mount pingen
    ping(user.id)

    // Danach alle 5 Minuten
    intervalRef.current = setInterval(() => ping(user.id), HEARTBEAT_MS)

    return () => clearInterval(intervalRef.current)
  }, [user?.id])

  return null
}
