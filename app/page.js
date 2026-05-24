import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import HeroActions from '@/components/HeroActions'

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
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Heute'
  if (days === 1) return '1 Tag'
  if (days < 30) return `${days} Tage`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 Mon.'
  if (months < 12) return `${months} Mon.`
  const years = Math.floor(months / 12)
  return `${years} J.`
}

export default async function Home() {
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS]

  const [
    { data: members },
    { data: clubs },
    { data: events },
    { count: memberCount },
    { count: clubCount },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, avatar_url, location, created_at, vehicles(id, make, model, title, year, displacement_cc)')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('clubs')
      .select('id, name, description, location, created_at, club_members(count)')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('rides')
      .select('id, title, start_date, location, profiles(id, name), ride_participants(count)')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(3),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('clubs').select('*', { count: 'exact', head: true }),
  ])

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
          kein stress. kein szene-ding. <em>einfach schrauben.</em>
        </p>

        <HeroActions />

        <div className="zh-hero-stats">
          <div className="zh-stat">
            <div className="zh-stat-num">{memberCount > 0 ? <>{memberCount}<em>+</em></> : '—'}</div>
            <div className="zh-stat-label">Schrauber</div>
          </div>
          <div className="zh-stat">
            <div className="zh-stat-num">{clubCount > 0 ? <>{clubCount}<em>+</em></> : '—'}</div>
            <div className="zh-stat-label">Clubs</div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="zh-ticker" aria-hidden="true">
        <div className="zh-ticker-inner">
          {tickerItems.map((item, i) => (
            <span key={i} className={`zh-ticker-item${item.hot ? ' hot' : ''}`}>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── MANIFEST ── */}
      <section className="zh-manifest">
        <div className="zh-section-mark">Das Statement</div>
        <h2 className="zh-manifest-headline">
          Zweitakt&nbsp;Hoden ist kein Begriff.<br />
          <em>Das ist ein Bauchgefühl.</em>
        </h2>
        <p className="zh-manifest-lead">
          Ein Name mit Augenzwinkern für alle, die Gemisch lieber riechen als erklären —
          auch wenn sie noch nicht genau wissen, was sie da eigentlich tun.
        </p>
      </section>

      {/* ── CREDO ── */}
      <section className="zh-credo">
        <article className="zh-credo-card">
          <span className="num">02 —Worum geht&rsquo;s hier?</span>
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
          <span className="num">03 —Keine Szene. Keine Show.</span>
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
          <span className="num">04 —Mitmachen ist einfach.</span>
          <h3>Wenn du<br />… dann komm.</h3>
          <p className="lede">Wenn du —</p>
          <ul>
            <li>Zweitakt liebst</li>
            <li>schraubst oder anfangen willst</li>
            <li>Lust auf Austausch hast</li>
          </ul>
          <p className="kicker">Dann meld dich. Kein Antrag. Keine Aufnahmegebühr.</p>
        </article>
      </section>

      {/* ── CLOSING ── */}
      <section className="zh-closing">
        <div className="zh-closing-wrap">
          <div>
            <div className="zh-section-mark">Warum das Ganze?</div>
            <h2>Weil keiner<br />allein <em>knattern</em><br />sollte.</h2>
          </div>
          <div>
            <p>Weil viele Zweitakt-Fans alleine vor sich hin schrauben — und das verdammt schade ist.</p>
            <p>Unsere Community soll Leute zusammenbringen, die das gleiche Hobby teilen. Locker, offen und ohne Verpflichtung.</p>
            <p style={{ marginTop: '28px' }}>
              <Link href="/auth/register" className="zh-btn zh-btn-accent">
                Komm in die Crew →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── CLUBS PREVIEW ── */}
      <section className="zh-preview">
        <div className="zh-preview-head">
          <div>
            <div className="mark zh-clubs-mark">Im Rampenlicht</div>
            <h2>crews der <em>woche.</em></h2>
          </div>
          <Link href="/clubs" className="all">Alle Clubs →</Link>
        </div>

        {clubs && clubs.length > 0 ? (
          <div className="zh-clubs-grid">
            {clubs.map((club) => {
              const memberCount = club.club_members?.[0]?.count ?? 0
              const initial = club.name.charAt(0).toUpperCase()
              return (
                <Link key={club.id} href={`/clubs/${club.id}`} className="zh-club-card" style={{ textDecoration: 'none' }}>
                  <div className="zh-club-img">
                    <span className="zh-club-badge">Aktiv</span>
                    {club.logo_url
                      ? <img src={club.logo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (
                        <div className="zh-club-stamp">
                          {initial}<small>{club.location || 'Community'}</small>
                        </div>
                      )
                    }
                    {club.location && <span className="zh-club-plate">{club.location}</span>}
                  </div>
                  <div className="zh-club-body">
                    <h4>{club.name}</h4>
                    {club.description && (
                      <div className="meta">
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {club.description}
                        </span>
                      </div>
                    )}
                    <div className="row">
                      <span>Mitglieder</span>
                      <strong>{memberCount}</strong>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', border: '2px dashed var(--hairline)', borderRadius: '18px' }}>
            <p style={{ fontFamily: 'var(--display)', fontSize: '24px', color: 'var(--ink-muted)' }}>Noch keine Clubs — sei der Erste!</p>
            <Link href="/clubs/new" className="zh-btn" style={{ display: 'inline-flex', marginTop: '20px' }}>Club gründen →</Link>
          </div>
        )}
      </section>

      {/* ── EVENTS PREVIEW ── */}
      {events && events.length > 0 && (
        <section className="zh-preview">
          <div className="zh-preview-head">
            <div>
              <div className="mark" style={{ '--num': '"07 —"' }}>Nächste Termine</div>
              <h2>bald <em>unterwegs.</em></h2>
            </div>
            <Link href="/events" className="all">Alle Events →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((ev) => {
              const participantCount = ev.ride_participants?.[0]?.count ?? 0
              const d = new Date(ev.start_date)
              return (
                <Link key={ev.id} href={`/events/${ev.id}`} className="zh-event-card" style={{ textDecoration: 'none' }}>
                  <div className="zh-event-date">
                    <div className="day">{d.toLocaleDateString('de-DE', { day: 'numeric' })}</div>
                    <div className="month">{d.toLocaleDateString('de-DE', { month: 'short' })}</div>
                  </div>
                  <div className="zh-event-body">
                    <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(18px, 2.2vw, 24px)', lineHeight: 1.1, color: 'var(--ink)', marginBottom: '4px' }}>
                      {ev.title}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                      {ev.location && <span>📍 {ev.location}</span>}
                      <span>👥 {participantCount} dabei</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: '18px' }}>→</div>
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

      {/* ── TEASER ── */}
      <div className="zh-teaser">
        <Link href="/clubs" className="zh-teaser-item">
          <span className="zh-teaser-num">01</span>
          <div className="zh-teaser-icon">
            <svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><path d="M6 17l4-8h6l2 4M10 9h4"/></svg>
          </div>
          <div className="zh-teaser-text">
            <h3>Clubs</h3>
            <p>{clubCount ?? '—'} Clubs aus D, A und CH</p>
          </div>
          <div className="zh-teaser-arrow">→</div>
        </Link>
        <Link href="/profiles" className="zh-teaser-item">
          <span className="zh-teaser-num">02</span>
          <div className="zh-teaser-icon">
            <svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 00-5.4 5.4l-6 6 2 2 6-6a4 4 0 005.4-5.4L14 9l-2-2 2.7-.7z"/></svg>
          </div>
          <div className="zh-teaser-text">
            <h3>Schrauber</h3>
            <p>Zeig deine Garage &amp; Projekte</p>
          </div>
          <div className="zh-teaser-arrow">→</div>
        </Link>
        <Link href="/events" className="zh-teaser-item">
          <span className="zh-teaser-num">03</span>
          <div className="zh-teaser-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>
          </div>
          <div className="zh-teaser-text">
            <h3>Events</h3>
            <p>Treffen, Ausfahrten &amp; Rallyes</p>
          </div>
          <div className="zh-teaser-arrow">→</div>
        </Link>
      </div>

      {/* ── FOOTER ── */}
      <footer className="zh-footer">
        <Link href="/" className="zh-footer-logo">Zweitakt<span>hoden</span></Link>
        <ul className="zh-footer-links">
          <li><Link href="/clubs">Clubs</Link></li>
          <li><Link href="/profiles">Schrauber</Link></li>
          <li><Link href="/events">Events</Link></li>
          <li><Link href="/feed">Feed</Link></li>
        </ul>
        <span className="zh-footer-copy">© 2026 Zweitakthoden</span>
      </footer>
    </>
  )
}
