'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [userType, setUserType] = useState('person')
  const [formData, setFormData] = useState({ email: '', password: '', passwordConfirm: '', name: '', description: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      const { data, error: signUpError } = await supabase.auth.signUp({ email: formData.email, password: formData.password })
      if (signUpError) throw signUpError

      const userId = data?.user?.id || data?.session?.user?.id
      if (userId) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          name: formData.name,
          description: formData.description,
          user_type: userType,
          created_at: new Date(),
        })
        if (insertError) throw insertError
        alert('Registrierung erfolgreich! Bitte überprüfe deine E-Mail.')
      } else {
        alert('Registrierung erfolgreich! Bitte bestätige deine E-Mail.')
      }
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

          <div style={{ marginBottom: '24px' }}>
            <span className="zh-label" style={{ display: 'block', marginBottom: '10px' }}>Ich bin</span>
            <div className="zh-radio-group">
              <label className="zh-radio-label">
                <input type="radio" name="userType" value="person" checked={userType === 'person'} onChange={(e) => setUserType(e.target.value)} />
                Einzelperson
              </label>
              <label className="zh-radio-label">
                <input type="radio" name="userType" value="club" checked={userType === 'club'} onChange={(e) => setUserType(e.target.value)} />
                Klub
              </label>
            </div>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="name" className="zh-label">{userType === 'person' ? 'Dein Name' : 'Klub-Name'}</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="zh-input" placeholder="z.B. Max Müller" />
            </div>

            <div>
              <label htmlFor="description" className="zh-label">Kurze Beschreibung</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="zh-input" style={{ resize: 'vertical' }} placeholder="z.B. Leidenschaftlicher Zweitakt-Fan…" />
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
              style={{ justifyContent: 'center', marginTop: '8px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Wird registriert…' : 'Jetzt mitmachen →'}
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
