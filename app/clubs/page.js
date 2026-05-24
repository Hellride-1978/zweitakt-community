import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'

export const dynamic = 'force-dynamic'

export default async function ClubsPage() {
  const supabase = createServerClient()
  const { data: clubs, error } = await supabase
    .from('clubs')
    .select('*, profiles(id, name), club_members(count)')
    .order('created_at', { ascending: false })

  return (
    <DesktopLayout crumb="Clubs">
      <div className="club-grid">
        {/* Main column */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="club-header-row">
            <div>
              <div className="zd-mono accent">Clubs</div>
              <h1 className="zd-h1" style={{ marginTop: 6, fontSize: 48 }}>alle <em>clubs.</em></h1>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/clubs/new" className="zd-btn accent">+ Club gründen</Link>
            </div>
          </div>

          {error ? (
            <div className="zh-error">{error.message}</div>
          ) : !clubs || clubs.length === 0 ? (
            <div className="zd-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🏴</div>
              <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)' }}>Noch keine Clubs gegründet.</p>
              <Link href="/clubs/new" className="zd-btn accent" style={{ display: 'inline-flex', marginTop: 20 }}>
                Ersten Club gründen →
              </Link>
            </div>
          ) : (
            <div className="members-grid">
              {clubs.map((club) => {
                const memberCount = club.club_members?.[0]?.count ?? 0
                return (
                  <Link key={club.id} href={`/clubs/${club.id}`} className="zd-mem" style={{ textDecoration: 'none', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                      <div className="zh-avatar offline" style={{ width: 42, height: 42, fontSize: 18, flexShrink: 0, borderRadius: 10, overflow: 'hidden' }}>
                        {(club.image_url || club.logo_url)
                          ? <img src={club.image_url || club.logo_url} alt={club.name} />
                          : club.name.charAt(0).toUpperCase()
                        }
                      </div>
                      <div className="who" style={{ flex: 1, minWidth: 0 }}>
                        <div className="nm">{club.name}</div>
                        <div className="rl">{memberCount} Mitglieder{club.location ? ` · ${club.location}` : ''}</div>
                      </div>
                    </div>
                    {club.description && (
                      <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                        {club.description}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right rail */}
        <aside className="club-rail" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="zd-mono accent">Info</div>
          <div className="zd-card tilt">
            <div className="zd-mono accent" style={{ marginBottom: 8 }}>Community</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 20, lineHeight: 1.1, letterSpacing: 0.3 }}>
              {clubs?.length ?? 0} Clubs in der Zweitakthoden-Community.
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Gründ deinen eigenen Club oder tritt einem bestehenden bei.
            </div>
          </div>
          <div className="zd-card dark">
            <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Tipp</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 20, lineHeight: 1.0, letterSpacing: 0.3 }}>
              kein passender club? gründ deinen.
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'color-mix(in oklab, var(--cream) 80%, transparent)' }}>
              In 2 Minuten angelegt. Lade deine Crew direkt ein.
            </div>
            <Link href="/clubs/new" className="zd-btn accent" style={{ marginTop: 12, padding: '8px 14px', fontSize: 15, display: 'inline-flex' }}>
              Club gründen →
            </Link>
          </div>
        </aside>
      </div>
    </DesktopLayout>
  )
}
