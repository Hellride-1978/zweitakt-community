'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

function initCrop(width, height, aspect) {
  if (aspect) {
    return centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, aspect, width, height),
      width, height
    )
  }
  return centerCrop({ unit: '%', width: 80, height: 80 }, width, height)
}

// outputWidth/outputHeight: fixed output size (e.g. 480x480 for avatars).
// If omitted, output uses the natural crop dimensions capped at 1200px.
export default function CropModal({ src, onConfirm, onCancel, aspect, circularCrop = true, outputWidth, outputHeight }) {
  const imgRef = useRef(null)
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()

  const onImageLoad = useCallback((e) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget
    const initial = initCrop(naturalWidth, naturalHeight, aspect)
    setCrop(initial)
    setCompletedCrop(convertToPixelCrop(initial, width, height))
  }, [aspect])

  const handleConfirm = useCallback(() => {
    const img = imgRef.current
    if (!img || !completedCrop?.width || !completedCrop?.height) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const scaleX = img.naturalWidth  / img.width
    const scaleY = img.naturalHeight / img.height

    const naturalW = Math.round(completedCrop.width  * scaleX)
    const naturalH = Math.round(completedCrop.height * scaleY)
    const MAX = 1200
    const ratio = Math.min(1, MAX / Math.max(naturalW, naturalH))

    const W = outputWidth  || Math.round(naturalW * ratio)
    const H = outputHeight || Math.round(naturalH * ratio)

    canvas.width  = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      naturalW,
      naturalH,
      0, 0, W, H
    )

    canvas.toBlob(
      (blob) => { if (blob) onConfirm(blob) },
      'image/jpeg', 0.92
    )
  }, [completedCrop, onConfirm, outputWidth, outputHeight])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(26,17,8,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--cream)', border: '2px solid var(--ink)',
        borderRadius: '20px', boxShadow: '6px 6px 0 var(--ink)',
        maxWidth: '560px', width: '100%', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--hairline)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '4px' }}>
              Bildausschnitt
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: '22px', color: 'var(--ink)' }}>
              Ausschnitt wählen
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: '32px', height: '32px', border: '1.5px solid var(--ink)',
              borderRadius: '50%', background: 'none', cursor: 'pointer',
              display: 'grid', placeItems: 'center', fontSize: '16px',
              color: 'var(--ink)', transition: 'background 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ×
          </button>
        </div>

        {/* Crop area */}
        <div style={{ padding: '20px', background: 'var(--parchment)', display: 'flex', justifyContent: 'center' }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={circularCrop}
            style={{ maxHeight: '400px' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Zu beschneidendes Bild"
              onLoad={onImageLoad}
              style={{ maxHeight: '400px', maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 24px', borderTop: '1px solid var(--hairline)',
          display: 'flex', gap: '10px', justifyContent: 'flex-end',
        }}>
          <button onClick={onCancel} className="zh-btn zh-btn-outline" style={{ fontSize: '14px', padding: '10px 20px' }}>
            Abbrechen
          </button>
          <button onClick={handleConfirm} className="zh-btn" style={{ fontSize: '14px', padding: '10px 20px' }}>
            Übernehmen →
          </button>
        </div>
      </div>
    </div>
  )
}
