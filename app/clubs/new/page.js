'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import CropModal from '@/components/CropModal'
import DesktopLayout from '@/components/DesktopLayout'

const SLOT_COUNT = 4
const URL_KEYS = ['image_url', 'image_url_2', 'image_url_3', 'image_url_4']
const emptySlot = () => ({ file: null, previewUrl: null })

export default function NewClubPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ name: '', description: '', location: '', is_public: true })
  const [images, setImages] = useState(Array.from({ length: SLOT_COUNT }, emptySlot))
  const [cropSrc, setCropSrc] = useState(null)
  const [cropSlot, setCropSlot] = useState(null)
  const [saving, setSaving] = useState(false)
  const [picking, setPicking] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const openCrop = (rawFile, slotIndex) => {
    setCropSlot(slotIndex)
    setCropSrc(URL.createObjectURL(rawFile))
  }

  const handleCropConfirm = (blob) => {
    const croppedFile = new File([blob], 'club.jpg', { type: 'image/jpeg' })
    const newPreview = URL.createObjectURL(blob)
    setImages(prev => prev.map((img, i) => {
      if (i !== cropSlot) return img
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
      return { file: croppedFile, previewUrl: newPreview }
    }))
    URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCropSlot(null)
  }

  const handleCropCancel = () => {
    URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCropSlot(null)
  }

  const handlePickFile = async (slotIndex) => {
    if (picking !== null) return
    if (typeof window !== 'undefined' && window.showOpenFilePicker) {
      setPicking(slotIndex)
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{ description: 'Bilder', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'] } }],
          multiple: false,
        })
        openCrop(await handle.getFile(), slotIndex)
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err)
      } finally {
        setPicking(null)
      }
    } else {
      fileInputRef.current.dataset.slot = slotIndex
      fileInputRef.current?.click()
    }
  }

  const handleFileInputChange = (e) => {
    const slotIndex = parseInt(fileInputRef.current.dataset.slot ?? '0')
    if (e.target.files?.[0]) openCrop(e.target.files[0], slotIndex)
    e.target.value = ''
  }

  const handleRemoveImage = (slotIndex) => {
    setImages(prev => prev.map((img, i) => {
      if (i !== slotIndex) return img
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
      return emptySlot()
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name ist ein Pflichtfeld.'); return }
    setSaving(true)
    setError(null)
    try {
      const clubId = crypto.randomUUID()
      const urlUpdates = {}

      for (let i = 0; i < SLOT_COUNT; i++) {
        const img = images[i]
        if (img.file) {
          const filePath = `clubs/${user.id}/${clubId}_${i + 1}.jpg`
          const { error: uploadError } = await supabase.storage.from('clubs').upload(filePath, img.file, { upsert: true })
          if (uploadError) throw new Error(`Bild ${i + 1} Upload fehlgeschlagen: ${uploadError.message}`)
          const { data: pub } = supabase.storage.from('clubs').getPublicUrl(filePath)
          urlUpdates[URL_KEYS[i]] = pub?.publicUrl ? `${pub.publicUrl}?t=${Date.now()}` : null
        } else {
          urlUpdates[URL_KEYS[i]] = null
        }
      }

      const { data: club, error: insertError } = await supabase.from('clubs').insert({
        id: clubId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        is_public: form.is_public,
        created_by: user.id,
        ...urlUpdates,
      }).select().single()

      if (insertError) throw insertError

      await supabase.from('club_members').insert({
        club_id: club.id,
        user_id: user.id,
        role: 'admin',
      })

      router.push(`/clubs/${club.id}`)
    } catch (err) {
      setError(err?.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <DesktopLayout crumb="Club gründen">
      <div style={{ color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Authentifiziere…</div>
    </DesktopLayout>
  )
  if (!user) return (
    <DesktopLayout crumb="Club gründen">
      <div className="zd-card">Bitte zuerst <a href="/auth/login" style={{ color: 'var(--accent)' }}>anmelden</a>.</div>
    </DesktopLayout>
  )

  return (
    <DesktopLayout crumb="Club gründen">
    <div className="zh-page">
      <div className="zh-page-inner" style={{ maxWidth: '680px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)' }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>CLUBS</span>
            Gruppen & Crews
          </div>
          <h1 className="zh-page-title">Club <em>gründen.</em></h1>
        </div>

        {error && <div className="zh-error" role="alert" style={{ marginBottom: '24px' }}>{error}</div>}

        <div className="zh-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <label htmlFor="name" className="zh-label">Clubname *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className="zh-input" placeholder="z.B. Knatter Berlin, Puch Boys Graz…" />
            </div>

            <div>
              <label htmlFor="location" className="zh-label">Region / Heimatstadt</label>
              <input id="location" name="location" value={form.location} onChange={handleChange} className="zh-input" placeholder="z.B. Berlin Friedrichshain, Wien 10…" />
            </div>

            <div>
              <label htmlFor="description" className="zh-label">Beschreibung</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} className="zh-input" rows={4} style={{ resize: 'vertical' }} placeholder="Wer seid ihr, was fahrt ihr, was macht euren Club aus…" />
            </div>

            <div>
              <label className="zh-label">Fotos — bis zu 4 Bilder</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} style={{ display: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => handlePickFile(i)}
                    style={{
                      position: 'relative',
                      aspectRatio: '4/3',
                      border: `2px dashed ${img.previewUrl ? 'var(--ink)' : 'var(--hairline)'}`,
                      borderRadius: '12px',
                      background: 'color-mix(in oklab, var(--accent-3) 8%, var(--cream))',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {img.previewUrl ? (
                      <>
                        <img src={img.previewUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(i) }}
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'rgba(0,0,0,0.65)', border: 'none',
                            color: '#fff', fontSize: 12, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 2,
                          }}
                        >✕</button>
                        {i === 0 && (
                          <span style={{
                            position: 'absolute', bottom: 6, left: 6,
                            background: 'var(--ink)', color: 'var(--cream)',
                            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px',
                            textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4, zIndex: 2,
                          }}>Cover</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--hairline)', lineHeight: 1 }}>+</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                          {i === 0 ? 'Titelbild' : `Foto ${i + 1}`}
                        </span>
                      </>
                    )}
                    {picking === i && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#fff', letterSpacing: 2 }}>LÄDT…</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '8px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Klick auf ein Feld um ein Bild auszuwählen · ✕ zum Entfernen
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
                Club öffentlich sichtbar
              </span>
            </label>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button type="submit" disabled={saving} className="zh-btn" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Gründe…' : 'Club gründen →'}
              </button>
              <button type="button" onClick={() => router.push('/clubs')} className="zh-btn zh-btn-outline">
                Abbrechen
              </button>
            </div>

          </form>
        </div>
      </div>

      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          circularCrop={false}
        />
      )}
    </div>
    </DesktopLayout>
  )
}
