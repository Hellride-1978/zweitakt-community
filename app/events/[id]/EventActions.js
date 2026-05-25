'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

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
          <button onClick={handleJoin} className="zh-btn" style={{ gap: 8 }}>Ich bin dabei <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} /></button>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', textAlign: 'center' }}>
            Zum Anmelden bitte einloggen.
          </p>
        </>
      ) : isCreator ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Link href={`/events/${eventId}/edit`} className="zh-btn zh-btn-outline" style={{ justifyContent: 'center', fontSize: 15, padding: '10px 12px' }}>
            Bearbeiten <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} />
          </Link>
          <button onClick={handleDelete} disabled={working} className="zh-btn" style={{ background: '#c55a3c', borderColor: '#c55a3c', fontSize: 15, padding: '10px 12px', opacity: working ? 0.6 : 1 }}>
            {working ? 'Löscht…' : 'Löschen'}
          </button>
        </div>
      ) : isJoined ? (
        <>
          <div style={{
            background: 'color-mix(in oklab, #22c55e 14%, var(--cream))',
            border: '1.5px solid #22c55e',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '1.8px',
            textTransform: 'uppercase',
            color: '#16a34a',
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>✓</span>
            Du bist dabei!
          </div>
          <button onClick={handleLeave} disabled={working} className="zh-btn zh-btn-outline" style={{ opacity: working ? 0.6 : 1, fontSize: 13 }}>
            {working ? 'Lädt…' : 'Abmelden'}
          </button>
        </>
      ) : (
        <button onClick={handleJoin} disabled={working || isFull} className="zh-btn" style={{ opacity: (working || isFull) ? 0.6 : 1 }}>
          {working ? 'Lädt…' : isFull ? 'Ausgebucht' : <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Ich bin dabei <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} /></span>}
        </button>
      )}
    </div>
  )
}
