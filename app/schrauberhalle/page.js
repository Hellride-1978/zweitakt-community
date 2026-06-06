import { createServerClient } from '@/lib/supabase'
import DesktopLayout from '@/components/DesktopLayout'
import GarageGrid from './GarageGrid'

export const metadata = {
  title: 'Schrauberhalle',
  description: 'Die Schrauberhalle – private Werkstätten und Garagen in der Community. Teilen, Helfen, Weiterkommen.',
}

export default async function SchrauberhallenPage() {
  const supabase = createServerClient()

  const { data: garages } = await supabase
    .from('garage')
    .select(`
      id, description, photo_1, photo_2, photo_3, photo_4, photo_5, created_at, user_id,
      profiles ( id, name, avatar_url, location, lat, lng )
    `)
    .order('created_at', { ascending: false })

  const userIds = (garages || []).map(g => g.user_id)
  let skillsMap = {}
  if (userIds.length > 0) {
    const { data: allSkills } = await supabase
      .from('garage_skills')
      .select('user_id, skill')
      .in('user_id', userIds)
    allSkills?.forEach(({ user_id, skill }) => {
      if (!skillsMap[user_id]) skillsMap[user_id] = []
      skillsMap[user_id].push(skill)
    })
  }

  const garagesWithSkills = (garages || []).map(g => ({
    ...g,
    skills: skillsMap[g.user_id] || [],
  }))

  return (
    <DesktopLayout crumb="Schrauberhalle">
      <div className="feed-col">
        <div className="feed-head">
          <div>
            <div className="zd-mono accent">Schrauberhalle</div>
            <h1 className="zd-h1" style={{ marginTop: 6 }}>Teilen, Helfen,<br /><em>Weiterkommen.</em></h1>
          </div>
        </div>

        <p style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 680 }}>
          Werkzeug, Platz und Know-how sind da, um geteilt zu werden! In der Schrauberhalle vernetzen wir private Werkstätten und Garagen im Umkreis. Stell deinen Schraubplatz vor, biete Spezialwerkzeuge oder Maschinen an, die du für Gleichgesinnte zur Verfügung stellst, oder finde Hilfe bei kniffligen Projekten.
        </p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.65, maxWidth: 680 }}>
          Kein Kommerz – einfach eine Community, die sich gegenseitig den Weg zurück auf die Straße ebnet.
        </p>

        <GarageGrid garages={garagesWithSkills} />
      </div>
    </DesktopLayout>
  )
}
