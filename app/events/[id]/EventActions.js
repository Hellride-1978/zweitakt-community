'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EventActions({ eventId, creatorId, participants, maxParticipants }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [working, setWorking] = useState(false)

  const participation = user ? participants.find((p) => p.user_id === user.id) : null
  const isJoined = !!participation
  const isFull = maxParticipants && participants.length >= maxParticipants && !isJoined
  const isCreator = user && user.id === creatorId

  const handleJoin = async () => {
    if (!user) { router.push('/auth/login'); return }
    setWorking(true)
    await supabase.from('ride_participants').insert({ ride_id: eventId, user_id: user.id })
    router.refresh()
    setWorking(false)
  }

  const handleLeave = async () => {
    if (!participation) return
    setWorking(true)
    await supabase.from('ride_participants').delete().eq('id', participation.id)
    router.refresh()
    setWorking(false)
  }

  const handleDelete = async () => {
    if (!confirm('Event wirklich löschen?')) return
    setWorking(true)
    await supabase.from('rides').delete().eq('id', eventId)
    router.push('/events')
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {!user ? (
        <>
          <button onClick={handleJoin} className="zh-btn">Ich bin dabei →</button>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', textAlign: 'center' }}>
            Zum Anmelden bitte einloggen.
          </p>
        </>
      ) : isCreator ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Link href={`/events/${eventId}/edit`} className="zh-btn zh-btn-outline" style={{ justifyContent: 'center', fontSize: 15, padding: '10px 12px' }}>
            Bearbeiten →
          </Link>
          <button onClick={handleDelete} disabled={working} className="zh-btn" style={{ background: '#c55a3c', borderColor: '#c55a3c', fontSize: 15, padding: '10px 12px', opacity: working ? 0.6 : 1 }}>
            {working ? 'Löscht…' : 'Löschen'}
          </button>
        </div>
      ) : isJoined ? (
        <button onClick={handleLeave} disabled={working} className="zh-btn zh-btn-outline" style={{ opacity: working ? 0.6 : 1 }}>
          {working ? 'Lädt…' : '✓ Angemeldet — Abmelden'}
        </button>
      ) : (
        <button onClick={handleJoin} disabled={working || isFull} className="zh-btn" style={{ opacity: (working || isFull) ? 0.6 : 1 }}>
          {working ? 'Lädt…' : isFull ? 'Ausgebucht' : 'Ich bin dabei →'}
        </button>
      )}
    </div>
  )
}
