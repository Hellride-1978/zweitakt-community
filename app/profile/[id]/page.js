import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import ProfileActions from '@/components/ProfileActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMotorcycle, faArrowRight, faArrowLeft, faImage, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'

export default async function ProfilePage({ params }) {
  const { id } = await params
  const supabase = createServerClient()
  const [
    { data: profile, error },
    { data: vehicles },
    { data: participations },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('vehicles').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('ride_participants').select('rides(id, title, start_date, location)').eq('user_id', id),
  ])

  const now = new Date().toISOString()
  const upcomingEvents = (participations ?? [])
    .map((p) => p.rides)
    .filter((r) => r && r.start_date >= now)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  if (error || !profile) {
    return (
      <DesktopLayout crumb="Profil">
        <div style={{ padding: '40px 0' }}>
          <div className="zd-card">
            <h1 className="zh-page-title" style={{ fontSize: 36 }}>Profil nicht gefunden.</h1>
            <Link href="/profiles" className="zd-btn outline" style={{ display: 'inline-flex', marginTop: 20, gap: 8 }}><FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 13 }} /> Alle Schrauber</Link>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  const initial = (profile.name || '?').charAt(0).toUpperCase()
  const joinedDate = new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  return (
    <DesktopLayout crumb={profile.name || 'Profil'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div className="profile-grid">
        {/* ── Left: ID card + bio + activity ── */}
        <div className="profile-left">

          <div>
            <div className="zd-mono accent">Schrauber</div>
            <h2 className="zd-h2" style={{ marginTop: 6 }}>Über <em>mich.</em></h2>
          </div>

          {/* ID card */}
          <div className="profile-id">
            <div className="zh-avatar offline" style={{ width: 100, height: 100, fontSize: 36, margin: '0 auto 14px', boxShadow: '4px 4px 0 var(--ink)' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initial
              }
            </div>
            <div className="nm">{profile.name || 'Unbekannt'}</div>
            <div className="hn">{profile.location || `Dabei seit ${joinedDate}`}</div>
            {profile.location && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 4 }}>
                Dabei seit {joinedDate}
              </div>
            )}
            <div className="pstats">
              <div className="s">
                <div className="n"><em>{vehicles?.length ?? 0}</em></div>
                <div className="k">Bikes</div>
              </div>
              <div className="s">
                <div className="n"><em>{upcomingEvents.length}</em></div>
                <div className="k">Termine</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.description && (
            <div className="profile-bio">
              <p>{profile.description}</p>
            </div>
          )}


          <ProfileActions profileId={id} />
        </div>

        {/* ── Right: Garage grid ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div>
            <div className="zd-mono accent">Garage</div>
            <h2 className="zd-h2" style={{ marginTop: 6 }}>meine <em>bikes.</em></h2>
          </div>

          {!vehicles || vehicles.length === 0 ? (
            <div className="zd-card" style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)' }}>
              <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3, color: 'var(--ink-muted)' }}><FontAwesomeIcon icon={faMotorcycle} /></div>
              <p style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--ink-muted)' }}>Noch keine Fahrzeuge eingetragen.</p>
              <Link href="/vehicles/new" className="zd-btn accent" style={{ display: 'inline-flex', marginTop: 16, fontSize: 15 }}>
                Erstes Bike eintragen <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} />
              </Link>
            </div>
          ) : (
            <div className="garage-grid">
              {vehicles.map((v) => (
                <Link key={v.id} href={`/vehicles/${v.id}`} className="zd-bike" style={{ textDecoration: 'none' }}>
                  <div className="img" style={{ position: 'relative' }}>
                    {v.image_url
                      ? <img src={v.image_url} alt={`${v.make} ${v.model}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <FontAwesomeIcon icon={faMotorcycle} style={{ fontSize: 40, opacity: 0.3, color: 'var(--ink-muted)' }} />
                    }
                    {[v.image_url_2, v.image_url_3, v.image_url_4].filter(Boolean).length > 0 && (
                      <div style={{
                        position: 'absolute', bottom: 8, right: 8,
                        background: 'rgba(26,17,8,0.75)', backdropFilter: 'blur(4px)',
                        color: '#fff', borderRadius: 6,
                        padding: '3px 7px',
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.2px',
                      }}>
                        <FontAwesomeIcon icon={faImage} style={{ fontSize: 11 }} />
                        {1 + [v.image_url_2, v.image_url_3, v.image_url_4].filter(Boolean).length}
                      </div>
                    )}
                  </div>
                  <div className="info">
                    <div className="model">
                      {v.make} <span style={{ color: 'var(--accent)' }}>{v.model}</span>
                    </div>
                    {v.title && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', marginTop: 4 }}>
                        {v.title}
                      </div>
                    )}
                    <div className="yr">{[v.year, v.displacement_cc ? `${v.displacement_cc} ccm` : null].filter(Boolean).join(' · ') || '—'}</div>
                    <div className="specs">
                      {v.year && <div className="s"><div className="lbl">BJ</div><div className="v">{v.year}</div></div>}
                      {v.displacement_cc && <div className="s"><div className="lbl">Hubraum</div><div className="v">{v.displacement_cc} cc</div></div>}
                      <div className="s"><div className="lbl">Status</div><div className="v">läuft</div></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Angemeldete Termine ── */}
      {upcomingEvents.length > 0 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div className="zd-mono accent" style={{ marginBottom: 6 }}>
              <FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: 6 }} />
              Kommende Termine
            </div>
            <h2 className="zd-h2">angemeldet <em>dabei.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingEvents.map((ev) => {
              const d = new Date(ev.start_date)
              const weekday = d.toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase()
              const month = d.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase()
              const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0
              const time = hasTime ? d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : null
              return (
                <Link key={ev.id} href={`/events/${ev.id}`} className="zd-ride" style={{ textDecoration: 'none' }}>
                  <div className="when-block">
                    <div className="day">{weekday}</div>
                    <div className="num">{d.getDate()}</div>
                    <div className="mon">{month}</div>
                    {time && <div className="tm">{time}</div>}
                  </div>
                  <div className="body">
                    <div className="title">{ev.title}</div>
                    {ev.location && <div className="meta">{ev.location}</div>}
                  </div>
                  <div className="cta-col">
                    <span className="zd-mono accent">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      </div>
    </DesktopLayout>
  )
}
