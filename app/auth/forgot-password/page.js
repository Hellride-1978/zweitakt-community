'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { translateAuthError } from '@/lib/authErrors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    setLoading(false)
    if (error) { setError(translateAuthError(error.message)); return }
    setSent(true)
  }

  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm">
        <div style={{ marginBottom: '32px' }}>
          <div className="zh-section-mark">
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>LOGIN</span>
            Passwort vergessen
          </div>
          <h1 className="zh-page-title" style={{ marginTop: '16px' }}>Passwort<br /><em>zurücksetzen.</em></h1>
        </div>

        <div className="zh-card">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px' }}>
                Mail verschickt.
              </div>
              <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '24px' }}>
                Schau in dein Postfach — der Link zum Zurücksetzen ist unterwegs. Auch Spam-Ordner checken.
              </p>
              <Link href="/auth/login" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>
                Zurück zum Login
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="zh-error" role="alert" style={{ marginBottom: '20px' }}>{error}</div>}
              <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                Gib deine E-Mail-Adresse ein — wir schicken dir einen Link zum Zurücksetzen.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label htmlFor="email" className="zh-label">E-Mail</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="zh-input"
                    placeholder="dein@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="zh-btn"
                  style={{ justifyContent: 'center', gap: '8px', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Wird gesendet…' : <><span>Link senden</span><FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '13px' }} /></>}
                </button>
              </form>
              <p style={{ marginTop: '24px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', textAlign: 'center' }}>
                <Link href="/auth/login" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>
                  Zurück zum Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
