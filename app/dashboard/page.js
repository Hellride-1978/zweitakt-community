'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DesktopLayout from '@/components/DesktopLayout'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [myClubs, setMyClubs] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setLoadingProfile(true)
      const [
        { data: profileData, error: profileError },
        { data: vehicleData },
        { data: eventData },
        { data: clubData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('vehicles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ride_participants').select('rides(id, title, start_date, location)').eq('user_id', user.id).gte('rides.start_date', new Date().toISOString()).limit(3),
        supabase.from('club_members').select('clubs(id, name, location)').eq('user_id', user.id).limit(5),
      ])
      if (profileError) { setError(profileError.message); setProfile(null) }
      else setProfile(profileData ?? null)
      setVehicles(vehicleData ?? [])
      setUpcomingEvents((eventData ?? []).filter((e) => e.rides).map((e) => e.rides))
      setMyClubs((clubData ?? []).filter((c) => c.clubs).map((c) => c.clubs))
      setLoadingProfile(false)
    }
    if (!loading) fetchData()
  }, [user, loading])

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Fahrzeug wirklich löschen?')) return
    await supabase.storage.from('vehicles').remove([`vehicles/${user.id}/${vehicleId}.jpg`])
    await supabase.from('vehicles').delete().eq('id', vehicleId).eq('user_id', user.id)
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
  }

  if (loading) return (
    <DesktopLayout crumb="Dashboard">
      <div className="zh-page" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Authentifiziere…
      </div>
    </DesktopLayout>
  )

  if (!user) return (
    <DesktopLayout crumb="Dashboard">
      <div className="zh-page">
        <div className="zh-page-inner-sm" style={{ textAlign: 'center', paddingTop: '48px' }}>
          <p className="zh-page-title" style={{ fontSize: '36px' }}>Nicht angemeldet.</p>
          <Link href="/auth/login" className="zh-btn" style={{ display: 'inline-flex', marginTop: '24px' }}>Zur Anmeldung →</Link>
        </div>
      </div>
    </DesktopLayout>
  )

  return (
    <DesktopLayout crumb="Dashboard">
    <div className="zh-page">
      <div className="zh-page-inner">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)' }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>DASH</span>
              Deine Garage
            </div>
            <h1 className="zh-page-title">Mein <em>Dashboard.</em></h1>
          </div>
          <Link href="/profiles" className="zh-btn zh-btn-outline" style={{ fontSize: '14px', padding: '10px 20px' }}>
            Community →
          </Link>
        </div>

        {/* Content */}
        {loadingProfile ? (
          <div className="zh-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--ink-muted)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Lade Profil…
          </div>
        ) : error ? (
          <div className="zh-error">{error}</div>
        ) : profile ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'min(320px, 100%) 1fr', gap: 'clamp(20px, 3vw, 40px)', alignItems: 'start' }} className="dashboard-grid">

            {/* Profile card */}
            <div className="zh-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '1', background: 'repeating-linear-gradient(135deg, var(--parchment) 0 12px, color-mix(in oklab, var(--parchment) 88%, var(--ink)) 12px 13px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1.5px solid var(--ink)' }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="Profilbild" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (
                    <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(60px, 10vw, 100px)', color: 'var(--cream)', WebkitTextStroke: '3px var(--ink)', paintOrder: 'stroke fill' }}>
                      {(profile.name || '?').charAt(0).toUpperCase()}
                    </div>
                  )
                }
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '8px' }}>
                  {profile.user_type === 'club' ? 'Klub' : 'Schrauber'}
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: '28px', lineHeight: 1, color: 'var(--ink)', WebkitTextStroke: '0.5px var(--ink)', paintOrder: 'stroke fill' }}>
                  {profile.name || 'Unbekannt'}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: '8px' }}>
                  Dabei seit {new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--hairline)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link href="/profile/edit" className="zh-btn" style={{ fontSize: '13px', padding: '9px 16px', flex: 1, justifyContent: 'center' }}>
                    Bearbeiten
                  </Link>
                  <Link href={`/profile/${profile.id}`} className="zh-btn zh-btn-outline" style={{ fontSize: '13px', padding: '9px 16px', flex: 1, justifyContent: 'center' }}>
                    Ansehen
                  </Link>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* About */}
              <div className="zh-card">
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px' }}>
                  Über mich
                </div>
                <p style={{ fontSize: 'clamp(16px, 1.6vw, 18px)', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  {profile.description || 'Noch keine Beschreibung. Bearbeite dein Profil um eine hinzuzufügen.'}
                </p>
              </div>

              {/* Vehicles */}
              <div className="zh-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    Fahrzeuge
                  </div>
                  <Link href="/vehicles/new" className="zh-btn" style={{ fontSize: '12px', padding: '7px 14px' }}>
                    + Hinzufügen
                  </Link>
                </div>

                {vehicles.length === 0 ? (
                  <div style={{ border: '2px dashed var(--hairline)', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '32px', marginBottom: '8px' }}>🏍️</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                      Noch keine Fahrzeuge
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {vehicles.map((v) => (
                      <div key={v.id} className="zh-vehicle-card">
                        <div className="zh-vehicle-photo">
                          {v.image_url
                            ? <img src={v.image_url} alt={`${v.make} ${v.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontFamily: 'var(--display)', fontSize: '28px' }}>🏍️</span>
                          }
                        </div>
                        <div style={{ padding: '12px' }}>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '4px' }}>
                            {v.year || '—'}
                          </div>
                          <div style={{ fontFamily: 'var(--display)', fontSize: '18px', lineHeight: 1.1, color: 'var(--ink)' }}>
                            {v.make} {v.model}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                            <button
                              onClick={() => router.push(`/vehicles/${v.id}/edit`)}
                              className="zh-btn zh-btn-outline"
                              style={{ fontSize: '11px', padding: '5px 10px', flex: 1 }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(v.id)}
                              style={{ fontSize: '11px', padding: '5px 10px', border: '1.5px solid var(--hairline)', borderRadius: '8px', background: 'none', cursor: 'pointer', color: 'var(--ink-muted)', transition: 'border-color 0.18s, color 0.18s' }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c55a3c'; e.currentTarget.style.color = '#c55a3c' }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.color = 'var(--ink-muted)' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Events */}
              <div className="zh-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    Meine Events
                  </div>
                  <Link href="/events" className="zh-btn" style={{ fontSize: '12px', padding: '7px 14px' }}>
                    Alle Events
                  </Link>
                </div>
                {upcomingEvents.length === 0 ? (
                  <div style={{ border: '2px dashed var(--hairline)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '28px', marginBottom: '6px' }}>📍</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                      Keine bevorstehenden Ausfahrten
                    </div>
                    <Link href="/events" style={{ display: 'inline-block', marginTop: '10px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)' }}>
                      Events entdecken →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {upcomingEvents.map((ev) => (
                      <Link key={ev.id} href={`/events/${ev.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: 'var(--parchment)', textDecoration: 'none' }}>
                        <div style={{ textAlign: 'center', minWidth: '36px' }}>
                          <div style={{ fontFamily: 'var(--display)', fontSize: '20px', lineHeight: 1, color: 'var(--ink)' }}>{new Date(ev.start_date).toLocaleDateString('de-DE', { day: 'numeric' })}</div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>{new Date(ev.start_date).toLocaleDateString('de-DE', { month: 'short' })}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--display)', fontSize: '16px', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                          {ev.location && <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>📍 {ev.location}</div>}
                        </div>
                        <span style={{ color: 'var(--accent)' }}>→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* My Clubs */}
              <div className="zh-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    Meine Clubs
                  </div>
                  <Link href="/clubs" className="zh-btn" style={{ fontSize: '12px', padding: '7px 14px' }}>
                    Alle Clubs
                  </Link>
                </div>
                {myClubs.length === 0 ? (
                  <div style={{ border: '2px dashed var(--hairline)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '28px', marginBottom: '6px' }}>🏴</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                      Noch kein Club beigetreten
                    </div>
                    <Link href="/clubs" style={{ display: 'inline-block', marginTop: '10px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)' }}>
                      Clubs entdecken →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {myClubs.map((club) => (
                      <Link key={club.id} href={`/clubs/${club.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: 'var(--parchment)', textDecoration: 'none' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid var(--hairline)', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '16px', flexShrink: 0 }}>
                          {club.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--display)', fontSize: '16px', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club.name}</div>
                          {club.location && <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>📍 {club.location}</div>}
                        </div>
                        <span style={{ color: 'var(--accent)' }}>→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="zh-card">
            <h2 className="zh-page-title" style={{ fontSize: '32px' }}>Kein Profil gefunden.</h2>
            <p className="zh-page-lead">Dein Konto besteht, aber das Profil fehlt noch.</p>
            <Link href="/profile/edit" className="zh-btn" style={{ display: 'inline-flex', marginTop: '24px' }}>Profil anlegen →</Link>
          </div>
        )}

      </div>
    </div>
    </DesktopLayout>
  )
}
