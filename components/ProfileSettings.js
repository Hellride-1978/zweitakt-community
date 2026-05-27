'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import CropModal from './CropModal'
import { validateImageFile } from '@/lib/validateImage'

// ─── Passwort-Regeln ─────────────────────────────────────────

const PW_RULES = [
  { label: 'Mindestens 8 Zeichen',          test: p => p.length >= 8 },
  { label: 'Groß- und Kleinbuchstaben',     test: p => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: 'Mindestens eine Zahl',          test: p => /\d/.test(p) },
  { label: 'Mindestens ein Sonderzeichen',  test: p => /[^a-zA-Z0-9]/.test(p) },
]
const PW_STRENGTH_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']
const PW_STRENGTH_LABELS = ['Sehr schwach', 'Schwach', 'Mittel', 'Stark']

function pwStrength(p) { return PW_RULES.filter(r => r.test(p)).length }

// ─── Hilfliche Sub-Komponenten ────────────────────────────────

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, padding: '14px 0', borderBottom: '1px solid var(--hairline)',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 3 }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 24, marginBottom: 2 }}>
      {children}
    </div>
  )
}

function SuccessMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background: 'color-mix(in oklab, #22c55e 12%, var(--cream))', border: '1.5px solid #22c55e', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#166534', marginBottom: 16 }}>
      {msg}
    </div>
  )
}

