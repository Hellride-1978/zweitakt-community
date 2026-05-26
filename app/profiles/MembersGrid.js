'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

function formatTimeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.round((todayStart - dateStart) / 86400000)
  if (days === 0) return 'Heute'
  if (days === 1) return 'Gestern'
  if (days < 30) return `${days} Tage`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 Mon.'
  if (months < 12) return `${months} Mon.`
  return `${Math.floor(months / 12)} J.`
}

const SORT_OPTIONS = [
  { key: 'newest', label: 'Neueste' },
  { key: 'oldest', label: 'Älteste' },
  { key: 'name',   label: 'Name A–Z' },
]

const FILTER_OPTIONS = [
  { key: 'all',    label: 'Alle' },
  { key: 'bike',   label: 'Mit Fahrzeug' },
  { key: 'nobike', label: 'Ohne Fahrzeug' },
]

export default function MembersGrid({ members }) {
  const [filter, setFilter] = useState('all')
  const [sort,   setSort]   = useState('newest')

  const visible = useMemo(() => {
    let list = [...members]

    if (filter === 'bike')   list = list.filter(m => m.vehicles?.length > 0)
    if (filter === 'nobike') list = list.filter(m => !m.vehicles?.length)

    if (sort === 'newest') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sort === 'oldest') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    if (sort === 'name')   list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'))

    return list
  }, [members, filter, sort])

  return (
    <>
      {/* ── Controls ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginRight: 4 }}>Filter</span>
          {FILTER_OPTIONS.map(o => (
            <button key={o.key} className={`zh-filter-btn${filter === o.key ? ' active' : ''}`} onClick={() => setFilter(o.key)}>
              {o.label}
            </button>
          ))}
          <span style={{ width: 1, height: 20, background: 'var(--hairline)', margin: '0 4px' }} />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="zh-input"
            style={{ padding: '7px 14px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '1.5px', textTransform: 'uppercase', height: 'auto', width: 'auto', cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Result count ── */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 20 }}>
        {visible.length} {visible.length === 1 ? 'Schrauber' : 'Schrauber'}
      </div>

      {/* ── Grid ── */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)', borderRadius: 18 }}>
          <p style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--ink-muted)' }}>Keine Treffer.</p>
        </div>
      ) : (
        <div className="zh-members-grid">
          {visible.map(m => {
            const initial = (m.name || '?').charAt(0).toUpperCase()
            const since = formatTimeAgo(m.created_at)
            const latestVehicle = m.vehicles?.[0]
            return (
              <Link key={m.id} href={`/profile/${m.id}`} className="zh-member-card" style={{ textDecoration: 'none' }}>
                <div className="zh-member-top">
                  <div className="zh-avatar">
                    {m.avatar_url
                      ? <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : initial
                    }
                  </div>
                  <div className="zh-member-name">
                    <h4>{m.name || 'Unbekannt'}</h4>
                    <div className="loc">{m.location || 'Community'}</div>
                  </div>
                </div>

                {latestVehicle && (
                  <div className="zh-member-project">
                    <div className="label">Fährt</div>
                    <div className="bike">
                      {latestVehicle.title
                        ? `${latestVehicle.make} ${latestVehicle.model} — ${latestVehicle.title}`
                        : `${latestVehicle.make} ${latestVehicle.model}${latestVehicle.year ? ` (${latestVehicle.year})` : ''}`
                      }
                    </div>
                  </div>
                )}

                <div className="zh-member-stats">
                  <div className="item">
                    <div className="n">{m.vehicles?.length ?? 0}</div>
                    <div className="k">Bikes</div>
                  </div>
                  <div className="item">
                    <div className="n">{since}</div>
                    <div className="k">dabei</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
