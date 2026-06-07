'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'martin@delavega.de'

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--ink)' : 'var(--surface)',
      border: '1.5px solid var(--ink)',
      borderRadius: 14,
      boxShadow: '4px 4px 0 var(--ink)',
      padding: '20px 24px',
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: accent ? 'rgba(155,195,214,0.8)' : 'var(--ink-muted)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 40, lineHeight: 1, color: accent ? '#fff' : 'var(--ink)', fontWeight: 800 }}>
        {value ?? '–'}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: accent ? 'rgba(255,255,255,0.55)' : 'var(--ink-muted)', marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function BarChart({ data, label, valueKey = 'subs' }) {
  if (!data?.length) return null
  const maxVal = Math.max(...data.map(d => d[valueKey] ?? 0), 1)
  const formatDay = iso => { const [, m, d] = iso.split('-'); return `${d}.${m}` }
  const shown = data.filter((_, i) => i % 5 === 0 || i === data.length - 1)
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>{label}</div>
      <div style={{ border: '1.5px solid var(--ink)', borderRadius: 14, padding: '20px 20px 12px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
          {data.map(d => (
            <div key={d.day} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div title={`${formatDay(d.day)}: ${d[valueKey] ?? 0}`} style={{ width: '100%', height: `${Math.max(((d[valueKey] ?? 0) / maxVal) * 100, (d[valueKey] ?? 0) > 0 ? 8 : 2)}%`, background: (d[valueKey] ?? 0) > 0 ? 'var(--ink)' : 'var(--hairline)', borderRadius: 3 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {shown.map(d => <div key={d.day} style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)' }}>{formatDay(d.day)}</div>)}
        </div>
      </div>
    </div>
  )
}

function smoothPath(pts) {
  if (pts.length < 2) return ''
  const parts = [`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`]
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i]
    const cpx = ((p.x + c.x) / 2).toFixed(1)
    parts.push(`C ${cpx} ${p.y.toFixed(1)} ${cpx} ${c.y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
  }
  return parts.join(' ')
}

function LineChart({ monthData, weekData, hourlyData }) {
  const [period, setPeriod] = useState('month')
  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  const W = 800, H = 140, PAD = { top: 16, right: 12, bottom: 28, left: 32 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const raw = period === 'day' ? hourlyData : period === 'week' ? weekData : monthData
  if (!raw?.length) return null

  const values = raw.map(d => d.views ?? 0)
  const maxVal = Math.max(...values, 1)

  const pts = raw.map((d, i) => ({
    x: PAD.left + (i / (raw.length - 1)) * innerW,
    y: PAD.top + innerH - (d.views / maxVal) * innerH,
    d,
  }))

  const linePath = smoothPath(pts)
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`

  const formatLabel = d => {
    if (period === 'day') return `${d.hour}:00`
    const [, m, day] = d.day.split('-')
    return `${day}.${m}`
  }

  const labelStep = period === 'day' ? 4 : period === 'week' ? 1 : 5
  const labelPts = pts.filter((_, i) => i % labelStep === 0 || i === pts.length - 1)

  const PERIODS = [
    { key: 'month', label: 'Monat' },
    { key: 'week',  label: 'Woche' },
    { key: 'day',   label: 'Tag' },
  ]

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          Seitenaufrufe
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '5px 14px', borderRadius: 100, cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
              border: '1.5px solid var(--ink)',
              background: period === p.key ? 'var(--ink)' : 'transparent',
              color: period === p.key ? 'var(--cream)' : 'var(--ink)',
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ border: '1.5px solid var(--ink)', borderRadius: 14, padding: '16px 16px 8px', background: 'var(--surface)', position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          onMouseMove={e => {
            const rect = svgRef.current?.getBoundingClientRect()
            if (!rect) return
            const svgX = ((e.clientX - rect.left) / rect.width) * W
            const idx = Math.round(((svgX - PAD.left) / innerW) * (raw.length - 1))
            const clamped = Math.max(0, Math.min(raw.length - 1, idx))
            setTooltip({ idx: clamped, pt: pts[clamped] })
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-color, #c2701f)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent-color, #c2701f)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-Achse Hilfslinien */}
          {[0, 0.5, 1].map(t => {
            const y = PAD.top + innerH - t * innerH
            return (
              <g key={t}>
                <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="var(--hairline)" strokeWidth="1" />
                <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="var(--ink-muted)" fontFamily="monospace">
                  {Math.round(maxVal * t)}
                </text>
              </g>
            )
          })}

          {/* Fläche */}
          <path d={areaPath} fill="url(#pvGrad)" />

          {/* Linie */}
          <path d={linePath} fill="none" stroke="var(--accent-color, #c2701f)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Datenpunkte */}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={tooltip?.idx === i ? 5 : 0} fill="var(--accent-color, #c2701f)" />
          ))}

          {/* Tooltip-Linie */}
          {tooltip && (
            <line x1={tooltip.pt.x} y1={PAD.top} x2={tooltip.pt.x} y2={PAD.top + innerH} stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="3,3" />
          )}

          {/* X-Achse Labels */}
          {labelPts.map(p => (
            <text key={p.d.day ?? p.d.hour} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--ink-muted)" fontFamily="monospace">
              {formatLabel(p.d)}
            </text>
          ))}
        </svg>

        {/* Tooltip Box */}
        {tooltip && (
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--ink)', color: 'var(--cream)', borderRadius: 8,
            padding: '5px 12px', fontFamily: 'var(--mono)', fontSize: 12, pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>
            {formatLabel(raw[tooltip.idx])} — {raw[tooltip.idx].views} Aufrufe
          </div>
        )}
      </div>
    </div>
  )
}

const COUNTRY_NAMES = new Intl.DisplayNames(['de'], { type: 'region' })
function countryName(code) {
  try { return COUNTRY_NAMES.of(code) ?? code } catch { return code }
}

function RankList({ title, items }) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>
        {title}
      </div>
      <div style={{ border: '1.5px solid var(--ink)', borderRadius: 14, overflow: 'hidden', background: 'var(--surface)' }}>
        {items.map((item, i) => (
          <div key={item.label} style={{ padding: '12px 20px', borderBottom: i < items.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)' }}>{item.label}</span>
              <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{item.value}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--hairline)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(item.value / max) * 100}%`, background: 'var(--ink)', borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Section({ title }) {
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16, marginTop: 40, paddingBottom: 8, borderBottom: '1px solid var(--hairline)' }}>
      {title}
    </div>
  )
}

export default function AdminStatistikPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!user || user.email !== ADMIN_EMAIL) { router.replace('/'); return }

    async function loadStats() {
      setFetching(true)
      setError(null)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) { setFetching(false); return }

      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Fehler'); return }
        setStats(data)
      } catch {
        setError('Fehler beim Laden der Statistiken.')
      } finally {
        setFetching(false)
      }
    }

    loadStats()
  }, [user, loading, router])

  if (loading || !user || user.email !== ADMIN_EMAIL) return null

  const nl = stats?.newsletter
  const cm = stats?.community
  const pv = stats?.pageViews
  const totalNl = (nl?.confirmed ?? 0) + (nl?.unsubscribed ?? 0) + (nl?.pending ?? 0)
  const unsubRate = totalNl > 0 ? ((nl?.unsubscribed / totalNl) * 100).toFixed(1) : '0.0'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
        Admin
      </div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, lineHeight: 1, margin: '0 0 40px' }}>Statistiken</h1>

      {fetching && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-muted)', marginBottom: 24 }}>
          Statistiken werden geladen…
        </div>
      )}

      {error && (
        <div className="zh-error" style={{ marginBottom: 24 }}>{error}</div>
      )}

      {/* ── Seitenaufrufe ── */}
      <Section title="Seitenaufrufe" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        <KpiCard label="Heute" value={pv?.today} sub="laufender Tag" accent />
        <KpiCard label="Diese Woche" value={pv?.week} sub="letzte 7 Tage" />
        <KpiCard label="Letzte 30 Tage" value={pv?.total} sub="eigenes Tracking" />
      </div>

      {pv?.chart && (
        <LineChart
          monthData={pv.chart}
          weekData={pv.chart?.slice(-7)}
          hourlyData={pv.chartHourly}
        />
      )}

      {pv?.devices && (
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <RankList
            title="Geräte – letzte 30 Tage"
            items={[
              { label: 'Desktop', value: pv.devices.desktop ?? 0 },
              { label: 'Mobile', value: pv.devices.mobile ?? 0 },
              { label: 'Tablet', value: pv.devices.tablet ?? 0 },
            ]}
          />
          {pv.topCountries?.length > 0 && (
            <RankList
              title="Herkunft – letzte 30 Tage"
              items={pv.topCountries.map(c => ({ label: countryName(c.country), value: c.views }))}
            />
          )}
        </div>
      )}

      {pv?.topPages?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>
            Top-Seiten – letzte 30 Tage
          </div>
          <div style={{ border: '1.5px solid var(--ink)', borderRadius: 14, overflow: 'hidden', background: 'var(--surface)' }}>
            {pv.topPages.map((p, i) => (
              <div key={p.path} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px',
                borderBottom: i < pv.topPages.length - 1 ? '1px solid var(--hairline)' : 'none',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', width: 18, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <a href={p.path} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', borderBottom: '1px solid var(--hairline)' }}>
                    {p.path}
                  </a>
                </div>
                <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 800, color: 'var(--ink)', flexShrink: 0 }}>
                  {p.views}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Newsletter ── */}
      <Section title="Newsletter" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        <KpiCard label="Abonnenten" value={nl?.confirmed} sub="bestätigt aktiv" accent />
        <KpiCard label="Abgemeldete" value={nl?.unsubscribed} sub={`Abmelderate ${unsubRate} %`} />
        <KpiCard label="Ausstehend" value={nl?.pending} sub="Double-Opt-In offen" />
        <KpiCard label="Gesamt" value={totalNl} sub="alle Einträge" />
      </div>

      {nl?.chart && (
        <BarChart data={nl.chart} label="Neue Abonnenten – letzte 30 Tage" />
      )}

      {/* ── Community ── */}
      <Section title="Community" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        <KpiCard label="Mitglieder" value={cm?.members} sub="registrierte Profile" accent />
        <KpiCard label="Forum-Threads" value={cm?.forumPosts} />
        <KpiCard label="Forum-Antworten" value={cm?.forumReplies} />
        <KpiCard label="Feedbacks" value={cm?.feedbacks} sub="eingegangene Meldungen" />
      </div>
    </div>
  )
}
