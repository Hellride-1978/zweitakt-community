'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function formatDate(str) {
  const d = new Date(str)
  const now = new Date()
  const diff = Math.floor((now - d) / 60000)
  if (diff < 1) return 'Gerade eben'
  if (diff < 60) return `vor ${diff} Min.`
  if (diff < 1440) return `vor ${Math.floor(diff / 60)} Std.`
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function Comments({ targetType, targetId, ownerId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteStep, setDeleteStep] = useState({})
  const [myProfile, setMyProfile] = useState(null)

  useEffect(() => {
    if (!targetId) return
    supabase
      .from('comments')
      .select('*, profiles(id, name, avatar_url)')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComments(data || []))
  }, [targetType, targetId])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('name, avatar_url').eq('id', user.id).single()
      .then(({ data }) => { if (data) setMyProfile(data) })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim() || !user) return
    setSaving(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({ target_type: targetType, target_id: targetId, user_id: user.id, body: body.trim() })
      .select('*, profiles(id, name, avatar_url)')
      .single()
    setSaving(false)
    if (!error && data) {
      setComments(c => [...c, data])
      setBody('')
      const commenterName = data.profiles?.name || user.email?.split('@')[0] || 'Jemand'
      supabase.auth.getSession().then(({ data: { session } }) => {
        fetch('/api/notify-comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ targetType, targetId, commenterName, commenterId: user.id }),
        }).catch(() => {})
      })
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('comments').delete().eq('id', id)
    setComments(c => c.filter(x => x.id !== id))
    setDeleteStep(s => ({ ...s, [id]: 0 }))
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>
        Kommentare {comments.length > 0 && `· ${comments.length}`}
      </div>

      {/* Kommentarliste */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {comments.map(c => {
            const canDelete = user && (user.id === c.user_id || user.id === ownerId)
            const step = deleteStep[c.id] ?? 0
            const initial = (c.profiles?.name || '?').charAt(0).toUpperCase()
            return (
              <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Link href={`/profile/${c.profiles?.id}`} style={{ flexShrink: 0, textDecoration: 'none' }}>
                  <div className="zh-avatar offline" style={{ width: 36, height: 36, fontSize: 14 }}>
                    {c.profiles?.avatar_url
                      ? <img src={c.profiles.avatar_url} alt={c.profiles.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : initial
                    }
                  </div>
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <Link href={`/profile/${c.profiles?.id}`} style={{ fontFamily: 'var(--display)', fontSize: 15, color: 'var(--ink)', textDecoration: 'none' }}>
                      {c.profiles?.name || 'Unbekannt'}
                    </Link>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {c.body}
                  </p>
                  {canDelete && (
                    <div style={{ marginTop: 6 }}>
                      {step === 0 ? (
                        <button onClick={() => setDeleteStep(s => ({ ...s, [c.id]: 1 }))} style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          Löschen
                        </button>
                      ) : (
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                          <button onClick={() => handleDelete(c.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Ja</button>
                          <span style={{ color: 'var(--hairline)', margin: '0 6px' }}>·</span>
                          <button onClick={() => setDeleteStep(s => ({ ...s, [c.id]: 0 }))} style={{ color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Nein</button>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {comments.length === 0 && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 20 }}>
          Noch keine Kommentare.
        </p>
      )}

      {/* Formular */}
      {user ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div className="zh-avatar offline" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
            {myProfile?.avatar_url
              ? <img src={myProfile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : (myProfile?.name || user.email || '?').charAt(0).toUpperCase()
            }
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Kommentar schreiben…"
              rows={2}
              className="zh-input"
              style={{ flex: 1, resize: 'none', fontSize: 14 }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e) }}
            />
            <button
              type="submit"
              disabled={saving || !body.trim()}
              className="zh-btn"
              style={{ fontSize: 13, padding: '8px 16px', opacity: saving || !body.trim() ? 0.5 : 1, flexShrink: 0 }}
            >
              {saving ? '…' : '→'}
            </button>
          </div>
        </form>
      ) : (
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          <Link href="/auth/login" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>Einloggen</Link> um zu kommentieren.
        </p>
      )}
    </div>
  )
}
