'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'gerade eben'
  if (mins < 60) return `vor ${mins} Min.`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `vor ${hrs} Std.`
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const author = post.profiles
  const comments = post.comments ?? []

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    if (!user) { router.push('/auth/login'); return }
    setSubmitting(true)
    await supabase.from('comments').insert({ post_id: post.id, user_id: user.id, content: comment.trim() })
    setComment('')
    router.refresh()
    setSubmitting(false)
  }

  const handleDeletePost = async () => {
    if (!confirm('Post löschen?')) return
    await supabase.from('posts').delete().eq('id', post.id)
    onDelete(post.id)
  }

  return (
    <article className="zh-post-card">
      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <Link href={author ? `/profile/${author.id}` : '#'} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--ink)', overflow: 'hidden', background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '17px' }}>
            {author?.avatar_url
              ? <img src={author.avatar_url} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (author?.name || '?').charAt(0).toUpperCase()
            }
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <Link href={author ? `/profile/${author.id}` : '#'} style={{ fontFamily: 'var(--display)', fontSize: '18px', color: 'var(--ink)', textDecoration: 'none' }}>
            {author?.name || 'Unbekannt'}
          </Link>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
            {author?.location && `📍 ${author.location} · `}{timeAgo(post.created_at)}
          </div>
        </div>
        {user && user.id === post.user_id && (
          <button onClick={handleDeletePost} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '16px', padding: '4px', lineHeight: 1 }} title="Post löschen">✕</button>
        )}
      </div>

      {/* Content */}
      <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'var(--ink-soft)', lineHeight: 1.65, whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
        {post.content}
      </p>

      {/* Comments toggle */}
      <button
        onClick={() => setShowComments((v) => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', padding: 0, marginBottom: showComments ? '14px' : 0 }}
      >
        {comments.length > 0 ? `${comments.length} Kommentar${comments.length !== 1 ? 'e' : ''} ${showComments ? '▲' : '▼'}` : (showComments ? 'Kommentare ▲' : 'Kommentieren')}
      </button>

      {showComments && (
        <div style={{ borderTop: '1px dashed var(--hairline)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {comments.map((c) => {
            const cu = c.profiles
            return (
              <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                <Link href={cu ? `/profile/${cu.id}` : '#'} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid var(--hairline)', overflow: 'hidden', background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '12px' }}>
                    {cu?.avatar_url
                      ? <img src={cu.avatar_url} alt={cu.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (cu?.name || '?').charAt(0).toUpperCase()
                    }
                  </div>
                </Link>
                <div style={{ flex: 1, background: 'var(--parchment)', borderRadius: '10px', padding: '8px 12px' }}>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '15px', color: 'var(--ink)', marginBottom: '3px' }}>{cu?.name || 'Unbekannt'}</div>
                  <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{c.content}</p>
                </div>
              </div>
            )
          })}

          {user ? (
            <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Kommentar schreiben…"
                className="zh-input"
                style={{ flex: 1, fontSize: '14px', padding: '9px 14px' }}
              />
              <button type="submit" disabled={submitting || !comment.trim()} className="zh-btn" style={{ fontSize: '13px', padding: '9px 16px', opacity: (submitting || !comment.trim()) ? 0.6 : 1 }}>
                →
              </button>
            </form>
          ) : (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              <Link href="/auth/login" style={{ color: 'var(--accent)' }}>Anmelden</Link> um zu kommentieren.
            </p>
          )}
        </div>
      )}
    </article>
  )
}

export default function FeedClient({ initialPosts, error }) {
  const { user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [postError, setPostError] = useState(null)

  const handlePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    if (!user) { router.push('/auth/login'); return }
    setSubmitting(true)
    setPostError(null)
    const { error: insertError } = await supabase.from('posts').insert({ user_id: user.id, content: content.trim() })
    if (insertError) { setPostError(insertError.message); setSubmitting(false); return }
    setContent('')
    router.refresh()
    setSubmitting(false)
  }

  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Compose */}
      {user && (
        <div className="zh-card">
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px' }}>
            Was schraubst du gerade?
          </div>
          {postError && <div className="zh-error" style={{ marginBottom: '12px' }}>{postError}</div>}
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Stell dich vor, zeig dein Projekt, frag die Community…"
              className="zh-input"
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={submitting || !content.trim()} className="zh-btn" style={{ fontSize: '14px', opacity: (submitting || !content.trim()) ? 0.6 : 1 }}>
                {submitting ? 'Postet…' : 'Posten →'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="zh-error">{error}</div>}

      {posts.length === 0 ? (
        <div className="zh-card" style={{ textAlign: 'center', padding: '56px' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>✍️</div>
          <p style={{ fontFamily: 'var(--display)', fontSize: '24px', color: 'var(--ink-muted)' }}>
            {user ? 'Sei die erste Person, die postet.' : 'Noch keine Posts.'}
          </p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} onDelete={handleDelete} />)
      )}

    </div>
  )
}
