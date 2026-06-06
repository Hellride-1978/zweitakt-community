'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DesktopLayout from '@/components/DesktopLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faTrash, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

export default function ThreadClient({ id }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [fetching, setFetching] = useState(true)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [deleteStep, setDeleteStep] = useState({})
  const [deleting, setDeleting] = useState({})
  const bottomRef = useRef(null)
  const firstUnreadRef = useRef(null)
  const lastMsgRef = useRef(null)
  const initialScrollDone = useRef(false)

  useEffect(() => {
    if (loading || !user) return

    async function load() {
      const { data } = await supabase
        .from('messages')
        .select(`
          id, subject, body, read, parent_id, created_at, sender_id, recipient_id,
          sender:profiles!sender_id(id, name, avatar_url),
          recipient:profiles!recipient_id(id, name, avatar_url)
        `)
        .or(`id.eq.${id},parent_id.eq.${id}`)
        .order('created_at', { ascending: true })

      setMessages(data || [])
      setFetching(false)

      // Ungelesene Nachrichten als gelesen markieren
      const unread = (data || []).filter(m => !m.read && m.recipient_id === user.id)
      if (unread.length > 0) {
        for (const msg of unread) {
          await supabase.from('messages').update({ read: true }).eq('id', msg.id)
        }
      }
    }
    load()
  }, [id, user, loading])

  useEffect(() => {
    if (messages.length === 0) return
    if (!initialScrollDone.current) {
      initialScrollDone.current = true
      setTimeout(() => {
        const target = firstUnreadRef.current || lastMsgRef.current
        if (target) {
          const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 16
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }, 0)
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  const root = messages[0]

  const getOtherUserId = () => {
    if (!root || !user) return null
    return root.sender_id === user.id ? root.recipient_id : root.sender_id
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyBody.trim() || !root) return
    setSending(true)
    setError(null)
    try {
      const otherId = getOtherUserId()
      const replySubject = root.subject.startsWith('Re: ') ? root.subject : `Re: ${root.subject}`

      const { error: insertError } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: otherId,
        subject: replySubject,
        body: replyBody.trim(),
        parent_id: id,
      })
      if (insertError) throw insertError

      // Thread neu laden
      const { data } = await supabase
        .from('messages')
        .select(`
          id, subject, body, read, parent_id, created_at, sender_id, recipient_id,
          sender:profiles!sender_id(id, name, avatar_url),
          recipient:profiles!recipient_id(id, name, avatar_url)
        `)
        .or(`id.eq.${id},parent_id.eq.${id}`)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      setReplyBody('')

      // E-Mail-Benachrichtigung
      const { data: senderProfile } = await supabase
        .from('profiles').select('name').eq('id', user.id).single()
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: otherId, senderName: senderProfile?.name || 'Jemand' }),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (msgId) => {
    setDeleting(d => ({ ...d, [msgId]: true }))
    await supabase.from('messages').delete().eq('id', msgId)
    const remaining = messages.filter(m => m.id !== msgId)
    if (remaining.length === 0) {
      router.push('/messages')
    } else {
      setMessages(remaining)
    }
    setDeleteStep(d => ({ ...d, [msgId]: 0 }))
    setDeleting(d => ({ ...d, [msgId]: false }))
  }

  if (loading || fetching) {
    return (
      <DesktopLayout>
        <div className="zh-page">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            Lade…
          </div>
        </div>
      </DesktopLayout>
    )
  }

  if (!user) {
    return (
      <div className="zh-page">
        <div className="zh-card zh-page-inner-sm">Bitte zuerst anmelden.</div>
      </div>
    )
  }

  if (!root) {
    return (
      <DesktopLayout>
        <div className="zh-page">
          <div className="zh-page-inner" style={{ maxWidth: 760 }}>
            <div className="zh-card" style={{ marginBottom: 16 }}>Nachricht nicht gefunden.</div>
            <Link href="/messages" className="zd-btn outline" style={{ display: 'inline-flex', gap: 8 }}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 13 }} /> Inbox
            </Link>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  const otherName = root.sender_id === user?.id ? root.recipient?.name : root.sender?.name

  return (
    <DesktopLayout crumb={otherName || root.subject}>
      <div className="zh-page">
        <div className="zh-page-inner" style={{ maxWidth: 760 }}>

          <div style={{ marginBottom: 24 }}>
            <Link
              href="/messages"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Inbox
            </Link>
          </div>

          <h1
            className="zd-h1"
            style={{ fontSize: 'clamp(24px, 4vw, 40px)', marginBottom: 28 }}
          >
            {root.subject}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {messages.map((msg, idx) => {
              const isOwn = msg.sender_id === user.id
              const initial = (msg.sender?.name || '?').charAt(0).toUpperCase()
              const step = deleteStep[msg.id] ?? 0
              const isFirstUnread = !msg.read && msg.recipient_id === user.id &&
                messages.slice(0, idx).every(m => m.read || m.recipient_id !== user.id)
              const isLast = idx === messages.length - 1
              return (
                <div
                  key={msg.id}
                  ref={isFirstUnread ? firstUnreadRef : isLast ? lastMsgRef : null}
                  className={`msg-bubble${isOwn ? ' own' : ''}`}
                >
                  <div className="msg-bubble-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="zh-avatar offline" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
                        {msg.sender?.avatar_url
                          ? <img src={msg.sender.avatar_url} alt={msg.sender.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : initial
                        }
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 16, lineHeight: 1 }}>
                          {isOwn ? 'Du' : (msg.sender?.name || 'Unbekannt')}
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 3 }}>
                          {new Date(msg.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    {!isOwn && (
                      <div className="msg-actions">
                        {step === 0 ? (
                          <button
                            className="zd-btn-sm"
                            onClick={() => setDeleteStep(d => ({ ...d, [msg.id]: 1 }))}
                            aria-label="Nachricht löschen"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="zd-btn-sm on"
                              onClick={() => handleDelete(msg.id)}
                              disabled={deleting[msg.id]}
                            >
                              {deleting[msg.id] ? '…' : 'Löschen'}
                            </button>
                            <button
                              className="zd-btn-sm"
                              onClick={() => setDeleteStep(d => ({ ...d, [msg.id]: 0 }))}
                            >
                              Abbruch
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="msg-bubble-body">{msg.body}</div>
                </div>
              )
            })}
          </div>
          <div ref={bottomRef} />

          {error && <div className="zh-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleReply} className="zh-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label className="zh-label">Antwort</label>
            <textarea
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              className="zh-input"
              rows={4}
              placeholder="Schreib deine Antwort…"
              style={{ resize: 'vertical' }}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={sending} className="zh-btn">
                {sending
                  ? 'Senden…'
                  : <><FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 14 }} /> Antworten</>
                }
              </button>
            </div>
          </form>

        </div>
      </div>
    </DesktopLayout>
  )
}
