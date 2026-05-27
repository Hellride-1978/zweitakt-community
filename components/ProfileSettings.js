'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CropModal from './CropModal'
import { validateImageFile } from '@/lib/validateImage'

// ─── Passwort-Regeln ─────────────────────────────────────────

const PW_RULES = [
  { label: 'Mindestens 8 Zeichen',       test: p => p.length >= 8 },
  { label: 'Groß- und Kleinbuchstaben',  test: p => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: 'Mindestens eine Zahl',       test: p => /\d/.test(p) },
  { label: 'Mindestens ein Sonderzeichen', test: p => /[^a-zA-Z0-9]/.test(p) },
]
const PW_STRENGTH_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']
const PW_STRENGTH_LABELS = ['Sehr schwach', 'Schwach', 'Mittel', 'Stark']

function pwStrength(p) { return PW_RULES.filter(r => r.test(p)).length }

// ─── Standard-Einstellungen ──────────────────────────────────

const DEFAULTS = {
  notify_replies: true,  notify_messages: true,
  notify_mentions: true, notify_newsletter: false,
  push_browser: false,   push_sounds: true,
  email_digest: 'daily',
  profile_visibility: 'members', who_can_message: 'members',
  show_online_status: true, show_activity: true,
  show_in_search: true,  share_usage_stats: false,
}

