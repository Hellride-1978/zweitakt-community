import { supabase } from '@/lib/supabase'
import FeedClient from './FeedClient'
import DesktopLayout from '@/components/DesktopLayout'

export default async function FeedPage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, profiles(id, name, avatar_url, location), comments(id, content, created_at, profiles(id, name, avatar_url))')
    .order('created_at', { ascending: false })
    .limit(40)

  return (
    <DesktopLayout crumb="Community Feed">
      <div style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 28 }}>
          <div className="zd-mono accent">Community</div>
          <h1 className="zd-h1" style={{ marginTop: 6 }}>was läuft <em>gerade.</em></h1>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 10 }}>
            Berichte aus der Garage, Vorstellungen und Neuigkeiten.
          </p>
        </div>
        <FeedClient initialPosts={posts ?? []} error={error?.message} />
      </div>
    </DesktopLayout>
  )
}
