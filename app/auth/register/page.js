'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons'

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '', passwordConfirm: '', name: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOAuth = async (provider) => {
    setOauthLoading(provider)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setOauthLoading(null) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwörter stimmen nicht überein')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein')
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { name: formData.name } },
      })
      if (signUpError) throw signUpError
      alert('Registrierung erfolgreich! Bitte überprüfe deine E-Mail.')
      router.push('/auth/login')
    } catch (err) {
      setError(err.message || 'Registrierungsfehler')
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
          {error && (
            <div className="zh-error" role="alert" style={{ marginBottom: '20px' }}>{error}</div>
          )}

          {/* OAuth buttons */}
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
            <button
              onClick={() => handleOAuth('apple')}
              disabled={!!oauthLoading}
              className="zh-btn"
              style={{ justifyContent: 'center', gap: '10px', opacity: oauthLoading === 'apple' ? 0.6 : 1 }}
            >
              <FontAwesomeIcon icon={faApple} style={{ fontSize: '16px' }} />
              {oauthLoading === 'apple' ? 'Weiterleitung…' : 'Mit Apple registrieren'}
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
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="zh-input" placeholder="dein@email.com" />
            </div>

            <div>
              <label htmlFor="password" className="zh-label">Passwort</label>
              <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="zh-input" placeholder="••••••••" />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="zh-label">Passwort wiederholen</label>
              <input id="passwordConfirm" name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleChange} required className="zh-input" placeholder="••••••••" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="zh-btn"
              style={{ justifyContent: 'center', gap: '8px', marginTop: '8px', opacity: loading ? 0.6 : 1 }}
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
