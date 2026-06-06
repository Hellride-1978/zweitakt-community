'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'
import DesktopLayout from '@/components/DesktopLayout'
import FormError from '@/components/FormError'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default function NewMessagePage() {
  return (
    <Suspense>
      <NewMessagePageInner />
    </Suspense>
  )
}

function NewMessagePageInner() {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const toId = searchParams.get('to')

  const [recipient, setRecipient] = useState(null)
  const [form, setForm] = useState({ subject: '', body: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!toId) return
    supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', toId)
      .single()
      .then(({ data }) => setRecipient(data))
  }, [toId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || !toId || !form.subject.trim() || !form.body.trim()) return
    setSending(true)
    setError(null)
    try {
      const { error: insertError } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: toId,
        subject: form.subject.trim(),
        body: form.body.trim(),
      })
      if (insertError) throw insertError

      const { data: senderProfile } = await supabase
        .from('profiles').select('name').eq('id', user.id).single()

      await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: toId,
          senderName: senderProfile?.name || 'Jemand',
        }),
      })

      router.push('/messages')
    } catch (err) {
      setError(err.message)
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="zh-page">
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          Lade…
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="zh-page">
        <div className="zh-card zh-page-inner-sm">Bitte zuerst anmelden.</div>
      </div>
    )
  }

  return (
    <DesktopLayout>
      <div className="zh-page">
        <div className="zh-page-inner" style={{ maxWidth: 680 }}>

          <div style={{ marginBottom: 24 }}>
            <Link
              href="/messages"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Inbox
            </Link>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
              Nachrichten
            </div>
            <h1 className="zd-h1">Neue Nachricht.</h1>
          </div>

          {recipient && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'color-mix(in oklab, var(--accent-3) 28%, var(--cream))', border: '1.5px solid var(--ink)', borderRadius: 14, marginBottom: 24 }}>
              <div className="zh-avatar offline" style={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
                {recipient.avatar_url
                  ? <img src={recipient.avatar_url} alt={recipient.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (recipient.name || '?').charAt(0).toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>An</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 20, lineHeight: 1, marginTop: 2 }}>{recipient.name}</div>
              </div>
            </div>
          )}

          {!toId && (
            <div className="zh-error" style={{ marginBottom: 24 }}>
              Kein Empfänger angegeben. Gehe zum Profil eines Users und klicke auf „Nachricht senden".
            </div>
          )}

          <FormError message={error} />

          <form onSubmit={handleSubmit} className="zh-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label htmlFor="subject" className="zh-label">Betreff</label>
              <input
                id="subject"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="zh-input"
                placeholder="Worum geht's?"
                required
                disabled={!toId}
              />
            </div>
            <div>
              <label htmlFor="body" className="zh-label">Nachricht</label>
              <textarea
                id="body"
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                className="zh-input"
                rows={6}
                placeholder="Schreib deine Nachricht…"
                style={{ resize: 'vertical' }}
                required
                disabled={!toId}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={sending || !toId} className="zh-btn">
                {sending
                  ? 'Senden…'
                  : <><FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 14 }} /> Senden</>
                }
              </button>
            </div>
          </form>

        </div>
      </div>
    </DesktopLayout>
  )
}
