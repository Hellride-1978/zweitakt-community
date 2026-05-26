'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { translateAuthError } from '@/lib/authErrors'

const RULES = [
  { id: 'len',     label: 'Mindestens 8 Zeichen',      test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Einen Großbuchstaben',       test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Eine Zahl',                  test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Ein Sonderzeichen (!@#$…)',  test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password) {
  if (!password) return 0
  return RULES.filter((r) => r.test(password)).length
}

const STRENGTH_LABEL = ['', 'Schwach', 'Mittel', 'Gut', 'Stark']
const STRENGTH_COLOR = ['', '#ef4444', '#f59e0b', '#84cc16', '#22c55e']

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const strength = getStrength(password)
  const passedRules = RULES.map((r) => r.test(password))
  const isStrong = strength === RULES.length

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      else setError('Kein gültiger Reset-Link. Bitte erneut anfordern.')
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isStrong) { setError('Bitte wähle ein sicheres Passwort (alle Kriterien erfüllen).'); return }
    if (password !== confirm) { setError('Passwörter stimmen nicht überein.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(translateAuthError(error.message)); return }
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm" style={{ paddingLeft: 'var(--gutter)', paddingRight: 'var(--gutter)' }}>
        <div style={{ marginBottom: '32px' }}>
          <div className="zh-section-mark">
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>LOGIN</span>
            Neues Passwort
          </div>
          <h1 className="zh-page-title" style={{ marginTop: '16px' }}>Neues<br /><em>Passwort.</em></h1>
        </div>

        <div className="zh-card">
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px' }}>
                Passwort gespeichert.
              </div>
              <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                Du wirst gleich weitergeleitet…
              </p>
            </div>
          ) : error && !ready ? (
            <div>
              <div className="zh-error" role="alert" style={{ marginBottom: '20px' }}>{error}</div>
              <a href="/auth/forgot-password" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>
                Neuen Link anfordern →
              </a>
            </div>
          ) : !ready ? (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              Wird geprüft…
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && <div className="zh-error" role="alert">{error}</div>}

              {/* Neues Passwort */}
              <div>
                <label htmlFor="password" className="zh-label">Neues Passwort</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="zh-input"
                    placeholder="••••••••"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '15px', padding: 0 }}
                    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>

                {password && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {RULES.map((_, i) => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: i < strength ? STRENGTH_COLOR[strength] : 'var(--parchment)',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: STRENGTH_COLOR[strength], marginBottom: '8px' }}>
                      {STRENGTH_LABEL[strength]}
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {RULES.map((rule, i) => (
                        <li key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', color: passedRules[i] ? '#22c55e' : 'var(--ink-muted)' }}>
                          <span style={{ fontSize: '11px' }}>{passedRules[i] ? '✓' : '○'}</span>
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Passwort bestätigen */}
              <div>
                <label htmlFor="confirm" className="zh-label">Passwort bestätigen</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="zh-input"
                    placeholder="••••••••"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '15px', padding: 0 }}
                    aria-label={showConfirm ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <div style={{ marginTop: '6px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', color: '#ef4444' }}>
                    Passwörter stimmen nicht überein.
                  </div>
                )}
                {confirm && password === confirm && (
                  <div style={{ marginTop: '6px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', color: '#22c55e' }}>
                    ✓ Passwörter stimmen überein.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isStrong}
                className="zh-btn"
                style={{ justifyContent: 'center', gap: '8px', marginTop: '8px', opacity: (loading || !isStrong) ? 0.5 : 1 }}
              >
                {loading ? 'Wird gespeichert…' : <><span>Passwort speichern</span><FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '13px' }} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
