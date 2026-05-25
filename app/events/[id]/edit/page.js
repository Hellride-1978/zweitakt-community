'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import DesktopLayout from '@/components/DesktopLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false })

export default function EditEventPage({ params }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [eventId, setEventId] = useState(null)
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

  useEffect(() => {
    params.then?.((p) => setEventId(p.id)) || setEventId(params.id)
  }, [params])

  useEffect(() => {
    if (!eventId || !user) return
    supabase.from('rides').select('*').eq('id', eventId).eq('creator_id', user.id).single()
      .then(({ data, error: fetchError }) => {
        if (fetchError || !data) { setError('Termin nicht gefunden oder keine Berechtigung.'); return }
        const d = new Date(data.start_date)
        setForm({
          title: data.title || '',
          description: data.description || '',
          location: data.location || '',
          start_date: d.toISOString().split('T')[0],
          start_time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
          max_participants: data.max_participants?.toString() || '',
        })
        if (data.location_lat) setLat(data.location_lat)
        if (data.location_lng) setLng(data.location_lng)
      })
  }, [eventId, user])

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
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        start_date: startDatetime,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        location_lat: lat ?? null,
        location_lng: lng ?? null,
      }

      const { error: updateError } = await supabase.from('rides')
        .update(payload)
        .eq('id', eventId)
        .eq('creator_id', user.id)

      if (updateError) {
        if (updateError.message?.includes('location_lat') || updateError.message?.includes('location_lng')) {
          throw new Error('Die Spalten location_lat / location_lng fehlen in der rides-Tabelle. Bitte in Supabase ausführen:\nALTER TABLE rides ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;\nALTER TABLE rides ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;')
        }
        throw updateError
      }
      router.push(`/events/${eventId}`)
    } catch (err) {
      setError(err?.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <DesktopLayout crumb="Event bearbeiten">
      <div className="zh-page" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Authentifiziere…
      </div>
    </DesktopLayout>
  )
  if (!user) return (
    <DesktopLayout crumb="Event bearbeiten">
      <div className="zh-page"><div className="zh-page-inner-sm"><div className="zh-card">Bitte zuerst <a href="/auth/login" style={{ color: 'var(--accent)' }}>anmelden</a>.</div></div></div>
    </DesktopLayout>
  )

  return (
    <DesktopLayout crumb="Event bearbeiten">
    <div className="zh-page">
      <div className="zh-page-inner" style={{ maxWidth: '720px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)' }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>EVENT</span>
            Ausfahrten &amp; Treffen
          </div>
          <h1 className="zh-page-title">Termin <em>bearbeiten.</em></h1>
        </div>

        {error && <div className="zh-error" role="alert" style={{ marginBottom: '24px' }}>{error}</div>}

        <div className="zh-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <label htmlFor="title" className="zh-label">Titel *</label>
              <input id="title" name="title" value={form.title} onChange={handleChange} className="zh-input" placeholder="z.B. Sonntagsausfahrt Vogelsberg…" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="start_date" className="zh-label">Datum *</label>
                <input id="start_date" name="start_date" type="date" value={form.start_date} onChange={handleChange} className="zh-input" />
              </div>
              <div>
                <label htmlFor="start_time" className="zh-label">Uhrzeit</label>
                <input id="start_time" name="start_time" type="time" value={form.start_time} onChange={handleChange} className="zh-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="location" className="zh-label">Treffpunkt (Name)</label>
                <input id="location" name="location" value={form.location} onChange={handleChange} className="zh-input" placeholder="z.B. Parkplatz am Bahnhof…" />
              </div>
              <div>
                <label htmlFor="max_participants" className="zh-label">Max. Teilnehmer</label>
                <input id="max_participants" name="max_participants" type="number" min="2" value={form.max_participants} onChange={handleChange} className="zh-input" placeholder="Unbegrenzt" />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="zh-label">Beschreibung</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} className="zh-input" rows={4} style={{ resize: 'vertical' }} placeholder="Route, Infos, was ihr mitbringen sollt…" />
            </div>

            <div>
              <label className="zh-label">Treffpunkt auf der Karte</label>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '10px' }}>
                Klick auf die Karte um den Pin zu setzen oder zu verschieben
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
                    <FontAwesomeIcon icon={faXmark} /> entfernen
                  </button>
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button type="submit" disabled={saving} className="zh-btn" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Speichert…' : <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Änderungen speichern <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} /></span>}
              </button>
              <button type="button" onClick={() => router.push(`/events/${eventId}`)} className="zh-btn zh-btn-outline">
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
