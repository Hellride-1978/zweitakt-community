'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'martin@delavega.de'

const TYPE_META = {
  lob:  { label: '👍 Lob',           color: '#16a34a', bg: '#dcfce7' },
  bug:  { label: '🐛 Bug',           color: '#dc2626', bg: '#fee2e2' },
  idee: { label: '💡 Idee / Wunsch', color: '#d97706', bg: '#fef9c3' },
}

function formatDate(str) {
  return new Date(str).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminFeedbackPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [feedbacks, setFeedbacks] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setFetching(true)
    setError(null)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) { setFetching(false); return }

    const params = filter !== 'all' ? `?type=${filter}` : ''
    const res = await fetch(`/api/admin/feedbacks${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Fehler'); setFetching(false); return }
    setFeedbacks(json.data || [])
    setFetching(false)
  }, [filter])

  useEffect(() => {
    if (loading) return
    if (!user || user.email !== ADMIN_EMAIL) { router.replace('/'); return }
    load()
  }, [user, loading, load])

  if (loading || (!user && !loading)) return null
  if (user && user.email !== ADMIN_EMAIL) return null

  return (
    <div className="zh-page" style={{ maxWidth: 860, padding: 'clamp(24px,4vw,48px) var(--gutter)' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="mark" style={{ marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px,5vw,52px)', margin: 0, lineHeight: 1.1 }}>
          Feedback<em>.</em>
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {[['all', 'Alle'], ['lob', '👍 Lob'], ['bug', '🐛 Bug'], ['idee', '💡 Idee']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '7px 16px',
              borderRadius: 100,
              border: '1.5px solid',
              borderColor: filter === key ? 'var(--ink)' : 'var(--hairline)',
              background: filter === key ? 'var(--ink)' : 'transparent',
              color: filter === key ? 'var(--cream)' : 'var(--ink-muted)',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={load}
          style={{
            marginLeft: 'auto',
            padding: '7px 16px',
            borderRadius: 100,
            border: '1.5px solid var(--hairline)',
            background: 'transparent',
            color: 'var(--ink-muted)',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          ↻ Laden
        </button>
      </div>

      {fetching ? (
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Lädt…
        </p>
      ) : error ? (
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#e53e3e', letterSpacing: '1.5px' }}>{error}</p>
      ) : feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', border: '2px dashed var(--hairline)', borderRadius: 18 }}>
          <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)', margin: 0 }}>
            Kein Feedback vorhanden.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {feedbacks.map((fb) => {
            const meta = TYPE_META[fb.type] || { label: fb.type, color: 'var(--ink)', bg: 'var(--cream-2)' }
            const sender = fb.profiles?.name || fb.email || '—'
            return (
              <div
                key={fb.id}
                style={{
                  background: 'var(--cream)',
                  border: '1.5px solid var(--hairline)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '0 16px',
                  alignItems: 'start',
                }}
              >
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 100,
                  background: meta.bg,
                  color: meta.color,
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  marginTop: 2,
                }}>
                  {meta.label}
                </span>

                <div>
                  <p style={{ margin: '0 0 8px', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {fb.message}
                  </p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {fb.url && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                        {fb.url}
                      </span>
                    )}
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                      Von: {sender}
                    </span>
                  </div>
                </div>

                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1px', color: 'var(--ink-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {formatDate(fb.created_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 48, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        {feedbacks.length} Einträge
      </div>
    </div>
  )
}
