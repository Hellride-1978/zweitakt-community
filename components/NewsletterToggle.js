'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'

const STATUS_LABEL = {
  pending:       { text: 'Ausstehend – bitte E-Mail bestätigen', color: '#92400e' },
  confirmed:     { text: 'Angemeldet',                            color: '#166534' },
  unsubscribed:  { text: 'Abgemeldet',                            color: 'var(--ink-muted)' },
  none:          { text: 'Nicht angemeldet',                      color: 'var(--ink-muted)' },
}

export default function NewsletterToggle() {
  const { user } = useAuth()
  const [status, setStatus] = useState('none')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email || '')
    })
    supabase
      .from('newsletter_subscribers')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setStatus(data?.status || 'none')
        setLoading(false)
      })
  }, [user])

  async function handleSubscribe() {
    if (!email) return
    setWorking(true)
    setFeedback(null)
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userId: user.id }),
    })
    const data = await res.json()
    setWorking(false)
    if (data.message) {
      setFeedback({ type: 'info', text: data.message })
      setStatus('confirmed')
    } else if (data.ok) {
      setFeedback({ type: 'info', text: 'Bestätigungsmail wurde gesendet. Bitte prüfe dein Postfach.' })
      setStatus('pending')
    } else {
      setFeedback({ type: 'error', text: data.error || 'Fehler bei der Anmeldung.' })
    }
  }

  async function handleUnsubscribe() {
    setWorking(true)
    setFeedback(null)
    // Unsubscribe-Token über den eigenen Datensatz holen (via API, da RLS nur eigene Zeile erlaubt)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/newsletter/unsubscribe-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ userId: user.id }),
    })
    const data = await res.json()
    setWorking(false)
    if (data.ok) {
      setStatus('unsubscribed')
      setFeedback({ type: 'info', text: 'Du wurdest erfolgreich abgemeldet.' })
    } else {
      setFeedback({ type: 'error', text: data.error || 'Fehler beim Abmelden.' })
    }
  }

  if (loading) return null

  const info = STATUS_LABEL[status] || STATUS_LABEL.none

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
            Zweitakthoden Newsletter
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: info.color, marginTop: 2 }}>
            {info.text}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {(status === 'none' || status === 'unsubscribed') && (
            <button
              onClick={handleSubscribe}
              disabled={working}
              className="zh-btn"
              style={{ fontSize: 13, padding: '8px 16px' }}
            >
              {working ? 'Moment…' : 'Anmelden'}
            </button>
          )}
          {status === 'pending' && (
            <button
              onClick={handleSubscribe}
              disabled={working}
              className="zd-btn outline"
              style={{ fontSize: 13, padding: '8px 16px' }}
            >
              {working ? 'Moment…' : 'Erneut senden'}
            </button>
          )}
          {status === 'confirmed' && (
            <button
              onClick={handleUnsubscribe}
              disabled={working}
              className="zd-btn outline"
              style={{ fontSize: 13, padding: '8px 16px', color: 'var(--ink-muted)', borderColor: 'var(--hairline)' }}
            >
              {working ? 'Moment…' : 'Abmelden'}
            </button>
          )}
        </div>
      </div>
      {feedback && (
        <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--sans)', color: feedback.type === 'error' ? '#6e2918' : 'var(--ink-soft)' }}>
          {feedback.text}
        </p>
      )}
    </div>
  )
}
