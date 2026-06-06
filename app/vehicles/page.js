import { createServerClient } from '@/lib/supabase'
import DesktopLayout from '@/components/DesktopLayout'
import VehiclesGrid from './VehiclesGrid'
import VehiclesCreateButton from './VehiclesCreateButton'

export const metadata = {
  title: 'Bikes',
  description: 'Alle Maschinen der Zweitakthoden-Community',
}

export default async function VehiclesPage() {
  const supabase = createServerClient()
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, make, model, title, year, displacement_cc, image_url, user_id, created_at, profiles(id, name, avatar_url)')
    .order('created_at', { ascending: false })

  const ids = (vehicles ?? []).map(v => v.id)
  let likeCounts = {}
  if (ids.length > 0) {
    const { data: likes } = await supabase
      .from('likes')
      .select('target_id')
      .eq('target_type', 'vehicle')
      .in('target_id', ids)
    likes?.forEach(l => { likeCounts[l.target_id] = (likeCounts[l.target_id] || 0) + 1 })
  }

  return (
    <DesktopLayout>
      <div className="feed-col">
        <div className="feed-head">
          <div>
            <div className="zd-mono accent">Bikes</div>
            <h1 className="zd-h1" style={{ marginTop: 6 }}>alle <em>bikes.</em></h1>
          </div>
          <VehiclesCreateButton />
        </div>

        <VehiclesGrid vehicles={vehicles ?? []} likeCounts={likeCounts} />
      </div>
    </DesktopLayout>
  )
}
