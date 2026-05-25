'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import CropModal from '@/components/CropModal'
import DesktopLayout from '@/components/DesktopLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const SLOT_COUNT = 4
const URL_KEYS = ['image_url', 'image_url_2', 'image_url_3', 'image_url_4']
const emptySlot = () => ({ file: null, previewUrl: null, dbUrl: '' })

export default function EditVehiclePage({ params }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [vehicleId, setVehicleId] = useState(null)
  const [form, setForm] = useState({ title: '', make: '', model: '', year: '', displacement_cc: '', description: '' })
  const [images, setImages] = useState(Array.from({ length: SLOT_COUNT }, emptySlot))
  const [cropSrc, setCropSrc] = useState(null)
  const [cropSlot, setCropSlot] = useState(null)
  const [saving, setSaving] = useState(false)
  const [picking, setPicking] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    params.then?.((p) => setVehicleId(p.id)) || setVehicleId(params.id)
  }, [params])

  useEffect(() => {
    if (!vehicleId || !user) return
    supabase.from('vehicles').select('*').eq('id', vehicleId).eq('user_id', user.id).single()
      .then(({ data, error }) => {
        if (error || !data) { setError('Fahrzeug nicht gefunden.'); return }
        setForm({
          title: data.title || '',
          make: data.make || '',
          model: data.model || '',
          year: data.year?.toString() || '',
          displacement_cc: data.displacement_cc?.toString() || '',
          description: data.description || '',
        })
        setImages([
          { file: null, previewUrl: null, dbUrl: data.image_url || '' },
          { file: null, previewUrl: null, dbUrl: data.image_url_2 || '' },
          { file: null, previewUrl: null, dbUrl: data.image_url_3 || '' },
          { file: null, previewUrl: null, dbUrl: data.image_url_4 || '' },
        ])
      })
  }, [vehicleId, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const openCrop = (rawFile, slotIndex) => {
    setCropSlot(slotIndex)
    setCropSrc(URL.createObjectURL(rawFile))
  }

  const handleCropConfirm = (blob) => {
    const croppedFile = new File([blob], 'vehicle.jpg', { type: 'image/jpeg' })
    const newPreview = URL.createObjectURL(blob)
    setImages(prev => prev.map((img, i) => {
      if (i !== cropSlot) return img
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
      return { ...img, file: croppedFile, previewUrl: newPreview }
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
    if (!form.make.trim() || !form.model.trim()) { setError('Marke und Modell sind Pflichtfelder.'); return }
    setSaving(true)
    setError(null)
    try {
      const urlUpdates = {}
      for (let i = 0; i < SLOT_COUNT; i++) {
        const img = images[i]
        if (img.file) {
          const filePath = `vehicles/${user.id}/${vehicleId}_${i + 1}.jpg`
          const { error: uploadError } = await supabase.storage.from('vehicles').upload(filePath, img.file, { upsert: true })
          if (uploadError) throw new Error(`Bild ${i + 1} Upload fehlgeschlagen: ${uploadError.message}`)
          const { data: pub } = supabase.storage.from('vehicles').getPublicUrl(filePath)
          urlUpdates[URL_KEYS[i]] = pub?.publicUrl ? `${pub.publicUrl}?t=${Date.now()}` : img.dbUrl
        } else {
          urlUpdates[URL_KEYS[i]] = img.dbUrl || null
        }
      }

      const basePayload = {
        title: form.title.trim() || null,
        make: form.make.trim(),
        model: form.model.trim(),
        year: form.year ? parseInt(form.year) : null,
        displacement_cc: form.displacement_cc ? parseInt(form.displacement_cc) : null,
        description: form.description.trim() || null,
      }

      const { error: updateError } = await supabase.from('vehicles')
        .update({ ...basePayload, ...urlUpdates })
        .eq('id', vehicleId).eq('user_id', user.id)

      if (updateError) {
        const isMissingCol = updateError.message?.includes('image_url_2') ||
          updateError.message?.includes('image_url_3') ||
          updateError.message?.includes('image_url_4')
        if (isMissingCol) {
          // DB migration not yet run — save with only image_url
          const { error: retryError } = await supabase.from('vehicles')
            .update({ ...basePayload, image_url: urlUpdates.image_url ?? null })
            .eq('id', vehicleId).eq('user_id', user.id)
          if (retryError) throw retryError
          setError('Nur Bild 1 gespeichert. Führe die DB-Migration aus um bis zu 4 Bilder zu speichern:\nALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url_2 TEXT, ADD COLUMN IF NOT EXISTS image_url_3 TEXT, ADD COLUMN IF NOT EXISTS image_url_4 TEXT;')
          setSaving(false)
          return
        }
        throw updateError
      }

      router.push(`/vehicles/${vehicleId}`)
    } catch (err) {
      setError(err?.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <DesktopLayout crumb="Fahrzeug bearbeiten">
      <div className="zh-page" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Authentifiziere…
      </div>
    </DesktopLayout>
  )
  if (!user) return (
    <DesktopLayout crumb="Fahrzeug bearbeiten">
      <div className="zh-page"><div className="zh-card zh-page-inner-sm">Bitte zuerst anmelden.</div></div>
    </DesktopLayout>
  )

  return (
    <DesktopLayout crumb="Fahrzeug bearbeiten">
    <div className="zh-page">
      <div className="zh-page-inner" style={{ maxWidth: '680px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)' }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>FAHRZEUG</span>
            Deine Garage
          </div>
          <h1 className="zh-page-title">Fahrzeug <em>bearbeiten.</em></h1>
        </div>

        {error && <div className="zh-error" role="alert" style={{ marginBottom: '24px' }}>{error}</div>}

        <div className="zh-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <label htmlFor="title" className="zh-label">Projektname (optional)</label>
              <input id="title" name="title" value={form.title} onChange={handleChange} className="zh-input" placeholder="z.B. S51 Restomod, Vergaser-Reha…" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="make" className="zh-label">Marke *</label>
                <input id="make" name="make" value={form.make} onChange={handleChange} className="zh-input" placeholder="z.B. Simson" />
              </div>
              <div>
                <label htmlFor="model" className="zh-label">Modell *</label>
                <input id="model" name="model" value={form.model} onChange={handleChange} className="zh-input" placeholder="z.B. S51" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="year" className="zh-label">Baujahr</label>
                <input id="year" name="year" type="number" min="1900" max={new Date().getFullYear()} value={form.year} onChange={handleChange} className="zh-input" placeholder="z.B. 1985" />
              </div>
              <div>
                <label htmlFor="displacement_cc" className="zh-label">Hubraum (ccm)</label>
                <input id="displacement_cc" name="displacement_cc" type="number" min="1" max="1000" value={form.displacement_cc} onChange={handleChange} className="zh-input" placeholder="z.B. 50" />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="zh-label">Beschreibung</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} className="zh-input" style={{ resize: 'vertical' }} rows={4} placeholder="Erzähl etwas über dein Fahrzeug…" />
            </div>

            <div>
              <label className="zh-label">Fotos — bis zu 4 Bilder</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} style={{ display: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {images.map((img, i) => {
                  const src = img.previewUrl || img.dbUrl
                  return (
                    <div
                      key={i}
                      onClick={() => handlePickFile(i)}
                      style={{
                        position: 'relative',
                        aspectRatio: '4/3',
                        border: `2px dashed ${src ? 'var(--ink)' : 'var(--hairline)'}`,
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
                      {src ? (
                        <>
                          <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
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
                          ><FontAwesomeIcon icon={faXmark} /></button>
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
                  )
                })}
              </div>
              <p style={{ marginTop: '8px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Klick auf ein Feld um ein Bild auszuwählen oder zu ersetzen · <FontAwesomeIcon icon={faXmark} /> zum Entfernen
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button type="submit" disabled={saving} className="zh-btn" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Speichert…' : <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Speichern <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} /></span>}
              </button>
              <button type="button" onClick={() => router.push(`/vehicles/${vehicleId}`)} className="zh-btn zh-btn-outline">
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
