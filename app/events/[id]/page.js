import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import EventActions from './EventActions'
import MapTileModal from './MapTileModal'
import ShareButtons from './ShareButtons'
import DesktopLayout from '@/components/DesktopLayout'
import LikeButton from '@/components/LikeButton'
import Comments from '@/components/Comments'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: event } = await supabase.from('rides').select('title, description, start_date, location').eq('id', id).single()
  if (!event) return { title: 'Termin nicht gefunden' }
  const date = new Date(event.start_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  const description = event.description
    ? event.description.slice(0, 120)
    : `${date}${event.location ? ` · ${event.location}` : ''}`
  return {
    title: event.title,
    description,
    openGraph: { title: event.title, description, type: 'article' },
  }
}

async function getReverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'User-Agent': 'zweitakthoden/1.0' }, next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const a = data.address || {}
    const street = [a.road, a.house_number].filter(Boolean).join(' ')
    const place = [a.postcode, a.city || a.town || a.village || a.municipality].filter(Boolean).join(' ')
    const parts = [street, place].filter(Boolean)
    return parts.length ? parts.join(', ') : (data.display_name?.split(',').slice(0, 2).join(',').trim() || null)
  } catch {
    return null
  }
}

function getTileInfo(lat, lng, zoom = 15) {
  const n = 1 << zoom
  const xFull = (lng + 180) / 360 * n
  const latRad = lat * Math.PI / 180
  const yFull = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
  const x = Math.floor(xFull)
  const y = Math.floor(yFull)
  const fracX = xFull - x
  const fracY = yFull - y
  const tiles = []
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      tiles.push(`https://tile.openstreetmap.org/${zoom}/${x + dx}/${y + dy}.png`)
  return { tiles, fracX, fracY }
}

const chip = {
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 10,
  padding: '10px 14px',
}
const chipLabel = {
  fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: 1.8,
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 4,
}
const chipValue = {
  fontFamily: 'var(--display)', fontSize: 18, lineHeight: 1.05, color: '#fff',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
}

