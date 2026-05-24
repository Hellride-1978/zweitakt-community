'use client'

import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ClubActions({ clubId, creatorId, members }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [working, setWorking] = useState(false)

  const membership = user ? members.find((m) => m.user_id === user.id) : null
  const isMember = !!membership
  const isAdmin = membership?.role === 'admin'

  const handleJoin = async () => {
    if (!user) { router.push('/auth/login'); return }
    setWorking(true)
    await supabase.from('club_members').insert({ club_id: clubId, user_id: user.id, role: 'member' })
    router.refresh()
    setWorking(false)
  }

  const handleLeave = async () => {
    if (!membership || user.id === creatorId) return
    setWorking(true)
    await supabase.from('club_members').delete().eq('id', membership.id)
    router.refresh()
    setWorking(false)
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {!user && (
        <button onClick={handleJoin} className="zh-btn">Beitreten →</button>
      )}

      {user && !isMember && (
        <button onClick={handleJoin} disabled={working} className="zh-btn" style={{ opacity: working ? 0.6 : 1 }}>
          {working ? 'Lädt…' : 'Beitreten →'}
        </button>
      )}

      {isMember && !isAdmin && (
        <button onClick={handleLeave} disabled={working} className="zh-btn zh-btn-outline" style={{ fontSize: 13, opacity: working ? 0.6 : 1 }}>
          {working ? 'Lädt…' : 'Club verlassen'}
        </button>
      )}
    </div>
  )
}
