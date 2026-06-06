'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { validateImageFile } from '@/lib/validateImage'

export default function ForumImageUpload({ userId, imageUrl, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) { setError(validationError); return }

    setError(null)
    setUploading(true)

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${userId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('forum-images')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('forum-images').getPublicUrl(path)
      onChange(data.publicUrl + `?t=${Date.now()}`)
    } catch (err) {
      setError('Upload fehlgeschlagen: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    onChange('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {imageUrl ? (
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: 360 }}>
          <img
            src={imageUrl}
            alt="Vorschau"
            style={{ width: '100%', borderRadius: 10, border: '1.5px solid var(--hairline)', display: 'block' }}
          />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'var(--ink)', color: 'var(--cream)',
              border: 'none', borderRadius: '50%',
              width: 28, height: 28, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, lineHeight: 1,
            }}
            title="Bild entfernen"
          >
            ×
          </button>
        </div>
      ) : (
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px',
            border: '1.5px dashed var(--hairline)',
            borderRadius: 10,
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--sans)', fontSize: 13,
            color: 'var(--ink-muted)',
            transition: 'border-color 0.15s, color 0.15s',
            opacity: uploading ? 0.6 : 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.color = 'var(--ink-muted)' }}
        >
          <span style={{ fontSize: 18 }}>📎</span>
          {uploading ? 'Wird hochgeladen…' : 'Bild anhängen (max. 5 MB)'}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      )}
      {error && (
        <p style={{ margin: 0, fontSize: 13, color: '#6e2918', fontFamily: 'var(--sans)' }}>{error}</p>
      )}
    </div>
  )
}
