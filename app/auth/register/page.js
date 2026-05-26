'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { translateAuthError } from '@/lib/authErrors'

const RULES = [
  { id: 'len',     label: 'Mindestens 8 Zeichen',       test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Einen Großbuchstaben',        test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Eine Zahl',                   test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Ein Sonderzeichen (!@#$…)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password) {
  if (!password) return 0
  return RULES.filter((r) => r.test(password)).length
}

const STRENGTH_LABEL = ['', 'Schwach', 'Mittel', 'Gut', 'Stark']
const STRENGTH_COLOR = ['', '#ef4444', '#f59e0b', '#84cc16', '#22c55e']

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '', passwordConfirm: '', name: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [emailTaken, setEmailTaken] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const router = useRouter()

  const strength = getStrength(formData.password)
  const passedRules = RULES.map((r) => r.test(formData.password))
  const isStrong = strength === RULES.length

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'email') setEmailTaken(false)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailBlur = async () => {
    const email = formData.email.trim()
    if (!email || !email.includes('@')) return
    setEmailChecking(true)
    try {
      const { data } = await supabase.rpc('email_exists', { check_email: email })
      setEmailTaken(!!data)
    } catch {
      // silent — check again on submit
    } finally {
      setEmailChecking(false)
    }
  }

  const handleOAuth = async (provider) => {
    setOauthLoading(provider)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(translateAuthError(error.message)); setOauthLoading(null) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (emailTaken) {
      setError('Diese E-Mail-Adresse ist bereits registriert.')
      return
    }
    if (!isStrong) {
      setError('Bitte wähle ein sicheres Passwort (alle Kriterien erfüllen).')
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { name: formData.name } },
      })
      if (signUpError) throw signUpError

      fetch('/api/notify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      }).catch(() => {})

      alert('Registrierung erfolgreich! Bitte überprüfe deine E-Mail.')
      router.push('/auth/login')
    } catch (err) {
      setError(translateAuthError(err.message) || 'Registrierungsfehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm">
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)' }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>JOIN</span>
            Komm in die Crew
          </div>
          <h1 className="zh-page-title">Dabei sein.</h1>
          <p className="zh-page-lead">Kein Antrag. Keine Aufnahmegebühr.</p>
        </div>

        <div className="zh-card">
          {error && <div className="zh-error" role="alert" style={{ marginBottom: '20px' }}>{error}</div>}

          {/* OAuth */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="zh-btn zh-btn-outline"
              style={{ justifyContent: 'center', gap: '10px', opacity: oauthLoading === 'google' ? 0.6 : 1 }}
            >
              <FontAwesomeIcon icon={faGoogle} style={{ fontSize: '16px' }} />
              {oauthLoading === 'google' ? 'Weiterleitung…' : 'Mit Google registrieren'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--hairline)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>oder</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--hairline)' }} />
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="name" className="zh-label">Dein Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="zh-input" placeholder="z.B. Max Müller" />
            </div>

            <div>
              <label htmlFor="email" className="zh-label">E-Mail</label>
              <input
                id="email" name="email" type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                required
                className="zh-input"
                placeholder="dein@email.com"
                style={{ borderColor: emailTaken ? '#ef4444' : undefined }}
              />
              {emailChecking && (
                <div style={{ marginTop: '6px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', color: 'var(--ink-muted)' }}>
                  Wird geprüft…
                </div>
              )}
              {emailTaken && !emailChecking && (
                <div style={{ marginTop: '6px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', color: '#ef4444' }}>
                  Diese E-Mail ist bereits registriert.{' '}
                  <Link href="/auth/login" style={{ color: '#ef4444', borderBottom: '1px solid #ef4444' }}>Anmelden?</Link>
                </div>
              )}
            </div>

            {/* Passwort mit Toggle + Stärke-Anzeige */}
            <div>
              <label htmlFor="password" className="zh-label">Passwort</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Stärke-Balken */}
              {formData.password && (
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
              <label htmlFor="passwordConfirm" className="zh-label">Passwort wiederholen</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.passwordConfirm}
                  onChange={handleChange}
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
              {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                <div style={{ marginTop: '6px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', color: '#ef4444' }}>
                  Passwörter stimmen nicht überein.
                </div>
              )}
              {formData.passwordConfirm && formData.password === formData.passwordConfirm && (
                <div style={{ marginTop: '6px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', color: '#22c55e' }}>
                  ✓ Passwörter stimmen überein.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isStrong || emailTaken}
              className="zh-btn"
              style={{ justifyContent: 'center', gap: '8px', marginTop: '8px', opacity: (loading || !isStrong) ? 0.5 : 1 }}
            >
              {loading ? 'Wird registriert…' : <><span>Jetzt mitmachen</span><FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '13px' }} /></>}
            </button>
          </form>

          <p style={{ marginTop: '24px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', textAlign: 'center' }}>
            Bereits registriert?{' '}
            <Link href="/auth/login" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