export default async function EventDetailPage({ params }) {
  const { id } = await params

  const { data: event, error } = await supabase
    .from('rides')
    .select('*, profiles(id, name, avatar_url, location), ride_participants(id, user_id, profiles(id, name, avatar_url))')
    .eq('id', id)
    .single()

  if (error || !event) {
    return (
      <DesktopLayout crumb="Nicht gefunden">
        <div className="zh-page-inner-sm" style={{ padding: '40px 0' }}>
          <div className="zd-card">
            <h1 className="zh-page-title" style={{ fontSize: 36 }}>Termin nicht gefunden.</h1>
            <Link href="/events" className="zd-btn outline" style={{ display: 'inline-flex', marginTop: 20 }}>← Alle Termine</Link>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  const creator = event.profiles
  const participants = event.ride_participants ?? []
  const date = new Date(event.start_date)
  const hasCoords = !!(event.location_lat && event.location_lng)
  const showTime = date.getHours() !== 0 || date.getMinutes() !== 0
  const timeStr = showTime ? date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : null
  const dateStr = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  const dateShort = date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })

  const max = event.max_participants
  const freeSlots = max ? Math.max(0, max - participants.length) : null

  const tileInfo = hasCoords ? getTileInfo(event.location_lat, event.location_lng, 15) : null
  const address = hasCoords ? await getReverseGeocode(event.location_lat, event.location_lng) : null

  const hasMap = hasCoords && !!tileInfo
  const hasDesc = !!event.description

  return (
    <DesktopLayout crumb={event.title}>
      <div className="detail-grid">

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>

          {/* Hero — with stats overlay */}
          <div className="detail-hero" style={{ background: '#000' }}>

            <div className="hero-pad" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
              {/* Left: title + date */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="when-line">
                  <span className="dot" />
                  {dateStr}{timeStr ? ` · ${timeStr} Uhr` : ''}
                </div>
                <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>{event.title}</h1>
                {event.location && (
                  <span style={{
                    alignSelf: 'flex-start',
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
                    padding: '5px 10px', borderRadius: 100,
                    background: 'var(--accent)', color: 'var(--cream)', border: '1px solid var(--ink)',
                  }}>{event.location}</span>
                )}
              </div>

              {/* Right: 2×2 stat grid */}
              <div className="event-hero-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flexShrink: 0, minWidth: 240 }}>
                <div style={chip}>
                  <div style={chipLabel}>Datum</div>
                  <div style={chipValue}>{dateShort}</div>
                </div>
                <div style={chip}>
                  <div style={chipLabel}>Uhrzeit</div>
                  <div style={chipValue}>{timeStr || '—'}</div>
                </div>
                <div style={chip}>
                  <div style={chipLabel}>Treffpunkt</div>
                  <div style={{ ...chipValue, fontSize: 14 }}>{event.location || '—'}</div>
                </div>
                <div style={chip}>
                  <div style={chipLabel}>Teilnehmer</div>
                  <div style={chipValue}>{participants.length}{max ? `/${max}` : ''}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Flyer / Poster */}
          {event.image_url && (
            <div className="zd-card" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="zd-mono accent" style={{ fontSize: 10 }}>Flyer / Poster</span>
              </div>
              <img
                src={event.image_url}
                alt={`Flyer: ${event.title}`}
                style={{ width: '100%', display: 'block', maxHeight: 600, objectFit: 'contain', background: 'var(--surface)' }}
              />
            </div>
          )}

          {/* Map tile + Beschreibung nebeneinander */}
          {(hasMap || hasDesc) && (
            <div className="event-map-desc" style={{
              display: 'grid',
              gridTemplateColumns: hasMap && hasDesc ? '1fr 1.3fr' : '1fr',
              gap: 18,
              alignItems: 'stretch',
            }}>
              {hasMap && (
                <MapTileModal
                  lat={event.location_lat}
                  lng={event.location_lng}
                  locationName={event.location}
                  address={address}
                  tiles={tileInfo.tiles}
                  fracX={tileInfo.fracX}
                  fracY={tileInfo.fracY}
                />
              )}
              {hasDesc && (
                <div className="zd-card" style={{ margin: 0 }}>
                  <div className="zd-mono accent" style={{ marginBottom: 10 }}>Beschreibung</div>
                  <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Kommentare */}
          <div className="zd-card" style={{ margin: 0 }}>
            <Comments targetType="event" targetId={event.id} ownerId={event.creator_id} />
          </div>

        </div>

        {/* ── Right rail ── */}
        <aside className="detail-rail" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Veranstalter */}
          {creator && (
            <>
              <div className="zd-mono accent">Veranstalter</div>
              <Link href={`/profile/${creator.id}`} className="who-card" style={{ textDecoration: 'none' }}>
                <div className="zh-avatar offline" style={{ width: 44, height: 44, fontSize: 18, flexShrink: 0 }}>
                  {creator.avatar_url
                    ? <img src={creator.avatar_url} alt={creator.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : (creator.name || '?').charAt(0).toUpperCase()
                  }
                </div>
                <div className="info" style={{ flex: 1 }}>
                  <div className="role">Organisiert von</div>
                  <div className="nm">{creator.name || 'Unbekannt'}</div>
                </div>
              </Link>
            </>
          )}

          {/* Teilnehmer */}
          <div className="zd-mono accent" style={{ marginTop: 4 }}>
            {participants.length}{max ? ` von ${max}` : ''} dabei
          </div>

          {participants.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', fontStyle: 'italic' }}>Noch niemand angemeldet.</p>
          ) : (
            <div className="att-grid">
              {participants.slice(0, 8).map((p) => {
                const u = p.profiles
                return u ? (
                  <Link key={p.id} href={`/profile/${u.id}`} className="a" style={{ textDecoration: 'none' }}>
                    <div className="zh-avatar offline" style={{ width: '100%', aspectRatio: 1, height: 'auto', fontSize: 14, borderRadius: '50%' }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : (u.name || '?').charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="nn">{(u.name || '—').split(' ')[0]}</div>
                  </Link>
                ) : null
              })}
              {max && freeSlots > 0 && Array.from({ length: Math.min(freeSlots, 8 - participants.length) }).map((_, i) => (
                <div key={`free-${i}`} className="a more">
                  <div className="zh-avatar offline" style={{ width: '100%', aspectRatio: 1, height: 'auto', fontSize: 11 }}>+</div>
                  <div className="nn">Frei</div>
                </div>
              ))}
            </div>
          )}

          {/* Teilen */}
          <div className="zd-mono accent" style={{ marginTop: 6 }}>Teilen</div>
          <ShareButtons title={event.title} />

          {/* Likes */}
          <div className="zd-mono accent" style={{ marginTop: 6 }}>Gefällt mir</div>
          <LikeButton targetType="event" targetId={event.id} />

          {/* Actions — am Ende der Spalte */}
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <EventActions
              eventId={event.id}
              creatorId={event.creator_id}
              participants={participants}
              maxParticipants={max}
            />
          </div>

        </aside>
      </div>
    </DesktopLayout>
  )
}
