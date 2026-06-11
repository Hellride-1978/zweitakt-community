'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') ?? '/wm/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/wm/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Login fehlgeschlagen.')
        return
      }
      router.push(from)
      router.refresh()
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wm-auth-page">
      <div className="wm-auth-card zh-card">
        <div className="wm-auth-header">
          <div className="wm-auth-trophy">⚽</div>
          <h1 className="wm-auth-title">WM 2026 Tippspiel</h1>
          <p className="wm-auth-sub">Einloggen</p>
        </div>

        <form onSubmit={handleSubmit} className="wm-form">
          {error && <div className="zh-error">{error}</div>}

          <div className="wm-field">
            <label className="zh-label" htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              className="zh-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de"
              autoComplete="email"
              required
            />
          </div>

          <div className="wm-field">
            <label className="zh-label" htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              className="zh-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="zh-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Einloggen…' : 'Einloggen'}
          </button>
        </form>

        <p className="wm-auth-footer">
          Noch kein Konto?{' '}
          <Link href="/wm/register" className="wm-auth-link">Jetzt registrieren</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
