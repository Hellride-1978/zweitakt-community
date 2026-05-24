'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import InviteMember from '@/components/InviteMember'
import { inviteByEmail } from './actions'

function InviteCard({ clubId, members }) {
  const [open, setOpen] = useState(false)
  const existingMemberIds = members.map(m => m.user_id)

  if (open) {
    return (
      <div className="zd-mem" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12, cursor: 'default' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)' }}>
            Einladen
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1, padding: 0 }}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>
        <InviteMember
          clubId={clubId}
          existingMemberIds={existingMemberIds}
          inviteAction={(email, role) => inviteByEmail(clubId, email, role)}
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="zd-mem"
      style={{
        width: '100%',
        border: '1.5px dashed var(--ink-muted)',
        background: 'none',
        cursor: 'pointer',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: 64,
        color: 'var(--ink-muted)',
        transition: 'border-color 0.2s, color 0.2s',
      }}
    >
      <div style={{ fontSize: 22, lineHeight: 1, fontFamily: 'var(--display)' }}>+</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        Mitglied einladen
      </div>
    </button>
  )
}

export default function InvitePlaceholders({ clubId, members }) {
  const { user, loading } = useAuth()
  const isAdmin = user ? members.some(m => m.user_id === user.id && m.role === 'admin') : false

  if (loading || !isAdmin) return null

  return (
    <>
      <InviteCard clubId={clubId} members={members} />
      <InviteCard clubId={clubId} members={members} />
    </>
  )
}
