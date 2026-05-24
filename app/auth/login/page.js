'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm">
        <div style={{ marginBottom: '32px' }}>
          <div className="zh-section-mark">
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>LOGIN</span>
            Zurück in die Garage
          </div>
          <h1 className="zh-page-title" style={{ marginTop: '16px' }}>Anmelden.</h1>
          <p className="zh-page-lead">Willkommen zurück, Schrauber.</p>
        </div>

        <div className="zh-card">
          {error && (
            <div className="zh-error" role="alert" style={{ marginBottom: '20px' }}>{error}</div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            <div>
              <label htmlFor="password" className="zh-label">Passwort</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="zh-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="zh-btn"
              style={{ justifyContent: 'center', marginTop: '8px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Wird angemeldet…' : 'Anmelden →'}
            </button>
          </form>

          <p style={{ marginTop: '24px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', textAlign: 'center' }}>
            Noch kein Konto?{' '}
            <Link href="/auth/register" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>
              Registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
