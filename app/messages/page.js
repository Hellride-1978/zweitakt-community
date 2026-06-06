'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faTrash } from '@fortawesome/free-solid-svg-icons'

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (days === 0) return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Gestern'
  if (days < 7) return date.toLocaleDateString('de-DE', { weekday: 'short' })
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const [tab, setTab] = useState('inbox')
  const [inbox, setInbox] = useState([])
  const [sent, setSent] = useState([])
  const [fetching, setFetching] = useState(true)
  const [deleteStep, setDeleteStep] = useState({})
  const [deleting, setDeleting] = useState({})

  const fetchAll = useCallback(async () => {
    if (!user) return
    const [inboxRes, sentRes] = await Promise.all([
      supabase
        .from('messages')
        .select(`
          id, subject, body, read, parent_id, created_at, sender_id, recipient_id,
          sender:profiles!sender_id(id, name, avatar_url)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('messages')
        .select(`
          id, subject, body, read, parent_id, created_at, sender_id, recipient_id,
          recipient:profiles!recipient_id(id, name, avatar_url)
        `)
        .eq('sender_id', user.id)
        .is('parent_id', null)
        .order('created_at', { ascending: false }),
    ])
    setInbox(inboxRes.data || [])
    setSent(sentRes.data || [])
    setFetching(false)
  }, [user])

  useEffect(() => {
    if (!loading) fetchAll()
  }, [loading, fetchAll])

  // Eingang: nach Thread gruppieren
  const inboxThreads = (() => {
    const map = new Map()
    for (const msg of inbox) {
      const rootId = msg.parent_id ?? msg.id
      if (!map.has(rootId)) {
        map.set(rootId, {
          rootId,
          latest: msg,
          hasUnread: !msg.read,
          subject: msg.parent_id ? null : msg.subject,
        })
      } else {
        if (!msg.read) map.get(rootId).hasUnread = true
      }
    }
    for (const t of map.values()) {
      if (!t.subject) {
        const root = inbox.find(m => m.id === t.rootId)
        t.subject = root?.subject || '(Nachricht)'
      }
    }
    return Array.from(map.values())
  })()

  const handleDelete = async (rootId) => {
    setDeleting(d => ({ ...d, [rootId]: true }))
    const toDelete = inbox.filter(m => m.id === rootId || m.parent_id === rootId)
    for (const msg of toDelete) {
      await supabase.from('messages').delete().eq('id', msg.id)
    }
    setInbox(ms => ms.filter(m => m.id !== rootId && m.parent_id !== rootId))
    setDeleteStep(d => ({ ...d, [rootId]: 0 }))
    setDeleting(d => ({ ...d, [rootId]: false }))
  }

  if (loading || fetching) {
    return (
      <DesktopLayout>
        <div className="feed-col">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            Lade…
          </div>
        </div>
      </DesktopLayout>
    )
  }

  if (!user) {
    return (
      <DesktopLayout>
        <div className="feed-col">
          <div className="zh-card">Bitte zuerst anmelden.</div>
        </div>
      </DesktopLayout>
    )
  }

  const unreadCount = inboxThreads.filter(t => t.hasUnread).length

  return (
    <DesktopLayout>
      <div className="feed-col">
        <div className="feed-head">
          <div>
            <div className="zd-mono accent">Nachrichten</div>
            <h1 className="zd-h1" style={{ marginTop: 6 }}>
              {tab === 'inbox' ? 'Eingang.' : 'Ausgang.'}
            </h1>
          </div>
        </div>

          {/* Tabs */}
          <div className="tab-pills" style={{ marginBottom: 28 }}>
            <button
              className={`tab-pill${tab === 'inbox' ? ' on' : ''}`}
              onClick={() => setTab('inbox')}
            >
              Eingang
              {unreadCount > 0 && (
                <span className="msg-badge" style={{ marginLeft: 6 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              className={`tab-pill${tab === 'sent' ? ' on' : ''}`}
              onClick={() => setTab('sent')}
            >
              Ausgang
            </button>
          </div>

          {/* Eingang */}
          {tab === 'inbox' && (
            inboxThreads.length === 0 ? (
              <EmptyState text="Noch keine Nachrichten." />
            ) : (
              <div className="msg-list">
                {inboxThreads.map(({ rootId, latest, hasUnread, subject }) => {
                  const step = deleteStep[rootId] ?? 0
                  const isDel = deleting[rootId]
                  const initial = (latest.sender?.name || '?').charAt(0).toUpperCase()
                  return (
                    <div key={rootId} className={`msg-row${hasUnread ? ' unread' : ''}`}>
                      <Link href={`/messages/${rootId}`} className="msg-main">
                        <div className="zh-avatar offline" style={{ width: 44, height: 44, fontSize: 18, flexShrink: 0 }}>
                          {latest.sender?.avatar_url
                            ? <img src={latest.sender.avatar_url} alt={latest.sender.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : initial
                          }
                        </div>
                        <div className="msg-content">
                          <div className="msg-meta">
                            <span className="msg-sender">{latest.sender?.name || 'Unbekannt'}</span>
                            <span className="msg-date">{formatDate(latest.created_at)}</span>
                          </div>
                          <div className="msg-subject">{subject || '(kein Betreff)'}</div>
                          <div className="msg-preview">
                            {latest.body?.slice(0, 80)}{latest.body?.length > 80 ? '…' : ''}
                          </div>
                        </div>
                        {hasUnread && <span className="msg-dot" aria-label="Ungelesen" />}
                      </Link>
                      <div className="msg-actions">
                        {step === 0 ? (
                          <button
                            className="zd-btn-sm"
                            onClick={() => setDeleteStep(d => ({ ...d, [rootId]: 1 }))}
                            aria-label="Nachricht löschen"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="zd-btn-sm on" onClick={() => handleDelete(rootId)} disabled={isDel}>
                              {isDel ? '…' : 'Löschen'}
                            </button>
                            <button className="zd-btn-sm" onClick={() => setDeleteStep(d => ({ ...d, [rootId]: 0 }))}>
                              Abbruch
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Ausgang */}
          {tab === 'sent' && (
            sent.length === 0 ? (
              <EmptyState text="Noch keine gesendeten Nachrichten." />
            ) : (
              <div className="msg-list">
                {sent.map(msg => {
                  const initial = (msg.recipient?.name || '?').charAt(0).toUpperCase()
                  return (
                    <div key={msg.id} className="msg-row">
                      <Link href={`/messages/${msg.id}`} className="msg-main">
                        <div className="zh-avatar offline" style={{ width: 44, height: 44, fontSize: 18, flexShrink: 0 }}>
                          {msg.recipient?.avatar_url
                            ? <img src={msg.recipient.avatar_url} alt={msg.recipient.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : initial
                          }
                        </div>
                        <div className="msg-content">
                          <div className="msg-meta">
                            <span className="msg-sender" style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
                              An: <strong style={{ color: 'var(--ink)' }}>{msg.recipient?.name || 'Unbekannt'}</strong>
                            </span>
                            <span className="msg-date">{formatDate(msg.created_at)}</span>
                          </div>
                          <div className="msg-subject">{msg.subject}</div>
                          <div className="msg-preview">
                            {msg.body?.slice(0, 80)}{msg.body?.length > 80 ? '…' : ''}
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )
          )}

      </div>
    </DesktopLayout>
  )
}

function EmptyState({ text }) {
  return (
    <div className="zh-card" style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)' }}>
      <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 32, opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
      <p style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--ink-muted)', margin: 0 }}>{text}</p>
    </div>
  )
}
