import Link from 'next/link'
import TagBadge from './TagBadge'

function relativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'gerade eben'
  if (mins  < 60) return `vor ${mins} Min.`
  if (hours < 24) return `vor ${hours} Std.`
  if (days  < 7)  return `vor ${days} Tag${days !== 1 ? 'en' : ''}`
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function PostCard({ post }) {
  const tags         = post.forum_post_tags?.map(pt => pt.forum_tags).filter(Boolean) ?? []
  const replyCount   = post.forum_replies?.[0]?.count ?? 0

  return (
    <Link href={`/forum/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article className="forum-card">
        {tags.length > 0 && (
          <div className="forum-card-tags">
            {tags.map(t => <TagBadge key={t.id} name={t.name} />)}
          </div>
        )}

        <h2 className="forum-card-title">{post.title}</h2>

        {post.image_url && (
          <div className="forum-card-image">
            <img src={post.image_url} alt="" />
          </div>
        )}

        <div className="forum-card-meta">
          <span>{post.profiles?.name ?? 'Unbekannt'}</span>
          <span>·</span>
          <span>{replyCount} {replyCount === 1 ? 'Antwort' : 'Antworten'}</span>
          <span>·</span>
          <span>{relativeDate(post.created_at)}</span>
        </div>
      </article>
    </Link>
  )
}
