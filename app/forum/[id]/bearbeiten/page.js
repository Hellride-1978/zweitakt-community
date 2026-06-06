'use client'

import { useActionState, useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import { updatePost } from '@/app/forum/actions'
import FormError from '@/components/FormError'

export default function BearbeitenPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id: postId } = useParams()

  const [session,       setSession]       = useState(null)
  const [brandTags,     setBrandTags]     = useState([])
  const [topicTags,     setTopicTags]     = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedTopics,setSelectedTopics]= useState([])
  const [title,         setTitle]         = useState('')
  const [body,          setBody]          = useState('')
  const [dataLoaded,    setDataLoaded]    = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [user, loading])

  useEffect(() => {
    if (!postId) return

    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))

    Promise.all([
      supabase.from('forum_posts')
        .select('title, body, user_id, forum_post_tags(tag_id)')
        .eq('id', postId).single(),
      supabase.from('forum_tags').select('id, name, category').order('name'),
    ]).then(([{ data: post }, { data: tags }]) => {
      if (!post) { router.replace('/forum'); return }

      supabase.auth.getSession().then(({ data: s }) => {
        if (s.session?.user?.id !== post.user_id) {
          router.replace(`/forum/${postId}`)
        }
      })

      setTitle(post.title)
      setBody(post.body)

      const brands = (tags ?? []).filter(t => t.category === 'brand')
      const topics = (tags ?? []).filter(t => t.category !== 'brand')
      setBrandTags(brands)
      setTopicTags(topics)

      const currentTagIds = (post.forum_post_tags ?? []).map(pt => pt.tag_id)
      const currentBrand  = brands.find(b => currentTagIds.includes(b.id))
      setSelectedBrand(currentBrand?.id ?? '')
      setSelectedTopics(currentTagIds.filter(id => topics.some(t => t.id === id)))
      setDataLoaded(true)
    })
  }, [postId])

  const boundAction = useMemo(
    () => session ? updatePost.bind(null, session.access_token) : null,
    [session?.access_token]
  )

  const [state, dispatch, pending] = useActionState(
    boundAction ?? (async () => ({ error: 'Nicht eingeloggt' })),
    null
  )

  const toggleTopic = (id) =>
    setSelectedTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  if (loading || !dataLoaded) return null

  return (
    <div className="feed-col" style={{ maxWidth: 680 }}>

        <a href={`/forum/${postId}`} className="forum-back-link">← Zurück</a>

        <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--ink)', lineHeight: 1, margin: '0 0 36px' }}>
          Beitrag bearbeiten
        </h1>

        <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <input type="hidden" name="postId" value={postId} />
          {selectedBrand  && <input type="hidden" name="tags" value={selectedBrand} />}
          {selectedTopics.map(id => <input key={id} type="hidden" name="tags" value={id} />)}

          <FormError message={state?.error} className="forum-error" />

          <div>
            <label className="forum-label" htmlFor="edit-title">Titel / Frage</label>
            <input
              id="edit-title"
              name="title"
              type="text"
              className="forum-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={pending}
              maxLength={200}
            />
          </div>

          <div>
            <label className="forum-label" htmlFor="edit-body">Details</label>
            <textarea
              id="edit-body"
              name="body"
              className="forum-textarea"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              required
              disabled={pending}
              style={{ minHeight: 180 }}
            />
          </div>

          <div>
            <label className="forum-label" htmlFor="edit-brand">Marke (optional)</label>
            <select
              id="edit-brand"
              className="forum-select-full"
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              disabled={pending}
            >
              <option value="">– Marke wählen –</option>
              {brandTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>

          {topicTags.length > 0 && (
            <div>
              <label className="forum-label">Thema (optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topicTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTopic(tag.id)}
                    className={`forum-tag-btn${selectedTopics.includes(tag.id) ? ' active' : ''}`}
                    disabled={pending}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
            <button type="submit" disabled={pending || !session} className="forum-submit-btn">
              {pending ? 'Wird gespeichert…' : 'Änderungen speichern →'}
            </button>
          </div>
        </form>
    </div>
  )
}
