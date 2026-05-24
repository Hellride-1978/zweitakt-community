import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import EventsList from './EventsList'

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
    <DesktopLayout>
      <div className="feed-grid">
        {/* Main column */}
        <div className="feed-col">
          <div className="feed-head">
            <div>
              <div className="zd-mono accent">Ausfahrten</div>
              <h1 className="zd-h1" style={{ marginTop: 6 }}>alle <em>termine.</em></h1>
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