function SaveRow({ saving, label = 'Speichern →' }) {
  return (
    <div style={{ paddingTop: 20 }}>
      <button type="submit" disabled={saving} className="zh-btn" style={{ opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Speichert…' : label}
      </button>
    </div>
  )
}

// ─── Tab 1: Profildaten ──────────────────────────────────────

function TabProfile({ user }) {
  const [form, setForm] = useState({ name: '', first_name: '', last_name: '', location: '', description: '' })
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [cropSrc, setCropSrc] = useState(null)
  const [picking, setPicking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data: p }) => {
        if (p) {
          setForm({ name: p.name || '', first_name: p.first_name || '', last_name: p.last_name || '', location: p.location || '', description: p.description || '' })
          setAvatarUrl(p.avatar_url || '')
        }
        setEmail(user.email || '')
      })
  }, [user])

  const openCrop = (rawFile) => { setCropSrc(URL.createObjectURL(rawFile)) }

  const handleCropConfirm = (blob) => {
    const f = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(blob))
    URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  const handlePickFile = async () => {
    if (picking) return
    if (typeof window !== 'undefined' && window.showOpenFilePicker) {
      setPicking(true)
      try {
        const [fh] = await window.showOpenFilePicker({ types: [{ description: 'Bilder', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'] } }], multiple: false })
        openCrop(await fh.getFile())
      } catch (err) { if (err.name !== 'AbortError') console.error(err) }
      finally { setPicking(false) }
    } else { fileRef.current?.click() }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Benutzername darf nicht leer sein.'); return }
    setSaving(true); setError(null); setSuccess(null)
    try {
      let url = avatarUrl
      if (file) {
        const ve = validateImageFile(file)
        if (ve) { setError(ve); setSaving(false); return }
        const path = `avatars/${user.id}.jpg`
        const { error: ue } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: 'image/jpeg' })
        if (ue) throw ue
        const { data: pd } = supabase.storage.from('avatars').getPublicUrl(path)
        url = pd?.publicUrl ? `${pd.publicUrl}?t=${Date.now()}` : url
      }
      const { error: pe } = await supabase.from('profiles').upsert({ id: user.id, name: form.name, first_name: form.first_name || null, last_name: form.last_name || null, location: form.location || null, description: form.description || null, avatar_url: url || null })
      if (pe) throw pe
      setAvatarUrl(url)
      setFile(null); setPreviewUrl(null)
      setSuccess('Profildaten gespeichert.')
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) { setError(err?.message || 'Fehler beim Speichern') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <SuccessMsg msg={success} />
      {error && <div className="zh-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 20, borderBottom: '1px solid var(--hairline)', marginBottom: 4 }}>
        <div className="zh-avatar offline" style={{ width: 80, height: 80, fontSize: 28, flexShrink: 0, boxShadow: '3px 3px 0 var(--ink)' }}>
          {(previewUrl || avatarUrl)
            ? <img src={previewUrl || avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : (form.name || '?').charAt(0).toUpperCase()
          }
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) openCrop(e.target.files[0]) }} />
          <button type="button" onClick={handlePickFile} disabled={picking} className="zh-btn zh-btn-outline" style={{ fontSize: 13, padding: '8px 16px' }}>
            {picking ? 'Auswahl läuft…' : 'Bild ändern'}
          </button>
          {file && <div style={{ marginTop: 6, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', color: '#22c55e' }}>✓ {file.name}</div>}
        </div>
      </div>

      {/* Felder */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 18 }}>
        <div>
          <label htmlFor="ps-fn" className="zh-label">Vorname</label>
          <input id="ps-fn" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="zh-input" />
        </div>
        <div>
          <label htmlFor="ps-ln" className="zh-label">Nachname</label>
          <input id="ps-ln" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="zh-input" />
        </div>
      </div>

      <div style={{ paddingTop: 14 }}>
        <label htmlFor="ps-name" className="zh-label">Benutzername</label>
        <input id="ps-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="zh-input" required />
      </div>

      <div style={{ paddingTop: 14 }}>
        <label className="zh-label">E-Mail</label>
        <input value={email} disabled className="zh-input" style={{ opacity: 0.55, cursor: 'not-allowed' }} />
        <div style={{ marginTop: 5, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>E-Mail-Änderung über Supabase Auth</div>
      </div>

      <div style={{ paddingTop: 14 }}>
        <label htmlFor="ps-loc" className="zh-label">Wohnort</label>
        <input id="ps-loc" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="zh-input" placeholder="z.B. München, Wien…" />
      </div>

      <div style={{ paddingTop: 14 }}>
        <label htmlFor="ps-bio" className="zh-label">Bio</label>
        <textarea id="ps-bio" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="zh-input" rows={3} style={{ resize: 'vertical' }} />
      </div>

      <SaveRow saving={saving} />

      {cropSrc && (
        <CropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => { URL.revokeObjectURL(cropSrc); setCropSrc(null) }} aspect={1} circularCrop outputWidth={480} outputHeight={480} />
      )}
    </form>
  )
}

// ─── Tab 2: Passwort & Sicherheit ────────────────────────────

function TabSecurity({ user }) {
  const router = useRouter()
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [session, setSession] = useState(null)
  const [signOutStep, setSignOutStep] = useState(0)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session))
  }, [])

  const strength = pwStrength(pw.next)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pw.next !== pw.confirm) { setError('Passwörter stimmen nicht überein.'); return }
    if (strength < 2) { setError('Passwort ist zu schwach. Mindestens 2 Regeln erfüllen.'); return }
    setSaving(true); setError(null); setSuccess(null)
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pw.current })
    if (signInErr) { setSaving(false); setError('Aktuelles Passwort ist falsch.'); return }
    const { error: updateErr } = await supabase.auth.updateUser({ password: pw.next })
    setSaving(false)
    if (updateErr) setError(updateErr.message)
    else {
      setPw({ current: '', next: '', confirm: '' })
      setSuccess('Passwort erfolgreich geändert.')
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  const handleSignOutAll = async () => {
    setSigningOut(true)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/auth/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <SectionLabel>Passwort ändern</SectionLabel>
        <SuccessMsg msg={success} />
        {error && <div className="zh-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

        <div style={{ paddingTop: 10, paddingBottom: 14 }}>
          <label htmlFor="ps-pw-cur" className="zh-label">Aktuelles Passwort</label>
          <input id="ps-pw-cur" type="password" value={pw.current} onChange={e => setPw(f => ({ ...f, current: e.target.value }))} className="zh-input" required autoComplete="current-password" />
        </div>

        <div style={{ paddingBottom: 14 }}>
          <label htmlFor="ps-pw-new" className="zh-label">Neues Passwort</label>
          <input id="ps-pw-new" type="password" value={pw.next} onChange={e => setPw(f => ({ ...f, next: e.target.value }))} className="zh-input" required autoComplete="new-password" />
          {pw.next && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < strength ? PW_STRENGTH_COLORS[strength - 1] : 'var(--parchment)', transition: 'background 0.2s' }} />
                ))}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: strength > 0 ? PW_STRENGTH_COLORS[strength - 1] : 'var(--ink-muted)', marginBottom: 8 }}>
                {strength > 0 ? PW_STRENGTH_LABELS[strength - 1] : '—'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {PW_RULES.map((rule, i) => {
                  const ok = rule.test(pw.next)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: ok ? '#22c55e' : 'var(--ink-muted)' }}>
                      <span style={{ flexShrink: 0 }}>{ok ? '✓' : '○'}</span>
                      {rule.label}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ paddingBottom: 4 }}>
          <label htmlFor="ps-pw-cfm" className="zh-label">Passwort bestätigen</label>
          <input id="ps-pw-cfm" type="password" value={pw.confirm} onChange={e => setPw(f => ({ ...f, confirm: e.target.value }))} className="zh-input" required autoComplete="new-password" />
          {pw.confirm && pw.next !== pw.confirm && (
            <div style={{ marginTop: 5, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#ef4444' }}>Passwörter stimmen nicht überein</div>
          )}
        </div>

        <SaveRow saving={saving} label="Passwort ändern →" />
      </form>

      <div style={{ borderTop: '1px solid var(--hairline)', marginTop: 28, paddingTop: 4 }}>
        <SectionLabel>Aktive Sitzungen</SectionLabel>
        {session && (
          <div style={{ border: '1.5px solid var(--ink)', borderRadius: 14, padding: '14px 16px', marginTop: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px color-mix(in oklab, #22c55e 20%, transparent)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Aktuelle Sitzung</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 3 }}>{user.email}</div>
              </div>
            </div>
          </div>
        )}
        {signOutStep === 0 ? (
          <button type="button" onClick={() => setSignOutStep(1)} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#ef4444', background: 'none', border: '1.5px solid #ef4444', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>
            Alle Sitzungen beenden
          </button>
        ) : (
          <div style={{ background: 'color-mix(in oklab, #ef4444 8%, var(--cream))', border: '1.5px solid #ef4444', borderRadius: 14, padding: '16px' }}>
            <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.5 }}>
              <strong>Wirklich alle Sitzungen beenden?</strong> Du wirst auf allen Geräten abgemeldet.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={handleSignOutAll} disabled={signingOut} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', background: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', opacity: signingOut ? 0.6 : 1 }}>
                {signingOut ? '…' : 'Ja, abmelden'}
              </button>
              <button type="button" onClick={() => setSignOutStep(0)} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink)', background: 'none', border: '1.5px solid var(--hairline)', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Haupt-Export ─────────────────────────────────────────────

const TABS = [
  { id: 'profile',  label: 'Profildaten' },
  { id: 'security', label: 'Sicherheit' },
]

export default function ProfileSettings({ profileId }) {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')

  const isOpen = searchParams.get('settings') === '1'

  if (loading || !user || user.id !== profileId || !isOpen) return null

  return (
    <div style={{ marginTop: 48, borderTop: '2px solid var(--ink)', paddingTop: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
          Einstellungen
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 0.92, letterSpacing: 0.3, color: 'var(--ink)', margin: 0 }}>
          Dein Account.
        </h2>
      </div>

      <div style={{ maxWidth: 560 }}>
        <div className="tab-pills" style={{ marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} type="button" className={`tab-pill${activeTab === t.id ? ' on' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="zh-card">
          {activeTab === 'profile'  && <TabProfile  user={user} />}
          {activeTab === 'security' && <TabSecurity user={user} />}
        </div>
      </div>
    </div>
  )
}
