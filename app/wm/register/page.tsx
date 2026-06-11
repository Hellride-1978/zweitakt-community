'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', username: '', password: '', passwordConfirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/wm/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Registrierung fehlgeschlagen.')
        return
      }
      router.push('/wm/dashboard')
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
          <p className="wm-auth-sub">Konto erstellen</p>
        </div>

        <form onSubmit={handleSubmit} className="wm-form">
          {error && <div className="zh-error">{error}</div>}

          <div className="wm-field">
            <label className="zh-label" htmlFor="username">Benutzername</label>
            <input
              id="username"
              type="text"
              className="zh-input"
              value={form.username}
              onChange={e => update('username', e.target.value)}
              placeholder="dein_name"
              autoComplete="username"
              required
            />
          </div>

          <div className="wm-field">
            <label className="zh-label" htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              className="zh-input"
              value={form.email}
              onChange={e => update('email', e.target.value)}
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
              value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder="Min. 6 Zeichen"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="wm-field">
            <label className="zh-label" htmlFor="passwordConfirm">Passwort bestätigen</label>
            <input
              id="passwordConfirm"
              type="password"
              className="zh-input"
              value={form.passwordConfirm}
              onChange={e => update('passwordConfirm', e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="zh-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Registrieren…' : 'Konto erstellen'}
          </button>
        </form>

        <div className="wm-entry-note">
          <span>💶</span>
          <span>2€ Einsatz — bezahl Martin persönlich</span>
        </div>

        <p className="wm-auth-footer">
          Schon ein Konto?{' '}
          <Link href="/wm/login" className="wm-auth-link">Einloggen</Link>
        </p>
      </div>
    </div>
  )
}
