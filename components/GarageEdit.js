'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { SKILLS, skillBadgeStyle } from '@/lib/garage'
import { validateImageFile } from '@/lib/validateImage'

const PHOTO_SLOTS = [1, 2, 3, 4, 5]

export default function GarageEdit({ user, onSaved }) {
  const [description, setDescription] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [photos, setPhotos] = useState({}) // slot → URL
  const [uploading, setUploading] = useState(null) // slot number
  const [isNew, setIsNew] = useState(true) // false wenn schon eine Garage existiert
  const [garageId, setGarageId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const fileRefs = useRef({})

  // Bestehende Garage laden
  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      supabase.from('garage').select('*').eq('user_id', user.id).single(),
      supabase.from('garage_skills').select('skill').eq('user_id', user.id),
    ]).then(([{ data: g }, { data: skills }]) => {
      if (g) {
        setIsNew(false)
        setGarageId(g.id)
        setDescription(g.description || '')
        const loaded = {}
        PHOTO_SLOTS.forEach(n => { if (g[`photo_${n}`]) loaded[n] = g[`photo_${n}`] })
        setPhotos(loaded)
      }
      if (skills) setSelectedSkills(skills.map(s => s.skill))
    })
  }, [user?.id])

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const handlePhotoUpload = async (slot, file) => {
    if (!file) return
    const ve = validateImageFile(file)
    if (ve) { setError(ve); return }
    setUploading(slot)
    setError(null)
    try {
      const path = `garage/${user.id}/${slot}.jpg`
      const { error: upErr } = await supabase.storage
        .from('garage')
        .upload(path, file, { upsert: true, contentType: 'image/jpeg' })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('garage').getPublicUrl(path)
      setPhotos(prev => ({ ...prev, [slot]: `${publicUrl}?t=${Date.now()}` }))
    } catch (err) {
      setError(`Upload fehlgeschlagen: ${err.message}`)
    } finally {
      setUploading(null)
    }
  }

  const removePhoto = async (slot) => {
    try {
      await supabase.storage.from('garage').remove([`garage/${user.id}/${slot}.jpg`])
    } catch {}
    setPhotos(prev => { const n = { ...prev }; delete n[slot]; return n })
  }

  const handleDelete = async () => {
    setDeleting(true); setError(null)
    try {
      // Alle Fotos aus Storage löschen
      const paths = PHOTO_SLOTS.map(n => `${user.id}/${n}.jpg`)
      await supabase.storage.from('garage').remove(paths)
      // Skills löschen
      await supabase.from('garage_skills').delete().eq('user_id', user.id)
      // Garage-Eintrag löschen
      const { error: delErr } = await supabase.from('garage').delete().eq('user_id', user.id)
      if (delErr) throw delErr
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Fehler beim Löschen')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(null)
    try {
      const photoData = {}
      PHOTO_SLOTS.forEach(n => { photoData[`photo_${n}`] = photos[n] || null })

      const { error: garageErr } = await supabase.from('garage').upsert({
        user_id: user.id,
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
        ...photoData,
      }, { onConflict: 'user_id' })
      if (garageErr) throw garageErr

      // Skills: erst alle löschen, dann neu setzen
      await supabase.from('garage_skills').delete().eq('user_id', user.id)
      if (selectedSkills.length > 0) {
        const { error: skillErr } = await supabase.from('garage_skills').insert(
          selectedSkills.map(skill => ({ user_id: user.id, skill }))
        )
        if (skillErr) throw skillErr
      }

      // Mail nur beim ersten Anlegen
      if (isNew) {
        const { data: newGarage } = await supabase.from('garage').select('id').eq('user_id', user.id).single()
        if (newGarage?.id) setGarageId(newGarage.id)
        fetch('/api/notify-new-garage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerName:  user.user_metadata?.name || user.email,
            ownerEmail: user.email,
            skills:     selectedSkills,
            garageId:   newGarage?.id,
          }),
        }).catch(() => {})
        setIsNew(false)
      }

      setSuccess('Schrauberhalle gespeichert.')
      setTimeout(() => setSuccess(null), 4000)
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {error   && <div className="zh-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Skills */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 10 }}>
          Skills (Mehrfachauswahl)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SKILLS.map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              style={skillBadgeStyle(selectedSkills.includes(skill))}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Beschreibung */}
      <div style={{ marginBottom: 20 }}>
        <label className="zh-label">Was ich anbiete</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="zh-input"
          rows={4}
          placeholder="Welche Arbeiten kannst du erledigen? Welches Equipment hast du? Für wen bist du ansprechbar?"
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Fotos */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 10 }}>
          Fotos (max. 5)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {PHOTO_SLOTS.map(slot => (
            <div key={slot}>
              <input
                ref={el => { fileRefs.current[slot] = el }}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(slot, e.target.files[0]) }}
              />
              {photos[slot] ? (
                <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--ink)' }}>
                  <img src={photos[slot]} alt={`Foto ${slot}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removePhoto(slot)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(26,17,8,0.75)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >×</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRefs.current[slot]?.click()}
                  disabled={uploading === slot}
                  style={{ width: '100%', aspectRatio: '1', borderRadius: 10, border: '2px dashed var(--hairline)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--ink-muted)' }}
                >
                  {uploading === slot ? '…' : '+'}
                </button>
              )}
            </div>
          ))}
        </div>
        <p style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          JPG, PNG, WebP · max. 5 MB pro Foto
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || deleting}
          className="zh-btn"
          style={{ opacity: saving ? 0.6 : 1, background: success ? '#22c55e' : undefined, borderColor: success ? '#22c55e' : undefined }}
        >
          {saving ? 'Speichert…' : success ? '✓ Gespeichert!' : 'Schrauberhalle speichern →'}
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={saving || deleting}
            style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textDecoration: 'underline' }}
          >
            Schrauberhalle löschen
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 10, background: '#fee2e2', border: '1.5px solid #fca5a5' }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#b91c1c' }}>Wirklich löschen?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
            >
              {deleting ? '…' : 'Ja, löschen'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', background: 'none', color: '#b91c1c', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
