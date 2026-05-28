'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

const TYPES = [
  { key: 'lob',  label: '👍 Lob' },
  { key: 'bug',  label: '🐛 Bug' },
  { key: 'idee', label: '💡 Idee' },
]

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('lob')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [includeUrl, setIncludeUrl] = useState(true)
  const [status, setStatus] = useState('idle')
  const { user } = useAuth()
  const pathname = usePathname()
  const textRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (open && textRef.current) {
      setTimeout(() => textRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && open) close() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const reset = () => {
    setMessage('')
    setEmail('')
    setType('lob')
    setIncludeUrl(true)
    setStatus('idle')
  }

  const close = () => { setOpen(false); reset() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (message.length < 10 || status === 'sending') return
    setStatus('sending')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          url: includeUrl ? pathname : null,
          email: user ? null : (email || null),
          userId: user?.id || null,
        }),
      })

      if (res.ok) {
        setStatus('success')
        setTimeout(() => { setOpen(false); reset() }, 2000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="zh-feedback-btn"
        aria-label="Feedback geben"
        aria-haspopup="dialog"
      >
        💬
      </button>

      {open && (
        <div
          className="zh-feedback-overlay"
          onClick={close}
          role="presentation"
        >
          <div
            ref={modalRef}
            className="zh-feedback-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Feedback"
          >
            <div className="zh-feedback-header">
              <span className="zh-feedback-label">Feedback</span>
              <button onClick={close} className="zh-feedback-close" aria-label="Schließen">×</button>
            </div>

            {status === 'success' ? (
              <div className="zh-feedback-success">
                <span>🤙</span>
                <p>Danke!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="zh-feedback-types" role="group" aria-label="Feedback-Typ">
                  {TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`zh-feedback-type${type === t.key ? ' active' : ''}`}
                      onClick={() => setType(t.key)}
                      aria-pressed={type === t.key}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={textRef}
                  className="zh-feedback-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Was liegt dir auf dem Herzen?"
                  maxLength={1000}
                  rows={4}
                  required
                  aria-label="Nachricht"
                />
                <div className="zh-feedback-chars" style={{ color: message.length > 0 && message.length < 10 ? '#e53e3e' : undefined }}>
                  {message.length > 0 && message.length < 10
                    ? `Noch ${10 - message.length} Zeichen`
                    : `${message.length} / 1000`}
                </div>

                {!user && (
                  <input
                    type="email"
                    className="zh-feedback-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Deine E-Mail (optional)"
                    aria-label="E-Mail"
                  />
                )}

                <label className="zh-feedback-url-check">
                  <input
                    type="checkbox"
                    checked={includeUrl}
                    onChange={(e) => setIncludeUrl(e.target.checked)}
                  />
                  <span>Aktuelle Seite mitschicken&thinsp;({pathname})</span>
                </label>

                <button
                  type="submit"
                  disabled={message.length < 10 || status === 'sending'}
                  className="zh-btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: 8,
                    opacity: (message.length < 10 || status === 'sending') ? 0.45 : 1,
                    cursor: message.length < 10 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {status === 'sending' ? 'Wird gesendet…' : 'Abschicken →'}
                </button>

                {status === 'error' && (
                  <p className="zh-feedback-error" role="alert">Ups — bitte nochmal versuchen.</p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
