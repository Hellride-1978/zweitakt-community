'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [exchanging, setExchanging] = useState(true)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) { setError('Kein gültiger Reset-Link.'); setExchanging(false); return }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError('Link ungültig oder abgelaufen. Bitte neu anfordern.')
      setExchanging(false)
    })
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwörter stimmen nicht überein.'); return }
    if (password.length < 6) { setError('Mindestens 6 Zeichen.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm">
        <div style={{ marginBottom: '32px' }}>
          <div className="zh-section-mark">
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>LOGIN</span>
            Neues Passwort
          </div>
          <h1 className="zh-page-title" style={{ marginTop: '16px' }}>Neues<br /><em>Passwort.</em></h1>
        </div>

        <div className="zh-card">
          {exchanging ? (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              Link wird geprüft…
            </p>
          ) : done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px' }}>
                Passwort gespeichert.
              </div>
              <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                Du wirst gleich weitergeleitet…
              </p>
            </div>
          ) : (
            <>
              {error && <div className="zh-error" role="alert" style={{ marginBottom: '20px' }}>{error}</div>}
              {!error && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label htmlFor="password" className="zh-label">Neues Passwort</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="zh-input"
                      placeholder="Mindestens 6 Zeichen"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm" className="zh-label">Passwort bestätigen</label>
                    <input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="zh-input"
                      placeholder="Nochmal eingeben"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="zh-btn"
                    style={{ justifyContent: 'center', gap: '8px', opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? 'Wird gespeichert…' : <><span>Passwort speichern</span><FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '13px' }} /></>}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
