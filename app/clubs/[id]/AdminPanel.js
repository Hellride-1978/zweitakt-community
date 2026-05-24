'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import InviteMember from '@/components/InviteMember'
import { inviteByEmail } from './actions'

const mono = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.8px', textTransform: 'uppercase' }

export default function AdminPanel({ clubId, creatorId, members }) {
  const { user } = useAuth()
  const router = useRouter()
  const [working, setWorking] = useState(null)

  const isAdmin = user ? members.some(m => m.user_id === user.id && m.role === 'admin') : false
  if (!isAdmin) return null

  const handleRemove = async (memberId) => {
    if (!confirm('Mitglied wirklich entfernen?')) return
    setWorking(memberId)
    await supabase.from('club_members').delete().eq('id', memberId)
    router.refresh()
    setWorking(null)
  }

  const handleToggleRole = async (memberId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    setWorking(memberId)
    await supabase.from('club_members').update({ role: newRole }).eq('id', memberId)
    router.refresh()
    setWorking(null)
  }

  const existingMemberIds = members.map(m => m.user_id)

  return (
    <div className="admin-panel-grid">

      {/* ── Mitgliederliste ── */}
      <div className="zh-card">
        <div style={{ ...mono, color: 'var(--accent)', marginBottom: 16 }}>Mitglieder verwalten</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((m) => {
            const u = m.profiles
            const isCreator = m.user_id === creatorId
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--hairline)' }}>
                <div className="zh-avatar offline" style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>
                  {u?.avatar_url
                    ? <img src={u.avatar_url} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : (u?.name || '?').charAt(0).toUpperCase()
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 16, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u?.name || 'Unbekannt'}
                  </div>
                  <div style={{ ...mono, color: m.role === 'admin' ? 'var(--accent)' : 'var(--ink-muted)', marginTop: 3 }}>
                    {m.role === 'admin' ? '★ Admin' : 'Mitglied'}{isCreator ? ' · Gründer' : ''}
                  </div>
                </div>

                {!isCreator && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleToggleRole(m.id, m.role)}
                      disabled={working === m.id}
                      className="zh-btn zh-btn-outline"
                      style={{ fontSize: 11, padding: '6px 10px', opacity: working === m.id ? 0.5 : 1 }}
                    >
                      {m.role === 'admin' ? 'Zu Mitglied' : 'Zu Admin'}
                    </button>
                    <button
                      onClick={() => handleRemove(m.id)}
                      disabled={working === m.id}
                      style={{ fontSize: 11, padding: '6px 10px', borderRadius: 8, border: '1.5px solid #c55a3c', background: 'none', color: '#c55a3c', cursor: 'pointer', opacity: working === m.id ? 0.5 : 1, fontFamily: 'var(--mono)', letterSpacing: '1px', textTransform: 'uppercase' }}
                    >
                      Entfernen
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Mitglied einladen ── */}
      <div className="zh-card">
        <div style={{ ...mono, color: 'var(--accent)', marginBottom: 16 }}>Mitglied einladen</div>
        <InviteMember
          clubId={clubId}
          existingMemberIds={existingMemberIds}
          inviteAction={(email, role) => inviteByEmail(clubId, email, role)}
        />
      </div>

    </div>
  )
}
