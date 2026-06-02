import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import MembersGrid from './MembersGrid'
import DesktopLayout from '@/components/DesktopLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default async function ProfilesPage() {
  const supabase = createServerClient()
  const { data: members } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, location, plz, lat, lng, last_seen, created_at, vehicles(id, make, model, title, year)')
    .order('created_at', { ascending: false })

  return (
    <DesktopLayout crumb="Schrauber">
    <div className="zh-page">
      <div className="zh-page-inner">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <div className="zh-section-mark zh-members-mark">Schrauber</div>
            <h1 className="zh-page-title" style={{ marginTop: 12 }}>die <em>crew.</em></h1>
          </div>
        </div>

        {!members || members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)', borderRadius: 18 }}>
            <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)' }}>
              Noch keine Mitglieder.
            </p>
            <Link href="/auth/register" className="zh-btn" style={{ display: 'inline-flex', marginTop: 20, gap: 8 }}>
              Jetzt mitmachen <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} />
            </Link>
          </div>
        ) : (
          <MembersGrid members={members} />
        )}
      </div>
    </div>
    </DesktopLayout>
  )
}
