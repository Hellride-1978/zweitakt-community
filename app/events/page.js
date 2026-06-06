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

  let likeCounts = {}
  if (!error && events?.length > 0) {
    const ids = events.map(e => e.id)
    const { data: likes } = await supabase
      .from('likes')
      .select('target_id')
      .eq('target_type', 'event')
      .in('target_id', ids)
    likes?.forEach(l => { likeCounts[l.target_id] = (likeCounts[l.target_id] || 0) + 1 })
  }

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
