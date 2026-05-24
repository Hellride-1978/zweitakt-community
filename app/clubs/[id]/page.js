import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import ClubActions from './ClubActions'
import ClubEditButton from './ClubEditButton'
import AdminPanel from './AdminPanel'
import InvitePlaceholders from './InvitePlaceholders'
import DesktopLayout from '@/components/DesktopLayout'

export const dynamic = 'force-dynamic'

export default async function ClubDetailPage({ params }) {
  const { id } = await params
  const supabase = createServerClient()

  const [{ data: club, error }, { data: rides }] = await Promise.all([
    supabase
      .from('clubs')
      .select('*, profiles(id, name, avatar_url), club_members(id, user_id, role, profiles(id, name, avatar_url, location))')
      .eq('id', id)
      .single(),
    supabase
      .from('rides')
      .select('id, title, start_date, location, max_participants, ride_participants(count)')
      .eq('club_id', id)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(5),
  ])

  if (error || !club) {
    return (
      <DesktopLayout crumb="Nicht gefunden">
        <div style={{ padding: '40px 0' }}>
          <div className="zd-card">
            <h1 className="zh-page-title" style={{ fontSize: 36 }}>Club nicht gefunden.</h1>
            <Link href="/clubs" className="zd-btn outline" style={{ display: 'inline-flex', marginTop: 20 }}>← Alle Clubs</Link>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  const creator = club.profiles
  const members = club.club_members ?? []
  const admins = members.filter((m) => m.role === 'admin')
  const regularMembers = members.filter((m) => m.role !== 'admin')
  const upcomingRides = rides ?? []
  const coverImage = club.image_url || club.logo_url || null
  const galleryImages = [club.image_url_2, club.image_url_3, club.image_url_4].filter(Boolean)

  return (
    <DesktopLayout crumb={club.name}>
      <div className="club-grid">
        {/* ── Main column ── */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          {/* ── Hero: Info links, Bild rechts ── */}
          <div className="club-hero">

            {/* Links: Name, Stats, Actions, Beschreibung */}
            <div className="club-hero-info">
              <div>
                <div className="zd-mono accent">Club</div>
                <h1 className="zd-h1" style={{ marginTop: 6, fontSize: 48 }}>{club.name}</h1>
                <div className="zd-mono" style={{ marginTop: 8 }}>
                  {[club.location, club.is_public ? 'Öffentlich' : 'Privat'].filter(Boolean).join(' · ')}
                </div>
              </div>

              <div className="cstats">
                <div className="s"><div className="n"><em>{members.length}</em></div><div className="k">Mitglieder</div></div>
                <div className="s"><div className="n">{admins.length}</div><div className="k">Admins</div></div>
              </div>

              <ClubActions clubId={club.id} creatorId={club.created_by} members={members} />

              {club.description && (
                <div className="zd-card">
                  <div className="zd-mono accent" style={{ marginBottom: 10 }}>Über den Club</div>
                  <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {club.description}
                  </p>
                </div>
              )}
            </div>

            {/* Rechts: Bild in originalem Seitenverhältnis + Edit-Button darunter */}
            {coverImage && (
              <div className="club-hero-img-wrap">
                <div className="club-hero-img">
                  <img src={coverImage} alt={club.name} />
                </div>
                <ClubEditButton clubId={club.id} members={members} />
              </div>
            )}
          </div>

          {/* Galerie */}
          {galleryImages.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${galleryImages.length}, 1fr)`, gap: 8, marginBottom: 20 }}>
              {galleryImages.map((url, i) => (
                <div key={i} style={{ aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--hairline)' }}>
                  <img src={url} alt={`${club.name} Foto ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* Mitglieder */}
          <div className="zd-mono accent" style={{ marginBottom: 12 }}>Mitglieder ({members.length})</div>
          <div className="members-grid" style={{ marginBottom: 24 }}>
            {[...admins, ...regularMembers].map((m) => {
              const u = m.profiles
              return u ? (
                <Link key={m.id} href={`/profile/${u.id}`} className={`zd-mem${m.role === 'admin' ? ' crown' : ''}`} style={{ textDecoration: 'none' }}>
                  <div className="zh-avatar offline" style={{ width: 42, height: 42, fontSize: 16, flexShrink: 0 }}>
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : (u.name || '?').charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="who">
                    <div className="nm">{u.name || 'Unbekannt'}</div>
                    <div className="rl">{m.role === 'admin' ? '★ Admin' : 'Mitglied'}</div>
                  </div>
                </Link>
              ) : null
            })}
            <InvitePlaceholders clubId={club.id} members={members} />
          </div>

          {/* Admin-Panel */}
          <AdminPanel clubId={club.id} creatorId={club.created_by} members={members} />
        </div>

        {/* ── Right rail ── */}
        <aside className="club-rail" style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          <div className="zd-mono accent">Nächste Touren</div>

          {upcomingRides.length === 0 ? (
            <div className="zd-card" style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
              Noch keine Ausfahrten geplant.
              <br/>
              <Link href="/events/new" style={{ color: 'var(--accent)', marginTop: 8, display: 'block' }}>
                Ausfahrt erstellen →
              </Link>
            </div>
          ) : (
            upcomingRides.map((ride) => {
              const d = new Date(ride.start_date)
              const dayStr = d.toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase()
              const dateStr = `${d.getDate()}. ${d.toLocaleDateString('de-DE', { month: 'short' })}`
              const time = d.getHours() !== 0 ? d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : null
              const count = ride.ride_participants?.[0]?.count ?? 0
              return (
                <Link key={ride.id} href={`/events/${ride.id}`} className="ride-mini" style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="head">
                    {dayStr} · {dateStr}{time ? ` · ${time}` : ''}
                  </div>
                  <div className="t">{ride.title}</div>
                  {ride.location && <div className="m">{ride.location}</div>}
                  <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                    👥 {count}{ride.max_participants ? ` / ${ride.max_participants}` : ''} dabei
                  </div>
                </Link>
              )
            })
          )}

          <Link href="/events" className="zd-btn outline" style={{ marginTop: 4, textAlign: 'center', display: 'block' }}>
            Alle Ausfahrten →
          </Link>

          {creator && (
            <>
              <div className="zd-mono accent" style={{ marginTop: 8 }}>Gegründet von</div>
              <Link href={`/profile/${creator.id}`} className="who-card" style={{ textDecoration: 'none' }}>
                <div className="zh-avatar offline" style={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
                  {creator.avatar_url
                    ? <img src={creator.avatar_url} alt={creator.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : (creator.name || '?').charAt(0).toUpperCase()
                  }
                </div>
                <div className="info" style={{ flex: 1 }}>
                  <div className="role">Gründer</div>
                  <div className="nm">{creator.name || 'Unbekannt'}</div>
                </div>
              </Link>
            </>
          )}
        </aside>
      </div>
    </DesktopLayout>
  )
}
