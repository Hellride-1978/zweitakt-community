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
            <div className="zh-members-grid" style={{ padding: 0 }}>
              {members.map((m) => {
                const latestVehicle = m.vehicles?.[0]
                const initial = (m.name || '?').charAt(0).toUpperCase()
                const since = formatTimeAgo(m.created_at)
                return (
                  <Link key={m.id} href={`/profile/${m.id}`} className="zh-member-card" style={{ textDecoration: 'none' }}>
                    <div className="zh-member-top">
                      <div className="zh-avatar offline">
                        {m.avatar_url
                          ? <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : initial
                        }
                      </div>
                      <div className="zh-member-name">
                        <h4>{m.name || 'Unbekannt'}</h4>
                        <div className="loc">{m.location || 'Community'}</div>
                      </div>
                    </div>
                    {latestVehicle && (
                      <div className="zh-member-project">
                        <div className="label">Fährt</div>
                        <div className="bike">
                          {latestVehicle.title
                            ? `${latestVehicle.make} ${latestVehicle.model} — ${latestVehicle.title}`
                            : `${latestVehicle.make} ${latestVehicle.model}${latestVehicle.year ? ` (${latestVehicle.year})` : ''}`
                          }
                        </div>
                      </div>
                    )}
                    <div className="zh-member-stats">
                      <div className="item">
                        <div className="n">{m.vehicles?.length ?? 0}</div>
                        <div className="k">Bikes</div>
                      </div>
                      <div className="item">
                        <div className="n">{since}</div>
                        <div className="k">dabei</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <aside className="feed-rail">
          <div className="zd-card dark">
            <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Neu hier?</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.0, letterSpacing: 0.3 }}>
              komm in<br/>die crew.
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
