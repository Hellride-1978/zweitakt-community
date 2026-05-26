import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import HeroActions from '@/components/HeroActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faUsers } from '@fortawesome/free-solid-svg-icons'

async function getReverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'User-Agent': 'zweitakthoden/1.0' }, next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const a = data.address || {}
    const street = [a.road, a.house_number].filter(Boolean).join(' ')
    const place = [a.postcode, a.city || a.town || a.village || a.municipality].filter(Boolean).join(' ')
    const parts = [street, place].filter(Boolean)
    return parts.length ? parts.join(', ') : (data.display_name?.split(',').slice(0, 2).join(',').trim() || null)
  } catch {
    return null
  }
}

const TICKER_ITEMS = [
  { label: 'Simson S51',        hot: true  },
  { label: 'Puch Maxi',         hot: false },
  { label: 'Zündapp Belmondo',  hot: true  },
  { label: 'Piaggio Ciao',      hot: false },
  { label: 'Tomos A35',         hot: true  },
  { label: 'MZ ETZ 125',        hot: false },
  { label: 'Kreidler Florett',  hot: true  },
  { label: 'Hercules Prima',    hot: false },
  { label: 'Sachs 503',         hot: true  },
  { label: 'Vespa 50 S',        hot: false },
]

function formatTimeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.round((todayStart - dateStart) / 86400000)
  if (days === 0) return 'Heute'
  if (days === 1) return 'Gestern'
  if (days < 30) return `${days} Tage`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 Mon.'
  if (months < 12) return `${months} Mon.`
  const years = Math.floor(months / 12)
  return `${years} J.`
}

