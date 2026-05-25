import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Heute'
  if (days === 1) return '1 Tag'
  if (days < 30) return `${days} Tage`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 Mon.'
  if (months < 12) return `${months} Mon.`
  return `${Math.floor(months / 12)} J.`
}

export default async function ProfilesPage() {
  const { data: members } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, location, created_at, vehicles(id, make, model, title, year)')
    .order('created_at', { ascending: false })

  return (
    <DesktopLayout>
      <div className="feed-grid">
        {/* Main column */}
        <div className="feed-col">
          <div className="feed-head">
            <div>
              <div className="zd-mono accent">Schrauber</div>
              <h1 className="zd-h1" style={{ marginTop: 6 }}>die <em>crew.</em></h1>
            </div>
          </div>

          {!members || members.length === 0 ? (
            <div className="zd-card" style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)' }}>
              <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)' }}>
                Noch keine Mitglieder.
              </p>
              <Link href="/auth/register" className="zd-btn accent" style={{ display: 'inline-flex', marginTop: 20 }}>
                Jetzt mitmachen →
              </Link>
            </div>
          ) : (
            members.map((m) => {
              const initial = (m.name || '?').charAt(0).toUpperCase()
              const since = formatTimeAgo(m.created_at)
              const bikeCount = m.vehicles?.length ?? 0
              const latestBike = m.vehicles?.[0]

              return (
                <Link key={m.id} href={`/profile/${m.id}`} className="zd-ride" style={{ textDecoration: 'none' }}>
                  {/* Avatar block — same position as date block in events */}
                  <div className="when-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="zh-avatar offline" style={{ width: 52, height: 52, fontSize: 20, flexShrink: 0 }}>
                      {m.avatar_url
                        ? <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : initial
                      }
                    </div>
                  </div>

                  {/* Info */}
                  <div className="body">
                    <div className="title">{m.name || 'Unbekannt'}</div>
                    <div className="meta">
                      {m.location && <span>📍 {m.location}</span>}
                      {m.location && bikeCount > 0 && <span className="sep" />}
                      {bikeCount > 0 && <span>{bikeCount} {bikeCount === 1 ? 'Bike' : 'Bikes'}</span>}
                      <span className="sep" />
                      <span>dabei seit {since}</span>
                    </div>
                    {latestBike && (
                      <div className="desc">
                        {latestBike.title
                          ? `${latestBike.make} ${latestBike.model} — ${latestBike.title}`
                          : `${latestBike.make} ${latestBike.model}${latestBike.year ? ` (${latestBike.year})` : ''}`
                        }
                      </div>
                    )}
                  </div>

                  <div className="cta-col">
                    <span className="zd-mono accent">→</span>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Right rail */}
        <aside className="feed-rail">
          <div className="zd-card dark">
            <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Neu hier?</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.0, letterSpacing: 0.3 }}>
              komm in<br />die crew.
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'color-mix(in oklab, var(--cream) 80%, transparent)' }}>
              Kein Antrag. Keine Aufnahmegebühr. Einfach mitmachen.
            </div>
            <Link href="/auth/register" className="zd-btn accent" style={{ marginTop: 12, padding: '8px 14px', fontSize: 15, display: 'inline-flex' }}>
              Registrieren →
            </Link>
          </div>
        </aside>
      </div>
    </DesktopLayout>
  )
}
