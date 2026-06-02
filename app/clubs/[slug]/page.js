import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import ClubAdminPanel from '@/components/ClubAdminPanel'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faLocationDot, faMotorcycle, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: club } = await supabase.from('clubs').select('name, description').eq('slug', slug).single()
  if (!club) return { title: 'Klub nicht gefunden' }
  return {
    title: club.name,
    description: club.description?.slice(0, 160) || `${club.name} auf Zweitakthoden`,
  }
}

export default async function ClubPage({ params }) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: club, error } = await supabase
    .from('clubs')
    .select('*, club_memberships(id, user_id, email, role, status, joined_at, invited_by)')
    .eq('slug', slug)
    .single()

  if (error || !club) notFound()

  const allMemberships = club.club_memberships || []
  const memberUserIds = allMemberships.map(m => m.user_id).filter(Boolean)

  // Profiles separat laden (user_id → auth.users, nicht profiles)
  let profilesMap = {}
  if (memberUserIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', memberUserIds)
    profileRows?.forEach(p => { profilesMap[p.id] = p })
  }

  const membershipsWithProfiles = allMemberships.map(m => ({
    ...m,
    profiles: profilesMap[m.user_id] || null,
  }))

  const activeMembers = membershipsWithProfiles.filter(m => m.status === 'active' && m.user_id)
  const pendingMembers = membershipsWithProfiles.filter(m => m.status === 'pending')
  const activeMemberIds = activeMembers.map(m => m.user_id)

  let bikes = []
  if (activeMemberIds.length > 0) {
    const { data: vehicleData } = await supabase
      .from('vehicles')
      .select('id, make, model, title, year, displacement_cc, image_url, user_id, profiles(id, name)')
      .in('user_id', activeMemberIds)
      .order('created_at', { ascending: false })
    bikes = vehicleData || []
  }

  const initial = club.name.charAt(0).toUpperCase()

  return (
    <DesktopLayout crumb={club.name}>
      <div className="zh-page">
        <div className="zh-page-inner">
          <Link href="/clubs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 24, textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} /> Alle Klubs
          </Link>

          {/* ── Header ── */}
          <div className="zd-card" style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%', border: '2.5px solid var(--ink)',
                overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--display)', fontSize: 30, background: 'var(--accent-3)',
              }}>
                {club.logo_url
                  ? <img src={club.logo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initial
                }
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{ fontFamily: 'var(--display)', fontSize: 34, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
                  {club.name}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  {club.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 10 }} /> {club.location}
                    </span>
                  )}
                  {club.founded_year && <span>Gegründet {club.founded_year}</span>}
                  <span>{activeMembers.length} {activeMembers.length === 1 ? 'Mitglied' : 'Mitglieder'}</span>
                </div>
                {club.description && (
                  <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.65, color: 'var(--ink-muted)' }}>
                    {club.description}
                  </p>
                )}
                {(club.links?.instagram || club.links?.website) && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    {club.links.instagram && (
                      <a href={club.links.instagram} target="_blank" rel="noopener noreferrer" className="zd-btn" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13, padding: '8px 14px' }}>
                        <FontAwesomeIcon icon={faInstagram} style={{ fontSize: 14 }} /> Instagram
                      </a>
                    )}
                    {club.links.website && (
                      <a href={club.links.website} target="_blank" rel="noopener noreferrer" className="zd-btn" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13, padding: '8px 14px' }}>
                        <FontAwesomeIcon icon={faGlobe} style={{ fontSize: 13 }} /> Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Two-column: members | bikes ── */}
          <div className="club-detail-grid">
            {/* Members */}
            <div>
              <div className="zd-mono accent" style={{ marginBottom: 4 }}>Besatzung</div>
              <h2 className="zd-h2" style={{ marginBottom: 20 }}>die <em>Crew.</em></h2>
              <div>
                {activeMembers.map((m) => {
                  const prof = m.profiles
                  if (!prof) return null
                  const mInit = (prof.name || '?').charAt(0).toUpperCase()
                  return (
                    <Link key={m.id} href={`/profile/${prof.id}`} style={{ textDecoration: 'none' }}>
                      <div className="club-member-row">
                        <div className="zh-avatar" style={{ width: 38, height: 38, fontSize: 15, flexShrink: 0 }}>
                          {prof.avatar_url
                            ? <img src={prof.avatar_url} alt={prof.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : mInit
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>{prof.name}</div>
                          {m.role === 'admin' && (
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-ink)', marginTop: 2 }}>
                              Admin
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Admin panel: edit button + pending members */}
              <Suspense fallback={null}>
                <ClubAdminPanel
                  clubId={club.id}
                  clubSlug={club.slug}
                  createdBy={club.created_by}
                  pendingMembers={pendingMembers}
                  adminUserIds={activeMembers.filter(m => m.role === 'admin').map(m => m.user_id)}
                />
              </Suspense>
            </div>

            {/* Bikes */}
            <div>
              <div className="zd-mono accent" style={{ marginBottom: 4 }}>Garage</div>
              <h2 className="zd-h2" style={{ marginBottom: 20 }}>die <em>Bikes.</em></h2>
              {bikes.length === 0 ? (
                <div style={{ padding: '40px 24px', border: '2px dashed var(--hairline)', borderRadius: 16, textAlign: 'center' }}>
                  <FontAwesomeIcon icon={faMotorcycle} style={{ fontSize: 32, opacity: 0.2, color: 'var(--ink-muted)', display: 'block', margin: '0 auto 10px' }} />
                  <p style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--ink-muted)', margin: 0 }}>Noch keine Bikes eingetragen.</p>
                </div>
              ) : (
                <div className="garage-grid">
                  {bikes.map((v) => (
                    <Link key={v.id} href={`/vehicles/${v.id}`} className="zd-bike" style={{ textDecoration: 'none' }}>
                      <div className="img">
                        {v.image_url
                          ? <img src={v.image_url} alt={`${v.make} ${v.model}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          : <FontAwesomeIcon icon={faMotorcycle} style={{ fontSize: 34, opacity: 0.25, color: 'var(--ink-muted)' }} />
                        }
                      </div>
                      <div className="info">
                        <div className="model">
                          {v.make} <span style={{ color: 'var(--accent-ink)' }}>{v.model}</span>
                        </div>
                        {v.title && (
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-ink)', marginTop: 4 }}>
                            {v.title}
                          </div>
                        )}
                        <div className="yr">
                          {[v.year, v.displacement_cc ? `${v.displacement_cc} ccm` : null].filter(Boolean).join(' · ') || '—'}
                        </div>
                        {v.profiles?.name && (
                          <div style={{ marginTop: 6, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1px', color: 'var(--ink-muted)' }}>
                            {v.profiles.name}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