export default async function Home() {
  const supabase = createServerClient()
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS]

  const [
    { data: members },
    { data: events },
    { count: memberCount },
    { count: eventCount },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, avatar_url, location, created_at, vehicles(id, make, model, title, year, displacement_cc)')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('rides')
      .select('id, title, start_date, location, location_lat, location_lng, description, max_participants, profiles(id, name), ride_participants(count)')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(3),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('rides').select('*', { count: 'exact', head: true }),
  ])

  const eventAddresses = {}
  if (events) {
    await Promise.all(
      events.map(async (ev) => {
        if (ev.location_lat && ev.location_lng) {
          eventAddresses[ev.id] = await getReverseGeocode(ev.location_lat, ev.location_lng)
        }
      })
    )
  }

  return (
    <>
      {/* ── HERO ── */}
      <section className="zh-hero">
        <div className="zh-bubble-stack" aria-label="Zweitakthoden Community">
          <span className="line l1">ZWEITAKT</span>
          <span className="line l2">HODEN</span>
          <span className="line l3">COMMUNITY.</span>
        </div>

        <p className="zh-hero-tagline">
          Weil viele Zweitakt-Fans alleine vor sich hin schrauben — und das verdammt schade ist.<br /><br />
          Unsere Community soll Leute zusammenbringen, die das gleiche Hobby teilen. Locker, offen und ohne Verpflichtung.
        </p>

        <HeroActions />

        <div className="zh-hero-stats">
          <div className="zh-stat">
            <div className="zh-stat-num">{memberCount > 0 ? <>{memberCount}<em>+</em></> : '—'}</div>
            <div className="zh-stat-label">Schrauber</div>
          </div>
          <div className="zh-stat">
            <div className="zh-stat-num">{eventCount > 0 ? <>{eventCount}<em>+</em></> : '—'}</div>
            <div className="zh-stat-label">Termine</div>
          </div>
        </div>
      </section>



      {/* ── CREDO ── */}
      <section className="zh-credo">
        <article className="zh-credo-card">
          <span className="num">Worum geht&rsquo;s hier?</span>
          <h3>Schrauben.<br />Fahren.<br />Bock haben.</h3>
          <p className="lede">Kurz gesagt: Zweitakt, Schrauben und gemeinsam Bock haben. Bei Zweitakt Hoden treffen sich Leute, die —</p>
          <ul>
            <li>gerne schrauben (oder es lernen wollen)</li>
            <li>lieber machen als diskutieren</li>
            <li>keinen Stress mit Fehlern haben</li>
          </ul>
          <p className="kicker">Marke, Hubraum, Erfahrung? Zweitrangig. Hauptsache Zweitakt.</p>
        </article>
        <article className="zh-credo-card">
          <span className="num">Keine Szene. Keine Show.</span>
          <h3>Garage statt Gallery.</h3>
          <p className="lede">Bei Zweitakt Hoden geht&rsquo;s <strong>nicht</strong> um —</p>
          <ul>
            <li>perfekte Builds</li>
            <li>PS-Vergleiche</li>
            <li>Instagram-Tuning</li>
          </ul>
          <p className="kicker">Sondern um Garage, Austausch und ehrliches Schrauben.</p>
        </article>
        <article className="zh-credo-card">
          <span className="num">Mitmachen ist einfach.</span>
          <h3>Wenn du<br />… dann komm.</h3>
          <p className="lede">Wenn du —</p>
          <ul>
            <li>Zweitakt liebst</li>
            <li>schraubst oder anfangen willst</li>
            <li>Lust auf Austausch hast</li>
          </ul>
          <p className="kicker">Dann meld dich an. Kein Antrag. Keine Aufnahmegebühr.</p>
        </article>
      </section>


      {/* ── EVENTS PREVIEW ── */}
      {events && events.length > 0 && (
        <section className="zh-preview">
          <div className="zh-preview-head">
            <div>
              <div className="mark">Nächste Termine</div>
              <h2>bald <em>unterwegs.</em></h2>
            </div>
            <Link href="/events" className="all">Alle Termine →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((ev) => {
              const participantCount = ev.ride_participants?.[0]?.count ?? 0
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
                    <div className="meta">
                      <FontAwesomeIcon icon={faUsers} style={{ fontSize: 11, marginRight: 4 }} />{participantCount}{ev.max_participants ? ` / ${ev.max_participants}` : ''}
                    </div>
                    {(ev.location || eventAddresses[ev.id]) && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
                        <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 13, color: 'var(--ink-muted)', flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)' }}>
                          {ev.location && <strong style={{ color: 'var(--ink)' }}>{ev.location}</strong>}
                          {ev.location && eventAddresses[ev.id] && <br />}
                          {eventAddresses[ev.id] && <span style={{ color: 'var(--ink-muted)' }}>{eventAddresses[ev.id]}</span>}
                        </span>
                      </div>
                    )}
                    {ev.description && (
                      <div className="desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ev.description}
                      </div>
                    )}
                  </div>
                  <div className="cta-col">
                    <span className="zd-mono accent">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── MEMBERS PREVIEW ── */}
      <section className="zh-preview zh-members">
        <div className="zh-preview-head">
          <div>
            <div className="mark zh-members-mark">Frisch aus der Garage</div>
            <h2>neu in der <em>crew.</em></h2>
          </div>
          <Link href="/profiles" className="all">Alle Schrauber →</Link>
        </div>

        {members && members.length > 0 ? (
          <div className="zh-members-grid">
            {members.map((m) => {
              const latestVehicle = m.vehicles?.[0]
              const initial = (m.name || '?').charAt(0).toUpperCase()
              const since = formatTimeAgo(m.created_at)
              return (
                <Link key={m.id} href={`/profile/${m.id}`} className="zh-member-card" style={{ textDecoration: 'none' }}>
                  <div className="zh-member-top">
                    <div className="zh-avatar">
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
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', border: '2px dashed var(--hairline)', borderRadius: '18px' }}>
            <p style={{ fontFamily: 'var(--display)', fontSize: '24px', color: 'var(--ink-muted)' }}>Noch keine Mitglieder — registrier dich!</p>
            <Link href="/auth/register" className="zh-btn" style={{ display: 'inline-flex', marginTop: '20px' }}>Dabei sein →</Link>
          </div>
        )}
      </section>


      {/* ── FOOTER ── */}
      <footer className="zh-footer">
        <Link href="/" className="zh-footer-logo">Zweitakt<span>hoden</span></Link>
        <ul className="zh-footer-links">
          <li><Link href="/events">Termine</Link></li>
          <li><Link href="/vehicles">Garage</Link></li>
          <li><Link href="/auth/register">Registrieren</Link></li>
        </ul>
        <span className="zh-footer-copy">© 2026 Zweitakthoden</span>
      </footer>
    </>
  )
}
