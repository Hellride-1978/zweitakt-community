import { createServerClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import TagBadge from '@/components/forum/TagBadge'
import VoteButton from '@/components/forum/VoteButton'
import ReplyForm from '@/components/forum/ReplyForm'
import PostActions from '@/components/forum/PostActions'

export const dynamic = 'force-dynamic'

function relativeDate(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'gerade eben'
  if (mins  < 60) return `vor ${mins} Min.`
  if (hours < 24) return `vor ${hours} Std.`
  if (days  < 7)  return `vor ${days} Tag${days !== 1 ? 'en' : ''}`
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function voteCounts(votes) {
  const up   = (votes ?? []).filter(v => v.value ===  1).length
  const down = (votes ?? []).filter(v => v.value === -1).length
  return { up, down }
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('forum_posts').select('title').eq('id', id).single()
  return { title: data ? `${data.title} · Forum · Zweitakthoden` : 'Forum · Zweitakthoden' }
}

export default async function ForumPostPage({ params }) {
  const { id } = await params
  const supabase = createServerClient()

  // Queries ohne profiles-Join (FK-Hotfix ggf. noch nicht ausgeführt)
  const [{ data: post }, { data: replies }] = await Promise.all([
    supabase
      .from('forum_posts')
      .select(`
        id, title, body, image_url, created_at, user_id,
        forum_votes(value),
        forum_post_tags(forum_tags(id, name))
      `)
      .eq('id', id)
      .single(),

    supabase
      .from('forum_replies')
      .select(`id, body, image_url, created_at, user_id, forum_votes(value)`)
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!post) notFound()

  // Profilnamen separat laden (funktioniert unabhängig vom FK-Setup)
  const userIds = [...new Set([post.user_id, ...(replies ?? []).map(r => r.user_id)])]
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profileRows ?? []).map(p => [p.id, p]))

  // Profile in Posts/Replies einhängen
  post.profiles = profileMap[post.user_id] ?? null
  ;(replies ?? []).forEach(r => { r.profiles = profileMap[r.user_id] ?? null })

  const postVotes = voteCounts(post.forum_votes)
  const postTags  = post.forum_post_tags?.map(pt => pt.forum_tags).filter(Boolean) ?? []

  return (
    <div className="feed-col">

        {/* Back link */}
        <Link href="/forum" className="forum-back-link">← Forum</Link>

        {/* Post */}
        <article style={{
          background: 'var(--cream)',
          border: '1px solid var(--hairline)',
          borderRadius: 16,
          padding: '28px 28px 24px',
          marginBottom: 8,
        }}>
          {postTags.length > 0 && (
            <div className="forum-card-tags" style={{ marginBottom: 14 }}>
              {postTags.map(t => <TagBadge key={t.id} name={t.name} />)}
            </div>
          )}

          <h1 style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(22px, 4vw, 34px)',
            color: 'var(--ink)',
            margin: '0 0 20px',
            lineHeight: 1.2,
          }}>
            {post.title}
          </h1>

          <div className="forum-author-row">
            {post.profiles?.avatar_url ? (
              <Image
                src={post.profiles.avatar_url}
                alt=""
                width={32}
                height={32}
                className="forum-avatar"
              />
            ) : (
              <div className="forum-avatar" style={{ background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--ink-muted)' }}>
                {(post.profiles?.name?.[0] ?? '?').toUpperCase()}
              </div>
            )}
            <div>
              <div className="forum-author-name">
                <Link href={`/profile/${post.user_id}`} style={{ color: 'inherit' }}>
                  {post.profiles?.name ?? 'Unbekannt'}
                </Link>
              </div>
              <div className="forum-author-date">{relativeDate(post.created_at)}</div>
            </div>
          </div>

          <p className="forum-post-body">{post.body}</p>
          {post.image_url && (
            <div className="forum-post-image">
              <img src={post.image_url} alt="" />
            </div>
          )}

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <VoteButton postId={post.id} initialUpvotes={postVotes.up} initialDownvotes={postVotes.down} initialVote={0} />
            <PostActions postId={post.id} authorId={post.user_id} />
          </div>
        </article>

        {/* Replies */}
        {replies && replies.length > 0 && (
          <div style={{
            background: 'var(--cream)',
            border: '1px solid var(--hairline)',
            borderRadius: 16,
            padding: '8px 28px',
            marginBottom: 8,
          }}>
            <p style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--ink-muted)',
              margin: '16px 0 0',
            }}>
              {replies.length} {replies.length === 1 ? 'Antwort' : 'Antworten'}
            </p>

            {replies.map(reply => {
              const replyVotes = voteCounts(reply.forum_votes)
              return (
                <div key={reply.id} className="forum-reply-card">
                  <div className="forum-author-row">
                    {reply.profiles?.avatar_url ? (
                      <Image
                        src={reply.profiles.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        className="forum-avatar"
                      />
                    ) : (
                      <div className="forum-avatar" style={{ background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--ink-muted)' }}>
                        {(reply.profiles?.name?.[0] ?? '?').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="forum-author-name">
                        <Link href={`/profile/${reply.user_id}`} style={{ color: 'inherit' }}>
                          {reply.profiles?.name ?? 'Unbekannt'}
                        </Link>
                      </div>
                      <div className="forum-author-date">{relativeDate(reply.created_at)}</div>
                    </div>
                  </div>

                  <p className="forum-reply-body">{reply.body}</p>
                  {reply.image_url && (
                    <div className="forum-post-image">
                      <img src={reply.image_url} alt="" />
                    </div>
                  )}
                  <VoteButton replyId={reply.id} initialUpvotes={replyVotes.up} initialDownvotes={replyVotes.down} initialVote={0} />
                </div>
              )
            })}
          </div>
        )}

        {/* Reply form */}
        <ReplyForm postId={post.id} />
    </div>
  )
}
