import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import HeroActions from '@/components/HeroActions'
import ContactForm from '@/components/ContactForm'
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
    { data: vehicles },
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
    supabase
      .from('vehicles')
      .select('id, make, model, title, year, displacement_cc, image_url, profiles(id, name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('rides').select('*', { count: 'exact', head: true }).gte('start_date', new Date().toISOString()),
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
        <h1 className="zh-bubble-stack">
          <span className="line l1">ZWEITAKT</span>
          <span className="line l2">HODEN</span>
          <span className="line l3">COMMUNITY.</span>
        </h1>

        <p className="zh-hero-tagline">
          Weil viele Zweitakt-Fans alleine vor sich hin schrauben — und das verdammt schade ist.<br /><br />
          Unsere Community soll Leute zusammenbringen, die das gleiche Hobby teilen. Locker, offen und ohne Verpflichtung.
        </p>

        <HeroActions />

        <div className="zh-hero-stats">
          <Link href="/profiles" className="zh-stat zh-stat-link">
            <div className="zh-stat-num">{memberCount > 0 ? <>{memberCount}<em>+</em></> : '—'}</div>
            <div className="zh-stat-label">Schrauber</div>
          </Link>
          <Link href="/events" className="zh-stat zh-stat-link">
            <div className="zh-stat-num">{eventCount > 0 ? <>{eventCount}<em>+</em></> : '—'}</div>
            <div className="zh-stat-label">Termine</div>
          </Link>
        </div>
      </section>



      {/* ── BIKES PREVIEW ── */}
      {vehicles && vehicles.length > 0 && (
        <section className="zh-preview zh-bikes-preview">
          <div className="zh-preview-head">
            <div>
              <div className="mark">Frisch aus der Garage</div>
              <h2>aktuelle <em>Bikes.</em></h2>
            </div>
            <Link href="/vehicles" className="all">Alle Bikes →</Link>
          </div>
          <div className="zh-bikes-grid">
            {vehicles.map((v) => {
              const image = v.image_url ?? null
              const ownerInitial = (v.profiles?.name || '?').charAt(0).toUpperCase()
              return (
                <Link key={v.id} href={`/vehicles/${v.id}`} className="zh-bike-card" style={{ textDecoration: 'none' }}>
                  <div className="zh-bike-img">
                    {image
                      ? <Image src={image} alt={`${v.make} ${v.model}`} fill sizes="(max-width: 640px) 100vw, 280px" style={{ objectFit: 'cover' }} />
                      : <span className="zh-bike-img-placeholder">{v.make?.[0] ?? '?'}</span>
                    }
                  </div>
                  <div className="zh-bike-body">
                    <div className="zh-bike-name">
                      {v.make} {v.model}
                      {v.title && <span className="zh-bike-title">— {v.title}</span>}
                    </div>
                    <div className="zh-bike-meta">
                      {v.year && <span>{v.year}</span>}
                      {v.year && v.displacement_cc && <span className="zh-bike-dot">·</span>}
                      {v.displacement_cc && <span>{v.displacement_cc} cc</span>}
                    </div>
                  </div>
                  <div className="zh-bike-footer">
                    <div className="zh-avatar offline" style={{ width: 26, height: 26, fontSize: 11, flexShrink: 0 }}>
                      {v.profiles?.avatar_url
                        ? <Image src={v.profiles.avatar_url} alt={v.profiles.name} width={26} height={26} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                        : ownerInitial
                      }
                    </div>
                    <span className="zh-bike-owner">{v.profiles?.name || 'Unbekannt'}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

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
          <div className="events-card-grid">
            {events.map((ev) => {
              const participantCount = ev.ride_participants?.[0]?.count ?? 0
              const d = new Date(ev.start_date)
              const weekday = d.toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase()
              const month = d.toLocaleDateString('de-DE', { month: 'short' })
              const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0
              const time = hasTime ? d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : null
              return (
                <Link key={ev.id} href={`/events/${ev.id}`} className="ec">
                  <div className="ec-head">
                    <span className="ec-day">{weekday}</span>
                    <span className="ec-num">{d.getDate()}</span>
                    <span className="ec-mon">{month}</span>
                    {time && <span className="ec-time">{time}</span>}
                  </div>
                  <div className="ec-body">
                    <div className="ec-title">{ev.title}</div>
                    <div className="ec-meta">
                      <FontAwesomeIcon icon={faUsers} style={{ fontSize: 10 }} />
                      <span>{participantCount}{ev.max_participants ? ` / ${ev.max_participants}` : ''}</span>
                    </div>
                    {(ev.location || eventAddresses[ev.id]) && (
                      <div className="ec-loc">
                        <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 12, color: 'var(--ink-muted)', flexShrink: 0, marginTop: 1 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {ev.location && <span>{ev.location}</span>}
                          {eventAddresses[ev.id] && (
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.2, color: 'var(--ink-muted)' }}>
                              {eventAddresses[ev.id]}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {ev.description && (
                      <div className="ec-desc">{ev.description}</div>
                    )}
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
                        ? <Image src={m.avatar_url} alt={m.name} width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover' }} />
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

      <ContactForm />

    </>
  )
}
