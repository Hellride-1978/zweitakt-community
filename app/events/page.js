import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import EventsList from './EventsList'

function formatTime(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (d.getHours() === 0 && d.getMinutes() === 0) return null
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export default async function EventsPage({ searchParams }) {
  const params = await searchParams
  const filter = params?.filter || 'upcoming'

  let query = supabase
    .from('rides')
    .select('*, profiles(id, name, avatar_url), ride_participants(count)')
    .order('start_date', { ascending: true })

  if (filter === 'upcoming') {
    query = query.gte('start_date', new Date().toISOString())
  }

  const { data: events, error } = await query

  return (
    <DesktopLayout crumb="Ausfahrten">
      {/* ── Desktop feed layout ── */}
      <div className="feed-grid">
        {/* Main column */}
        <div className="feed-col">
          <div className="feed-head">
            <div>
              <div className="zd-mono accent">Ausfahrten</div>
              <h1 className="zd-h1" style={{ marginTop: 6 }}>alle <em>termine.</em></h1>
            </div>
            <div className="filters" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="tab-pills">
                <Link href="/events?filter=upcoming" className={`tab-pill${filter === 'upcoming' ? ' on' : ''}`}>
                  Bevorstehend
                </Link>
                <Link href="/events?filter=all" className={`tab-pill${filter === 'all' ? ' on' : ''}`}>
                  Alle
                </Link>
              </div>
              <Link href="/events/new" className="zd-btn accent" style={{ fontSize: 15, padding: '9px 18px' }}>
                + Termin
              </Link>
            </div>
          </div>

          {error ? (
            <div className="zh-error">{error.message}</div>
          ) : (
            <EventsList events={events ?? []} filter={filter} />
          )}
        </div>

        {/* Right rail */}
        <aside className="feed-rail">
          <div className="zd-card tilt">
            <div className="zd-mono accent" style={{ marginBottom: 8 }}>Nächste Woche</div>
            {events && events.length > 0 ? (
              <div className="zd-list">
                {events.slice(0, 4).map((ev) => {
                  const d = new Date(ev.start_date)
                  const time = formatTime(ev.start_date)
                  return (
                    <div key={ev.id} className="row">
                      <div className="when">
                        <span className="d">{d.toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase()}</span>
                        {time || d.getDate()}
                      </div>
                      <div className="body">
                        <div className="t">{ev.title}</div>
                        {ev.location && <div className="m">{ev.location}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Keine Termine.</p>
            )}
          </div>

          <div className="zd-card dark">
            <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Neu dabei?</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.0, letterSpacing: 0.3 }}>
              erstell deinen<br/>eigenen termin.
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'color-mix(in oklab, var(--cream) 80%, transparent)' }}>
              Ausfahrt, Stammtisch, Schraubertreffen — alles geht.
            </div>
            <Link href="/events/new" className="zd-btn accent" style={{ marginTop: 12, padding: '8px 14px', fontSize: 15, display: 'inline-flex' }}>
              Termin erstellen →
            </Link>
          </div>
        </aside>
      </div>

      {/* ── Mobile layout (hidden on desktop) ── */}
      <style>{`@media(min-width:1024px){.events-mobile{display:none}}`}</style>
    </DesktopLayout>
  )
}
