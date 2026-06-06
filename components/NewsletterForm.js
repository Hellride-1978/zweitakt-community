'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'

export default function NewsletterForm({ className = '', showLabel = false }) {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  if (loading || !user) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setState('loading')
    setMessage('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setState('error')
        setMessage(data.error || 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
      } else if (data.message) {
        setState('success')
        setMessage(data.message)
      } else {
        setState('success')
        setMessage('Bitte prüfe dein Postfach und bestätige deine Anmeldung.')
        setEmail('')
      }
    } catch {
      setState('error')
      setMessage('Verbindungsfehler. Bitte versuche es erneut.')
    }
  }

  if (state === 'success') {
    return (
      <div className={className} style={{ padding: '16px 20px', background: 'color-mix(in oklab, #22c55e 10%, var(--cream))', border: '1.5px solid #22c55e', borderRadius: 12 }}>
        <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 14, color: '#166534', lineHeight: 1.5 }}>
          ✓ {message}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {showLabel && <div className="zh-footer-col-label" style={{ marginBottom: 4 }}>Newsletter</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="deine@email.de"
          required
          disabled={state === 'loading'}
          className="zh-input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <button
          type="submit"
          disabled={state === 'loading' || !email}
          className="zh-btn"
          style={{ flexShrink: 0 }}
        >
          {state === 'loading' ? 'Moment…' : 'Anmelden →'}
        </button>
      </div>
      {state === 'error' && (
        <p style={{ margin: 0, fontSize: 13, color: '#6e2918', fontFamily: 'var(--sans)' }}>
          {message}
        </p>
      )}
      <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-muted)', fontFamily: 'var(--sans)' }}>
        Kein Spam. Jederzeit abbestellbar. Double Opt-in.
      </p>
    </form>
  )
}
