import { supabase } from '@/lib/supabase'
import DesktopLayout from '@/components/DesktopLayout'
import EventsList from './EventsList'
import EventsCreateButton from './EventsCreateButton'

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

  // [DEAKTIVIERT 2026-09: likes] Like-Zähler werden nicht mehr geladen.
  // Bei leerem Objekt rendert EventsList keine Herz-Badges.
  const likeCounts = {}

  return (
    <DesktopLayout>
      <div className="feed-col">
        <div className="feed-head">
          <div>
            <div className="zd-mono accent">Ausfahrten</div>
            <h1 className="zd-h1" style={{ marginTop: 6 }}>alle <em>termine.</em></h1>
          </div>
          <EventsCreateButton />
        </div>

        {error ? (
          <div className="zh-error">{error.message}</div>
        ) : (
          <EventsList events={events ?? []} filter={filter} likeCounts={likeCounts} />
        )}
      </div>
    </DesktopLayout>
  )
}
