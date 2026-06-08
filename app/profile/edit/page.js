'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import CropModal from '@/components/CropModal'
import DesktopLayout from '@/components/DesktopLayout'
import { validateImageFile } from '@/lib/validateImage'
import FormError from '@/components/FormError'
import { resolvePostalCode } from '@/lib/geocoding'

export default function EditProfilePage() {
  return (
    <Suspense>
      <EditProfilePageInner />
    </Suspense>
  )
}

function EditProfilePageInner() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({ name: '', description: '', avatar_url: '', location: '', plz: '', land: 'DE' })
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [cropSrc, setCropSrc] = useState(null)
  const [saving, setSaving] = useState(false)
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState(null)
  const [plzStatus, setPlzStatus] = useState(null) // 'loading' | 'found' | 'notfound'
  const plzDebounceRef = useRef(null)
  const [deleteStep, setDeleteStep] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id)
      if (error) { setError(error.message); return }
      const profile = Array.isArray(data) ? data[0] : data
      if (profile) setForm({ name: profile.name || '', description: profile.description || '', avatar_url: profile.avatar_url || '', location: profile.location || '', plz: profile.plz || '', land: 'DE' })
    }
    if (!loading) fetchProfile()
  }, [user, loading])

  // PLZ → Ort automatisch erkennen (debounced, direkt via OpenPLZ API)
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const openCrop = (rawFile) => {
    if (rawFile.size > 5 * 1024 * 1024) { setError('Bild zu groß — maximal 5 MB erlaubt.'); return }
    const url = URL.createObjectURL(rawFile)
    setCropSrc(url)
  }

  const handleCropConfirm = (blob) => {
    const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    setFile(croppedFile)
    URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result)
    reader.readAsDataURL(blob)
  }

  const handleCropCancel = () => {
    URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  const handlePickFile = async () => {
    if (picking) return
    if (typeof window !== 'undefined' && window.showOpenFilePicker) {
      setPicking(true)
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [{ description: 'Bilder', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif'] } }],
          multiple: false,
        })
        const picked = await fileHandle.getFile()
        openCrop(picked)
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Dateiauswahl Fehler:', err)
      } finally {
        setPicking(false)
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (e.dataTransfer.files?.[0]) openCrop(e.dataTransfer.files[0])
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let avatarUrl = form.avatar_url
      if (file && user) {
        const validationError = validateImageFile(file)
        if (validationError) { setError(validationError); setSaving(false); return }
        const filePath = `avatars/${user.id}.jpg`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true, contentType: 'image/jpeg' })
        if (uploadError) {
          setError(`Upload fehlgeschlagen: ${uploadError.message}`)
          setSaving(false)
          return
        }
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath)
        avatarUrl = publicData?.publicUrl ? `${publicData.publicUrl}?t=${Date.now()}` : avatarUrl
      }
      // PLZ → Koordinaten auflösen (im Hintergrund, kein Pflichtfeld)
      let lat = null
      let lng = null
      if (form.plz.trim()) {
        const coords = await resolvePostalCode(form.plz.trim(), form.land)
        if (coords) { lat = coords.lat; lng = coords.lng }
      }

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: user.id,
        name: form.name,
        description: form.description,
        avatar_url: avatarUrl,
        location: form.location || null,
        plz: form.plz.trim() || null,
        lat,
        lng,
      })
      if (upsertError) throw upsertError
      router.push(`/profile/${user.id}`)
    } catch (err) {
      setError(err?.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
      setDeleteStep(0)
    }
  }

  if (loading) return <div className="zh-page" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Authentifiziere…</div>
  if (!user) return (
    <div className="zh-page">
      <div className="zh-card zh-page-inner-sm">Bitte zuerst anmelden.</div>
    </div>
  )

  return (
    <DesktopLayout crumb="Profil bearbeiten">
    <div className="zh-page">
      <div className="zh-page-inner" style={{ maxWidth: '680px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>PROFIL</span>
            Deine Daten
          </div>
          <h1 className="zd-h1">Profil bearbeiten.</h1>
        </div>

        {isWelcome && (
          <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'color-mix(in oklab, var(--accent) 12%, var(--cream))', border: '1.5px solid var(--accent)', borderRadius: '14px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-accessible)', marginBottom: 6 }}>Willkommen in der Crew</div>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
              Stell dich kurz vor — ein Name und optional ein Profilbild reichen schon.
            </p>
          </div>
        )}
        <FormError message={error} />

        <div className="zh-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <label htmlFor="name" className="zh-label">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className="zh-input" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
              <div>
                <label htmlFor="plz" className="zh-label">Postleitzahl</label>
                <input
                  id="plz"
                  name="plz"
                  value={form.plz}
                  onChange={handleChange}
                  className="zh-input"
                  placeholder="z.B. 10115"
                  maxLength={10}
                />
              </div>
              <div>
                <label htmlFor="land" className="zh-label">Land</label>
                <select
                  id="land"
                  name="land"
                  value={form.land}
                  onChange={handleChange}
                  className="zh-input"
                  style={{ height: 'auto', cursor: 'pointer' }}
                >
                  <option value="DE">🇩🇪 DE</option>
                  <option value="AT">🇦🇹 AT</option>
                  <option value="CH">🇨🇭 CH</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="zh-label">
                Region / Ort
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginLeft: 8 }}>
                  {plzStatus === 'loading'  && 'wird erkannt…'}
                  {plzStatus === 'found'    && '✓ automatisch erkannt'}
                  {plzStatus === 'notfound' && 'PLZ nicht gefunden'}
                </span>
              </label>
              <input
                id="location"
                name="location"
                value={form.location}
                readOnly
                className="zh-input"
                placeholder="wird aus PLZ befüllt"
                style={{ cursor: 'default', opacity: form.location ? 1 : 0.5 }}
              />
            </div>

            <div>
              <label htmlFor="description" className="zh-label">Beschreibung</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} className="zh-input" style={{ resize: 'vertical' }} rows={4} />
            </div>

            <div>
              <label className="zh-label">Profilbild (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => { if (e.target.files?.[0]) openCrop(e.target.files[0]) }}
                style={{ display: 'none' }}
              />
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ padding: '24px', border: '2px dashed var(--hairline)', borderRadius: '14px', background: 'color-mix(in oklab, var(--accent-3) 8%, var(--cream))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}
              >
                {(previewUrl || (form.avatar_url && !file)) && (
                  <img src={previewUrl || form.avatar_url} alt="Profilbild Vorschau" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--ink)' }} />
                )}
                <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  Bild hierher ziehen
                </p>
                <button
                  type="button"
                  onClick={handlePickFile}
                  disabled={picking}
                  className="zh-btn zh-btn-outline"
                  style={{ fontSize: '14px', padding: '10px 20px', opacity: picking ? 0.6 : 1 }}
                >
                  {picking ? 'Auswahl läuft…' : 'Datei auswählen'}
                </button>
              </div>
              <p style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                JPG, PNG, WebP · max. 5 MB
              </p>
              {file && (
                <p style={{ marginTop: '10px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', color: '#45a36a' }}>
                  ✓ {file.name}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button type="submit" disabled={saving} className="zh-btn" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Speichert…' : 'Speichern →'}
              </button>
              <button type="button" onClick={() => router.push(`/profile/${user.id}`)} className="zh-btn zh-btn-outline">
                Abbrechen
              </button>
            </div>

          </form>
        </div>
      </div>
      {/* ── Account löschen ── */}
      <div style={{ maxWidth: 680, margin: '40px auto 0', paddingTop: 32, borderTop: '1px solid var(--hairline)', paddingLeft: 'var(--gutter)', paddingRight: 'var(--gutter)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 12 }}>
          Gefahrenzone
        </div>
        {deleteStep === 0 && (
          <button
            type="button"
            onClick={() => setDeleteStep(1)}
            style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#ef4444', background: 'none', border: '1.5px solid #ef4444', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}
          >
            Account löschen
          </button>
        )}
        {deleteStep === 1 && (
          <div style={{ background: 'color-mix(in oklab, #ef4444 8%, var(--cream))', border: '1.5px solid #ef4444', borderRadius: 14, padding: '20px' }}>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', marginBottom: 16, lineHeight: 1.5 }}>
              <strong>Wirklich löschen?</strong> Dein Profil, alle Fahrzeuge und Termine-Teilnahmen werden unwiderruflich gelöscht.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', background: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? 'Wird gelöscht…' : 'Ja, Account löschen'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteStep(0)}
                style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink)', background: 'none', border: '1.5px solid var(--hairline)', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {cropSrc && (
        <CropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}
    </div>
    </DesktopLayout>
  )
}
