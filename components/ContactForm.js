'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '', privacy: false })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [error, setError] = useState(null)

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const togglePrivacy = () => setForm(p => ({ ...p, privacy: !p.privacy }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('success')
    } catch (err) {
      setError(err.message || 'Fehler beim Senden.')
      setStatus('idle')
    }
  }

  return (
    <section className="zh-contact">
      <div className="zh-contact-form">
        <div className="zh-preview-head" style={{ marginBottom: 32 }}>
          <div>
            <div className="mark">Ich freue mich</div>
            <h2>Schreib <em>mir.</em></h2>
          </div>
        </div>

        {status === 'success' ? (
          <div className="zh-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 48, color: 'var(--accent)', lineHeight: 1 }}>✓</div>
            <p style={{ marginTop: 16, fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Danke! Ich melde mich bald.
            </p>
            <button
              onClick={() => { setForm({ name: '', email: '', message: '' }); setStatus('idle') }}
              style={{ marginTop: 20, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}
            >
              Weitere Nachricht senden
            </button>
          </div>
        ) : (
          <div className="zh-card">
            {error && (
              <div className="zh-error" role="alert" style={{ marginBottom: 20 }}>{error}</div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="zh-contact-row">
                <div>
                  <label htmlFor="contact-name" className="zh-label">Name *</label>
                  <input
                    id="contact-name"
                    value={form.name}
                    onChange={set('name')}
                    className="zh-input"
                    placeholder="Dein Name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="zh-label">E-Mail *</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className="zh-input"
                    placeholder="deine@mail.de"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="zh-label">Nachricht *</label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={set('message')}
                  className="zh-input"
                  rows={5}
                  style={{ resize: 'vertical' }}
                  placeholder="Was möchtest du uns sagen?"
                  required
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.privacy}
                  onChange={togglePrivacy}
                  required
                  style={{ marginTop: 3, flexShrink: 0, accentColor: 'var(--accent)' }}
                />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                  Ich habe die{' '}
                  <Link href="/datenschutz" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Datenschutzerklärung</Link>
                  {' '}gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu.
                </span>
              </label>
              <div>
                <button
                  type="submit"
                  disabled={status === 'sending' || !form.privacy}
                  className="zh-btn"
                  style={{ opacity: (status === 'sending' || !form.privacy) ? 0.5 : 1 }}
                >
                  {status === 'sending' ? 'Sendet…' : 'Nachricht senden →'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
