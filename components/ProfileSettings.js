'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import CropModal from './CropModal'
import { validateImageFile } from '@/lib/validateImage'
import { resolvePostalCode } from '@/lib/geocoding'

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


function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 24, marginBottom: 2 }}>
      {children}
    </div>
  )
}


function SaveRow({ saving, success, label = 'Speichern →' }) {
  return (
    <div style={{ paddingTop: 20 }}>
      <button
        type="submit"
        disabled={saving || !!success}
        className="zh-btn"
        style={{
          opacity: saving ? 0.6 : 1,
          background: success ? '#22c55e' : undefined,
          borderColor: success ? '#22c55e' : undefined,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        {saving ? 'Speichert…' : success ? '✓ Gespeichert!' : label}
      </button>
    </div>
  )
}

// ─── Tab 1: Profildaten ──────────────────────────────────────

function TabProfile({ user }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', first_name: '', last_name: '', location: '', description: '', plz: '', land: 'DE' })
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [cropSrc, setCropSrc] = useState(null)
  const [picking, setPicking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [plzStatus, setPlzStatus] = useState(null) // 'loading' | 'found' | 'notfound'
  const fileRef = useRef(null)
  const plzDebounceRef = useRef(null)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data: p }) => {
        if (p) {
          setForm({ name: p.name || '', first_name: p.first_name || '', last_name: p.last_name || '', location: p.location || '', description: p.description || '', plz: p.plz || '', land: 'DE' })
          setAvatarUrl(p.avatar_url || '')
        }
        setEmail(user.email || '')
      })
  }, [user])

  // PLZ → Wohnort automatisch erkennen (debounced)
  useEffect(() => {
    const plz = form.plz.trim()
    const minLen = form.land === 'DE' ? 5 : 4
    if (plz.length < minLen) { setPlzStatus(null); return }

    clearTimeout(plzDebounceRef.current)
    setPlzStatus('loading')

    plzDebounceRef.current = setTimeout(async () => {
      try {
        const countryPath = form.land.toLowerCase()
        const res = await fetch(
          `https://openplzapi.org/${countryPath}/Localities?postalCode=${encodeURIComponent(plz)}`,
          { headers: { Accept: 'application/json' } }
        )
        if (!res.ok) { setPlzStatus('notfound'); return }
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) { setPlzStatus('notfound'); return }
        const ort = data[0].name
        if (ort) {
          setForm(f => ({ ...f, location: ort }))
          setPlzStatus('found')
        } else {
          setPlzStatus('notfound')
        }
      } catch {
        setPlzStatus('notfound')
      }
    }, 450)

    return () => clearTimeout(plzDebounceRef.current)
  }, [form.plz, form.land])

  const openCrop = (rawFile) => {
    if (rawFile.size > 5 * 1024 * 1024) { setError('Bild zu groß — maximal 5 MB erlaubt.'); return }
    setCropSrc(URL.createObjectURL(rawFile))
  }

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
      // PLZ → Koordinaten für Umkreissuche
      let lat = null; let lng = null
      if (form.plz.trim()) {
        const coords = await resolvePostalCode(form.plz.trim(), form.land)
        if (coords) { lat = coords.lat; lng = coords.lng }
      }

      const { error: pe } = await supabase.from('profiles').upsert({
        id: user.id, name: form.name,
        first_name: form.first_name || null, last_name: form.last_name || null,
        location: form.location || null, description: form.description || null,
        avatar_url: url || null,
        plz: form.plz.trim() || null, lat, lng,
      })
      if (pe) throw pe
      setAvatarUrl(url)
      setFile(null); setPreviewUrl(null)
      setSuccess('Profildaten gespeichert.')
      setTimeout(() => setSuccess(null), 4000)
      router.refresh()
    } catch (err) { setError(err?.message || 'Fehler beim Speichern') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
          <div style={{ marginTop: 5, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            JPG, PNG, WebP · max. 5 MB
          </div>
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
      </div>

      <div style={{ paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '8px 12px', background: 'color-mix(in oklab, var(--accent) 10%, var(--cream))', border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)', borderRadius: 10 }}>
          <span style={{ fontSize: 15 }}>📍</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            Mit deiner PLZ erscheinst du auf der Schrauber-Karte und kannst Leute in deiner Nähe finden.
          </span>
        </div>
      </div>

      <div style={{ paddingTop: 6, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
        <div>
          <label htmlFor="ps-plz" className="zh-label">Postleitzahl</label>
          <input
            id="ps-plz"
            value={form.plz}
            onChange={e => setForm(f => ({ ...f, plz: e.target.value }))}
            className={`zh-input${!form.plz ? ' zh-input-highlight' : ''}`}
            placeholder="z.B. 10115"
            maxLength={10}
          />
        </div>
        <div>
          <label htmlFor="ps-land" className="zh-label">Land</label>
          <select
            id="ps-land"
            value={form.land}
            onChange={e => setForm(f => ({ ...f, land: e.target.value }))}
            className="zh-input"
            style={{ height: 'auto', cursor: 'pointer' }}
          >
            <option value="DE">🇩🇪 DE</option>
            <option value="AT">🇦🇹 AT</option>
            <option value="CH">🇨🇭 CH</option>
          </select>
        </div>
      </div>

      <div style={{ paddingTop: 14 }}>
        <label htmlFor="ps-loc" className="zh-label">
          Wohnort
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginLeft: 8 }}>
            {plzStatus === 'loading' && 'wird erkannt…'}
            {plzStatus === 'found'   && '✓ automatisch erkannt'}
            {plzStatus === 'notfound' && 'PLZ nicht gefunden'}
          </span>
        </label>
        <input
          id="ps-loc"
          value={form.location}
          readOnly
          className="zh-input"
          placeholder="wird aus PLZ befüllt"
          style={{ cursor: 'default', opacity: form.location ? 1 : 0.5 }}
        />
      </div>

      <div style={{ paddingTop: 14 }}>
        <label htmlFor="ps-bio" className="zh-label">Bio</label>
        <textarea id="ps-bio" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="zh-input" rows={3} style={{ resize: 'vertical' }} />
      </div>

      <SaveRow saving={saving} success={success} />

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
  const [deleteStep, setDeleteStep] = useState(0)
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      if (res.ok) {
        await supabase.auth.signOut()
        router.push('/')
      } else {
        const { error } = await res.json()
        setError(error || 'Fehler beim Löschen des Accounts.')
        setDeleting(false)
        setDeleteStep(0)
      }
    } catch (err) {
      setError(err.message || 'Fehler beim Löschen')
      setDeleting(false)
      setDeleteStep(0)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <SectionLabel>Passwort ändern</SectionLabel>
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

        <SaveRow saving={saving} success={success} label="Passwort ändern →" />
      </form>

      <div style={{ borderTop: '1px solid var(--hairline)', marginTop: 28, paddingTop: 4 }}>
        <SectionLabel>Account löschen</SectionLabel>
        {deleteStep === 0 ? (
          <div style={{ paddingTop: 12 }}>
            <button type="button" onClick={() => setDeleteStep(1)} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#ef4444', background: 'none', border: '1.5px solid #ef4444', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>
              Account löschen
            </button>
          </div>
        ) : (
          <div style={{ background: 'color-mix(in oklab, #ef4444 8%, var(--cream))', border: '1.5px solid #ef4444', borderRadius: 14, padding: '16px', marginTop: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.5 }}>
              <strong>Wirklich löschen?</strong> Dein Profil, alle Bikes und Daten werden unwiderruflich entfernt.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={handleDeleteAccount} disabled={deleting} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', background: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}>
                {deleting ? '…' : 'Ja, löschen'}
              </button>
              <button type="button" onClick={() => setDeleteStep(0)} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink)', background: 'none', border: '1.5px solid var(--hairline)', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>
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

  const scrollRef = useCallback((node) => {
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (loading || !user || user.id !== profileId || !isOpen) return null

  return (
    <div ref={scrollRef} style={{ marginTop: 48, borderTop: '2px solid var(--ink)', paddingTop: 40 }}>
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