// ─── Hilfliche Sub-Komponenten ────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 100, padding: 0,
        background: checked ? 'var(--accent)' : 'var(--parchment)',
        border: '1.5px solid var(--ink)', cursor: 'pointer',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: 'var(--cream)', border: '1.5px solid var(--ink)',
        transition: 'left 0.2s', display: 'block',
      }} />
    </button>
  )
}

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
  const [vehicles, setVehicles] = useState([])
  const [removeStep, setRemoveStep] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: vs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('vehicles').select('id, make, model, year').eq('user_id', user.id),
      ])
      if (p) {
        setForm({ name: p.name || '', first_name: p.first_name || '', last_name: p.last_name || '', location: p.location || '', description: p.description || '' })
        setAvatarUrl(p.avatar_url || '')
      }
      setEmail(user.email || '')
      setVehicles(vs || [])
    }
    load()
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

  const handleRemove = async (id) => {
    const { error } = await supabase.from('vehicles').delete().eq('id', id).eq('user_id', user.id)
    if (!error) setVehicles(vs => vs.filter(v => v.id !== id))
    setRemoveStep(s => ({ ...s, [id]: 0 }))
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

      <div style={{ paddingTop: 14, paddingBottom: 20, borderBottom: '1px solid var(--hairline)' }}>
        <label htmlFor="ps-bio" className="zh-label">Bio</label>
        <textarea id="ps-bio" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="zh-input" rows={3} style={{ resize: 'vertical' }} />
      </div>

      {/* Maschinen */}
      <div style={{ paddingTop: 18, paddingBottom: 20, borderBottom: '1px solid var(--hairline)' }}>
        <label className="zh-label">Meine Maschinen</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {vehicles.map(v => {
            const label = [v.make, v.model, v.year].filter(Boolean).join(' ')
            const step = removeStep[v.id] ?? 0
            return step === 0 ? (
              <span key={v.id} className="zh-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {label}
                <button type="button" onClick={() => setRemoveStep(s => ({ ...s, [v.id]: 1 }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 15, lineHeight: 1, padding: '0 0 0 2px', opacity: 0.7 }} aria-label={`${label} entfernen`}>×</button>
              </span>
            ) : (
              <span key={v.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 100, border: '1.5px solid #ef4444', background: 'color-mix(in oklab, #ef4444 10%, var(--cream))' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#ef4444' }}>Löschen?</span>
                <button type="button" onClick={() => handleRemove(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Ja</button>
                <span style={{ color: '#ef4444', opacity: 0.4 }}>·</span>
                <button type="button" onClick={() => setRemoveStep(s => ({ ...s, [v.id]: 0 }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Nein</button>
              </span>
            )
          })}
          <Link href="/vehicles/new" className="zh-pill" style={{ background: 'transparent', color: 'var(--ink)', border: '1.5px dashed var(--hairline)', textDecoration: 'none' }}>
            + Bike hinzufügen
          </Link>
        </div>
      </div>

      <SaveRow saving={saving} />

      {cropSrc && (
        <CropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => { URL.revokeObjectURL(cropSrc); setCropSrc(null) }} aspect={1} circularCrop outputWidth={480} outputHeight={480} />
      )}
    </form>
  )
}

// ─── Tab 2: Benachrichtigungen ────────────────────────────────

function TabNotifications({ user }) {
  const [s, setS] = useState(DEFAULTS)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    supabase.from('user_settings').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setS(x => ({ ...x, ...data })); setLoaded(true) })
  }, [user])

  const set = (k, v) => setS(x => ({ ...x, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(null)
    const { error: err } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      notify_replies: s.notify_replies, notify_messages: s.notify_messages,
      notify_mentions: s.notify_mentions, notify_newsletter: s.notify_newsletter,
      push_browser: s.push_browser, push_sounds: s.push_sounds,
      email_digest: s.email_digest,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (err) setError(err.message)
    else { setSuccess('Benachrichtigungen gespeichert.'); setTimeout(() => setSuccess(null), 4000) }
  }

  if (!loaded) return <div style={{ padding: '24px 0', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Lade…</div>

  return (
    <form onSubmit={handleSave}>
      <SuccessMsg msg={success} />
      {error && <div className="zh-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      <SectionLabel>E-Mail</SectionLabel>
      <SettingRow label="Antworten auf Beiträge" description="Wenn jemand auf deinen Post antwortet">
        <Toggle checked={s.notify_replies} onChange={v => set('notify_replies', v)} />
      </SettingRow>
      <SettingRow label="Private Nachrichten" description="Neue Direktnachrichten">
        <Toggle checked={s.notify_messages} onChange={v => set('notify_messages', v)} />
      </SettingRow>
      <SettingRow label="Erwähnungen" description="Wenn jemand dich @erwähnt">
        <Toggle checked={s.notify_mentions} onChange={v => set('notify_mentions', v)} />
      </SettingRow>
      <SettingRow label="Newsletter" description="Updates aus der Community">
        <Toggle checked={s.notify_newsletter} onChange={v => set('notify_newsletter', v)} />
      </SettingRow>

      <SectionLabel>Push</SectionLabel>
      <SettingRow label="Browser-Benachrichtigungen" description="Benachrichtigungen im Browser">
        <Toggle checked={s.push_browser} onChange={v => set('push_browser', v)} />
      </SettingRow>
      <SettingRow label="Töne" description="Akustische Signale bei Ereignissen">
        <Toggle checked={s.push_sounds} onChange={v => set('push_sounds', v)} />
      </SettingRow>

      <SectionLabel>Zusammenfassung</SectionLabel>
      <SettingRow label="E-Mail-Zusammenfassung" description="Wie oft du eine Zusammenfassung erhältst">
        <select value={s.email_digest} onChange={e => set('email_digest', e.target.value)} className="zh-input" style={{ width: 'auto', padding: '8px 12px' }}>
          <option value="instant">Sofort</option>
          <option value="daily">Täglich</option>
          <option value="weekly">Wöchentlich</option>
          <option value="never">Nie</option>
        </select>
      </SettingRow>

      <SaveRow saving={saving} />
    </form>
  )
}

// ─── Tab 3: Datenschutz / Sichtbarkeit ────────────────────────

function TabPrivacy({ user }) {
  const [s, setS] = useState(DEFAULTS)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    supabase.from('user_settings').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setS(x => ({ ...x, ...data })); setLoaded(true) })
  }, [user])

  const set = (k, v) => setS(x => ({ ...x, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(null)
    const { error: err } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      profile_visibility: s.profile_visibility, who_can_message: s.who_can_message,
      show_online_status: s.show_online_status, show_activity: s.show_activity,
      show_in_search: s.show_in_search, share_usage_stats: s.share_usage_stats,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (err) setError(err.message)
    else { setSuccess('Datenschutzeinstellungen gespeichert.'); setTimeout(() => setSuccess(null), 4000) }
  }

  if (!loaded) return <div style={{ padding: '24px 0', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Lade…</div>

  const visOpts = [{ value: 'all', label: 'Alle' }, { value: 'members', label: 'Nur Mitglieder' }, { value: 'none', label: 'Niemand' }]

  return (
    <form onSubmit={handleSave}>
      <SuccessMsg msg={success} />
      {error && <div className="zh-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      <SectionLabel>Sichtbarkeit</SectionLabel>
      <SettingRow label="Profil sichtbar für" description="Wer dein Profil sehen kann">
        <select value={s.profile_visibility} onChange={e => set('profile_visibility', e.target.value)} className="zh-input" style={{ width: 'auto', padding: '8px 12px' }}>
          {visOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </SettingRow>
      <SettingRow label="Wer kann schreiben" description="Wer dir Nachrichten senden darf">
        <select value={s.who_can_message} onChange={e => set('who_can_message', e.target.value)} className="zh-input" style={{ width: 'auto', padding: '8px 12px' }}>
          {visOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </SettingRow>

      <SectionLabel>Aktivität</SectionLabel>
      <SettingRow label="Online-Status anzeigen" description="Andere sehen ob du aktiv bist">
        <Toggle checked={s.show_online_status} onChange={v => set('show_online_status', v)} />
      </SettingRow>
      <SettingRow label="Aktivitätsverlauf" description="Deine Aktivitäten sind für andere sichtbar">
        <Toggle checked={s.show_activity} onChange={v => set('show_activity', v)} />
      </SettingRow>
      <SettingRow label="In Suchergebnissen" description="Dein Profil erscheint in der Mitgliedersuche">
        <Toggle checked={s.show_in_search} onChange={v => set('show_in_search', v)} />
      </SettingRow>
      <SettingRow label="Nutzungsstatistiken teilen" description="Anonyme Daten zur Verbesserung der Plattform">
        <Toggle checked={s.share_usage_stats} onChange={v => set('share_usage_stats', v)} />
      </SettingRow>

      <SaveRow saving={saving} />
    </form>
  )
}

// ─── Tab 4: Passwort & Sicherheit ────────────────────────────

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

    // Aktuelles Passwort prüfen durch Re-Authentifizierung
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

      {/* Passwort ändern */}
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

      {/* 2FA */}
      <div style={{ borderTop: '1px solid var(--hairline)', marginTop: 28, paddingTop: 4 }}>
        <SectionLabel>Zwei-Faktor-Authentifizierung</SectionLabel>
        <SettingRow label="2FA aktivieren" description="Noch nicht verfügbar — kommt bald">
          <Toggle checked={false} onChange={() => {}} />
        </SettingRow>
      </div>

      {/* Sitzungen */}
      <div style={{ borderTop: '1px solid var(--hairline)', marginTop: 28, paddingTop: 4 }}>
        <SectionLabel>Aktive Sitzungen</SectionLabel>
        {session && (
          <div style={{ border: '1.5px solid var(--ink)', borderRadius: 14, padding: '14px 16px', marginTop: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px color-mix(in oklab, #22c55e 20%, transparent)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Aktuelle Sitzung</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 3 }}>
                  {user.email}
                </div>
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
  { id: 'profile',       label: 'Profildaten' },
  { id: 'notifications', label: 'Benachrichtigungen' },
  { id: 'privacy',       label: 'Datenschutz' },
  { id: 'security',      label: 'Sicherheit' },
]

export default function ProfileSettings({ profileId }) {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  if (loading || !user || user.id !== profileId) return null

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
        {/* Tab-Navigation */}
        <div className="tab-pills" style={{ marginBottom: 24, flexWrap: 'wrap', display: 'inline-flex' }}>
          {TABS.map(t => (
            <button key={t.id} type="button" className={`tab-pill${activeTab === t.id ? ' on' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab-Inhalt */}
        <div className="zh-card">
          {activeTab === 'profile'       && <TabProfile       user={user} />}
          {activeTab === 'notifications' && <TabNotifications user={user} />}
          {activeTab === 'privacy'       && <TabPrivacy       user={user} />}
          {activeTab === 'security'      && <TabSecurity      user={user} />}
        </div>
      </div>
    </div>
  )
}
