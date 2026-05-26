'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function VehicleOwnerActions({ vehicleId, ownerId }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [deleteStep, setDeleteStep] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  if (loading || !user || user.id !== ownerId) return null

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      const paths = [1, 2, 3, 4].map((n) => `vehicles/${user.id}/${vehicleId}_${n}.jpg`)
      await supabase.storage.from('vehicles').remove(paths)
      const { error: dbError } = await supabase.from('vehicles').delete().eq('id', vehicleId)
      if (dbError) throw dbError
      router.push(`/profile/${user.id}`)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
      setDeleteStep(0)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Link
        href={`/vehicles/${vehicleId}/edit`}
        className="zd-btn accent"
        style={{ justifyContent: 'center' }}
      >
        Bearbeiten
      </Link>

      {deleteStep === 0 && (
        <button
          type="button"
          onClick={() => setDeleteStep(1)}
          className="zd-btn outline"
          style={{ justifyContent: 'center' }}
        >
          Bike löschen
        </button>
      )}

      {deleteStep === 1 && (
        <div style={{ background: 'color-mix(in oklab, #ef4444 8%, var(--cream))', border: '1.5px solid #ef4444', borderRadius: 14, padding: '16px' }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', marginBottom: 14, lineHeight: 1.5 }}>
            <strong>Wirklich löschen?</strong> Alle Fotos und Daten dieses Bikes werden unwiderruflich entfernt.
          </p>
          {error && (
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#ef4444', marginBottom: 12 }}>{error}</p>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', background: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? 'Löscht…' : 'Ja, löschen'}
            </button>
            <button
              type="button"
              onClick={() => setDeleteStep(0)}
              style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink)', background: 'none', border: '1.5px solid var(--hairline)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
