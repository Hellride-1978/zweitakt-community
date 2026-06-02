import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faPlus, faLocationDot, faUsers } from '@fortawesome/free-solid-svg-icons'

export const metadata = {
  title: 'Klubs',
  description: 'Alle Motorrad-Klubs und Schrauber-Gruppen auf Zweitakthoden.',
}

export default async function ClubsPage() {
  const supabase = createServerClient()

  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, slug, name, description, logo_url, location, founded_year, club_memberships(id, status)')
    .order('created_at', { ascending: false })

  return (
    <DesktopLayout crumb="Klubs">
      <div className="zh-page">
        <div className="zh-page-inner">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
            <div>
              <div className="zd-mono accent">Community</div>
              <h1 className="zh-page-title" style={{ marginTop: 6 }}>die <em>Klubs.</em></h1>
            </div>
            <Link href="/clubs/new" className="zd-btn accent" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} /> Klub gründen
            </Link>
          </div>

          {!clubs || clubs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', border: '2px dashed var(--hairline)', borderRadius: 18 }}>
              <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)' }}>
                Noch keine Klubs — sei der Erste!
              </p>
              <Link href="/clubs/new" className="zd-btn accent" style={{ display: 'inline-flex', marginTop: 20, gap: 8 }}>
                Klub gründen <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} />
              </Link>
            </div>
          ) : (
            <div className="zh-clubs-grid">
              {clubs.map((club) => {
                const memberCount = (club.club_memberships || []).filter(m => m.status === 'active').length
                const initial = club.name.charAt(0).toUpperCase()
                return (
                  <Link key={club.id} href={`/clubs/${club.slug}`} className="zh-club-list-card" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        border: '2px solid var(--ink)', overflow: 'hidden', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--display)', fontSize: 20,
                        background: 'var(--accent-3)', color: 'var(--ink)',
                      }}>
                        {club.logo_url
                          ? <img src={club.logo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : initial
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {club.name}
                        </div>
                        {club.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                            <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 9 }} /> {club.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {club.description && (
                      <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {club.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 'auto' }}>
                      <FontAwesomeIcon icon={faUsers} style={{ fontSize: 10 }} />
                      {memberCount} {memberCount === 1 ? 'Mitglied' : 'Mitglieder'}
                      {club.founded_year && <><span style={{ margin: '0 4px' }}>·</span> seit {club.founded_year}</>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DesktopLayout>
  )
}
