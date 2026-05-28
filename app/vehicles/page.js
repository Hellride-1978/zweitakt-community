import { createServerClient } from '@/lib/supabase'
import VehiclesGrid from './VehiclesGrid'
import Breadcrumb from '@/components/Breadcrumb'

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
    <>
    <Breadcrumb />
    <div className="zh-page">
      <div className="zh-page-inner">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <div className="zh-section-mark">Garage</div>
            <h1 className="zh-page-title" style={{ marginTop: 12 }}>alle <em>bikes.</em></h1>
          </div>
        </div>

        <VehiclesGrid vehicles={vehicles ?? []} likeCounts={likeCounts} />
      </div>
    </div>
    </>

  )
}
