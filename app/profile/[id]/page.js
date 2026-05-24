import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'

export default async function ProfilePage({ params }) {
  const { id } = await params
  const [
    { data: profile, error },
    { data: vehicles },
    { data: clubs },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('vehicles').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('club_members').select('clubs(id, name, location)').eq('user_id', id).limit(3),
  ])

  if (error || !profile) {
    return (
      <DesktopLayout crumb="Profil">
        <div style={{ padding: '40px 0' }}>
          <div className="zd-card">
            <h1 className="zh-page-title" style={{ fontSize: 36 }}>Profil nicht gefunden.</h1>
            <Link href="/profiles" className="zd-btn outline" style={{ display: 'inline-flex', marginTop: 20 }}>← Alle Schrauber</Link>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  const initial = (profile.name || '?').charAt(0).toUpperCase()
  const myClubs = (clubs ?? []).filter((c) => c.clubs).map((c) => c.clubs)
  const joinedDate = new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  return (
    <DesktopLayout crumb={profile.name || 'Profil'}>
      <div className="profile-grid">
        {/* ── Left: ID card + bio + activity ── */}
        <div className="profile-left">

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
                <div className="n">{myClubs.length}</div>
                <div className="k">Clubs</div>
              </div>
              <div className="s">
                <div className="n">—</div>
                <div className="k">Touren</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.description && (
            <div className="profile-bio">
              <p>{profile.description}</p>
            </div>
          )}

          {/* Clubs */}
          {myClubs.length > 0 && (
            <div className="zd-card">
              <div className="zd-mono accent" style={{ marginBottom: 8 }}>Clubs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myClubs.map((c) => (
                  <Link key={c.id} href={`/clubs/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '8px 0', borderBottom: '1px dashed var(--hairline)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, border: '1.5px solid var(--hairline)', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 13, flexShrink: 0 }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink)' }}>{c.name}</div>
                    <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/profile/edit`} className="zd-btn outline" style={{ flex: 1, fontSize: 15, padding: '10px 16px' }}>
              Bearbeiten
            </Link>
            <Link href="/vehicles/new" className="zd-btn accent" style={{ flex: 1, fontSize: 15, padding: '10px 16px' }}>
              + Bike
            </Link>
          </div>
        </div>

        {/* ── Right: Garage grid ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div>
            <div className="zd-mono accent">Garage</div>
            <h2 className="zd-h2" style={{ marginTop: 6 }}>meine <em>bikes.</em></h2>
          </div>

          {!vehicles || vehicles.length === 0 ? (
            <div className="zd-card" style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 36, marginBottom: 10, opacity: 0.3 }}>🏍️</div>
              <p style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--ink-muted)' }}>Noch keine Fahrzeuge eingetragen.</p>
              <Link href="/vehicles/new" className="zd-btn accent" style={{ display: 'inline-flex', marginTop: 16, fontSize: 15 }}>
                Erstes Bike eintragen →
              </Link>
            </div>
          ) : (
            <div className="garage-grid">
              {vehicles.map((v) => (
                <Link key={v.id} href={`/vehicles/${v.id}`} className="zd-bike" style={{ textDecoration: 'none' }}>
                  <div className="img">
                    {v.image_url
                      ? <img src={v.image_url} alt={`${v.make} ${v.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'var(--display)', fontSize: 40, opacity: 0.3 }}>🏍️</span>
                    }
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
    </DesktopLayout>
  )
}
