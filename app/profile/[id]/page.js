import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import ProfileActions from '@/components/ProfileActions'
import ProfileSettings from '@/components/ProfileSettings'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import AvatarLightbox from '@/components/AvatarLightbox'
import ProfileGarageSection from '@/components/ProfileGarageSection'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = createServerClient()
  const { data: profile } = await supabase.from('profiles').select('name, description, avatar_url').eq('id', id).single()
  if (!profile) return { title: 'Profil nicht gefunden' }
  const description = profile.description
    ? profile.description.slice(0, 120)
    : `${profile.name || 'Schrauber'} auf Zweitakthoden`
  return {
    title: profile.name || 'Profil',
    description,
    openGraph: {
      title: profile.name || 'Profil',
      description,
      ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {}),
    },
  }
}

export default async function ProfilePage({ params }) {
  const { id } = await params
  const supabase = createServerClient()
  const [
    { data: profile, error },
    { data: vehicles },
    { data: participations },
    { data: garage },
    { data: garageSkills },
  ] = await Promise.all([
    supabase.from('profiles').select('*, plz, last_seen').eq('id', id).single(),
    supabase.from('vehicles').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('ride_participants').select('rides(id, title, start_date, location)').eq('user_id', id),
    supabase.from('garage').select('*').eq('user_id', id).single(),
    supabase.from('garage_skills').select('skill').eq('user_id', id),
  ])

  let vehicleLikeCounts = {}
  if (vehicles?.length > 0) {
    const vids = vehicles.map(v => v.id)
    const { data: vlikes } = await supabase
      .from('likes')
      .select('target_id')
      .eq('target_type', 'vehicle')
      .in('target_id', vids)
    vlikes?.forEach(l => { vehicleLikeCounts[l.target_id] = (vehicleLikeCounts[l.target_id] || 0) + 1 })
  }

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
  const isOnline = profile.last_seen && (Date.now() - new Date(profile.last_seen).getTime()) < 10 * 60 * 1000
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
            <AvatarLightbox src={profile.avatar_url} alt={profile.name} initial={initial} isOnline={!!isOnline} />
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


          <Suspense fallback={null}><ProfileActions profileId={id} hasPlz={!!profile.plz} /></Suspense>
        </div>

        {/* ── Right: Bikes + Garage ── */}
        <ProfileGarageSection
          profileId={id}
          vehicles={vehicles}
          vehicleLikeCounts={vehicleLikeCounts}
          garage={garage}
          garageSkills={(garageSkills || []).map(s => s.skill)}
        />
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

      <Suspense fallback={null}><ProfileSettings profileId={id} /></Suspense>

      </div>
    </DesktopLayout>
  )
}
