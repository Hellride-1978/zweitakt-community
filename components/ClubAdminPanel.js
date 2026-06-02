'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faCheck, faXmark, faClock } from '@fortawesome/free-solid-svg-icons'

export default function ClubAdminPanel({ clubId, clubSlug, createdBy, pendingMembers, adminUserIds }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [processing, setProcessing] = useState(null)

  if (loading || !user) return null
  if (!adminUserIds.includes(user.id)) return null

  const confirm = async (membershipId) => {
    setProcessing(membershipId)
    await supabase.from('club_memberships').update({ status: 'active' }).eq('id', membershipId)
    setProcessing(null)
    router.refresh()
  }

  const reject = async (membershipId) => {
    if (!window.confirm('Anfrage ablehnen?')) return
    setProcessing(membershipId)
    await supabase.from('club_memberships').delete().eq('id', membershipId)
    setProcessing(null)
    router.refresh()
  }

  return (
    <div style={{ marginTop: 24 }}>
      <Link
        href={`/clubs/${clubSlug}/edit`}
        className="zd-btn"
        style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13, padding: '9px 16px' }}
      >
        <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 13 }} /> Klub bearbeiten
      </Link>

      {pendingMembers.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 10 }}>
            <FontAwesomeIcon icon={faClock} style={{ fontSize: 10 }} />
            Ausstehend ({pendingMembers.length})
          </div>
          {pendingMembers.map((m) => {
            const name = m.profiles?.name || m.email || 'Unbekannt'
            const isProcessing = processing === m.id
            return (
              <div key={m.id} className="club-pending-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>{name}</div>
                  {m.email && m.profiles?.name && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.5px' }}>{m.email}</div>
                  )}
                </div>
                <button
                  onClick={() => confirm(m.id)}
                  disabled={isProcessing}
                  title="Bestätigen"
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--ink)', background: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 13, color: '#3a8a3a' }} />
                </button>
                <button
                  onClick={() => reject(m.id)}
                  disabled={isProcessing}
                  title="Ablehnen"
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--ink)', background: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13, color: '#c00' }} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
