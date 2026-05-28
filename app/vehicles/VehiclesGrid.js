'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function VehiclesGrid({ vehicles, likeCounts: initialCounts }) {
  const { user } = useAuth()
  const router = useRouter()
  const [counts, setCounts] = useState(initialCounts)
  const [liked, setLiked] = useState({})
  const [working, setWorking] = useState({})

  // Load user's own likes on mount
  useEffect(() => {
    if (!user || vehicles.length === 0) return
    const ids = vehicles.map(v => v.id)
    supabase
      .from('likes')
      .select('target_id')
      .eq('target_type', 'vehicle')
      .eq('user_id', user.id)
      .in('target_id', ids)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(l => { map[l.target_id] = true })
        setLiked(map)
      })
  }, [user, vehicles])

  const toggleLike = useCallback(async (e, vehicleId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push('/auth/login'); return }
    if (working[vehicleId]) return

    const isLiked = !!liked[vehicleId]
    // Optimistic update
    setLiked(l => ({ ...l, [vehicleId]: !isLiked }))
    setCounts(c => ({ ...c, [vehicleId]: Math.max(0, (c[vehicleId] ?? 0) + (isLiked ? -1 : 1)) }))
    setWorking(w => ({ ...w, [vehicleId]: true }))

    if (isLiked) {
      await supabase.from('likes').delete()
        .eq('target_type', 'vehicle')
        .eq('target_id', vehicleId)
        .eq('user_id', user.id)
    } else {
      await supabase.from('likes').insert({ target_type: 'vehicle', target_id: vehicleId, user_id: user.id })
    }
    setWorking(w => ({ ...w, [vehicleId]: false }))
  }, [user, liked, working, router])

  if (vehicles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)', borderRadius: 18 }}>
        <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)' }}>
          Noch keine Bikes eingetragen.
        </p>
      </div>
    )
  }

  return (
    <>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 20 }}>
        {vehicles.length} {vehicles.length === 1 ? 'Bike' : 'Bikes'}
      </div>

      <div className="vehicles-overview-grid">
        {vehicles.map(v => {
          const isLiked = !!liked[v.id]
          const count = counts[v.id] ?? 0
          const owner = v.profiles
          return (
            <div key={v.id} className="vog-card">
              <Link href={`/vehicles/${v.id}`} className="vog-link" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="vog-img">
                  {v.image_url
                    ? <img src={v.image_url} alt={`${v.make} ${v.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-muted)', opacity: 0.5 }}>kein foto</span>
                  }
                </div>
                <div className="vog-info">
                  <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.05, letterSpacing: 0.3 }}>
                    {v.make} <span style={{ color: 'var(--accent)' }}>{v.model}</span>
                  </div>
                  {v.title && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', marginTop: 4 }}>
                      {v.title}
                    </div>
                  )}
                  {v.year && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 4 }}>
                      {v.year}{v.displacement_cc ? ` · ${v.displacement_cc} cc` : ''}
                    </div>
                  )}
                </div>
              </Link>

              <div className="vog-footer">
                {owner && (
                  <Link href={`/profile/${owner.id}`} className="vog-owner" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }} onClick={e => e.stopPropagation()}>
                    <div className="zh-avatar offline" style={{ width: 24, height: 24, fontSize: 10, flexShrink: 0 }}>
                      {owner.avatar_url
                        ? <img src={owner.avatar_url} alt={owner.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : (owner.name || '?').charAt(0).toUpperCase()
                      }
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                      {owner.name || 'Unbekannt'}
                    </span>
                  </Link>
                )}

                <button
                  onClick={e => toggleLike(e, v.id)}
                  title={user ? (isLiked ? 'Like entfernen' : 'Liken') : 'Zum Liken bitte einloggen'}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase',
                    color: isLiked ? 'var(--accent-hot)' : 'var(--ink-muted)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'color .15s',
                    opacity: working[v.id] ? 0.5 : 1,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{isLiked ? '♥' : '♡'}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
