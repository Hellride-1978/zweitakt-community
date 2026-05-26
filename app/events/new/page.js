'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import DesktopLayout from '@/components/DesktopLayout'

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false })

export default function NewEventPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    start_time: '',
    max_participants: '',
  })
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleMapClick = (clickLat, clickLng) => {
    setLat(clickLat)
    setLng(clickLng)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Titel ist ein Pflichtfeld.'); return }
    if (!form.start_date) { setError('Datum ist ein Pflichtfeld.'); return }
    setSaving(true)
    setError(null)
    try {
      const startDatetime = form.start_time
        ? `${form.start_date}T${form.start_time}:00`
        : `${form.start_date}T00:00:00`

      const payload = {
        creator_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        start_date: startDatetime,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        location_lat: lat ?? null,
        location_lng: lng ?? null,
      }

      const { error: insertError } = await supabase.from('rides').insert(payload)
      if (insertError) {
        if (insertError.message?.includes('location_lat') || insertError.message?.includes('location_lng')) {
          throw new Error('Die Spalten location_lat / location_lng fehlen in der rides-Tabelle. Bitte in Supabase ausführen:\nALTER TABLE rides ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;\nALTER TABLE rides ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;')
        }
        throw insertError
      }
      router.push('/events')
    } catch (err) {
      setError(err?.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="zh-page" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
      Authentifiziere…
    </div>
  )
  if (!user) return (
    <div className="zh-page"><div className="zh-page-inner-sm"><div className="zh-card">Bitte zuerst <a href="/auth/login" style={{ color: 'var(--accent)' }}>anmelden</a>.</div></div></div>
  )

  return (
    <DesktopLayout crumb="Neue Ausfahrt">
    <div className="zh-page">
      <div className="zh-page-inner" style={{ maxWidth: '720px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>EVENT</span>
            Ausfahrten & Treffen
          </div>
          <h1 className="zh-page-title">Termin <em>erstellen.</em></h1>
        </div>

        {error && <div className="zh-error" role="alert" style={{ marginBottom: '24px' }}>{error}</div>}

        <div className="zh-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <label htmlFor="title" className="zh-label">Titel *</label>
              <input id="title" name="title" value={form.title} onChange={handleChange} className="zh-input" placeholder="z.B. Sonntagsausfahrt Vogelsberg, Simson-Treffen Erfurt…" />
            </div>

            <div className="form-row-2">
              <div>
                <label htmlFor="start_date" className="zh-label">Datum *</label>
                <input id="start_date" name="start_date" type="date" value={form.start_date} onChange={handleChange} className="zh-input" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label htmlFor="start_time" className="zh-label">Uhrzeit</label>
                <input id="start_time" name="start_time" type="time" value={form.start_time} onChange={handleChange} className="zh-input" />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label htmlFor="location" className="zh-label">Treffpunkt (Name)</label>
                <input id="location" name="location" value={form.location} onChange={handleChange} className="zh-input" placeholder="z.B. Parkplatz am Bahnhof, Marktplatz…" />
              </div>
              <div>
                <label htmlFor="max_participants" className="zh-label">Max. Teilnehmer</label>
                <input id="max_participants" name="max_participants" type="number" inputMode="numeric" min="2" value={form.max_participants} onChange={handleChange} className="zh-input" placeholder="Unbegrenzt" />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="zh-label">Beschreibung</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} className="zh-input" rows={4} style={{ resize: 'vertical' }} placeholder="Route, Infos, was ihr mitbringen sollt…" />
            </div>

            {/* Map */}
            <div>
              <label className="zh-label">Treffpunkt auf der Karte</label>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '10px' }}>
                Klick auf die Karte um den Pin zu setzen
              </p>
              <EventMap lat={lat} lng={lng} onMapClick={handleMapClick} markerLabel={form.location || 'Treffpunkt'} />
              {lat && lng && (
                <p style={{ marginTop: '8px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', color: '#45a36a', textTransform: 'uppercase' }}>
                  ✓ Pin gesetzt: {lat.toFixed(5)}, {lng.toFixed(5)}
                  <button
                    type="button"
                    onClick={() => { setLat(null); setLng(null) }}
                    style={{ marginLeft: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '11px' }}
                  >
                    ✕ entfernen
                  </button>
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button type="submit" disabled={saving} className="zh-btn" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Speichert…' : 'Termin veröffentlichen →'}
              </button>
              <button type="button" onClick={() => router.push('/events')} className="zh-btn zh-btn-outline">
                Abbrechen
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
    </DesktopLayout>
  )
}
