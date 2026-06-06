'use client'

import { useActionState, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import { createPost } from '@/app/forum/actions'
import FormError from '@/components/FormError'
import ForumImageUpload from '@/components/forum/ForumImageUpload'

export default function NeueFragePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [session,       setSession]       = useState(null)
  const [brandTags,     setBrandTags]     = useState([])
  const [topicTags,     setTopicTags]     = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedTopics,setSelectedTopics]= useState([])
  const [title,         setTitle]         = useState('')
  const [body,          setBody]          = useState('')
  const [imageUrl,      setImageUrl]      = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/forum/neu')
  }, [user, loading])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    supabase.from('forum_tags').select('id, name, category').order('name').then(({ data }) => {
      setBrandTags((data ?? []).filter(t => t.category === 'brand'))
      setTopicTags((data ?? []).filter(t => t.category !== 'brand'))
    })
  }, [])

  const boundAction = useMemo(
    () => session ? createPost.bind(null, session.access_token) : null,
    [session?.access_token]
  )

  const [state, dispatch, pending] = useActionState(
    boundAction ?? (async () => ({ error: 'Nicht eingeloggt' })),
    null
  )

  const toggleTopic = (id) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  if (loading) return null

  return (
    <div className="feed-col" style={{ maxWidth: 680 }}>

        <a href="/forum" className="forum-back-link">← Forum</a>

        <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 5vw, 52px)', color: 'var(--ink)', lineHeight: 1, margin: '0 0 36px' }}>
          Neue Frage
        </h1>

        <form action={dispatch} onReset={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Hidden inputs: Brand + Topics */}
          {selectedBrand  && <input type="hidden" name="tags" value={selectedBrand} />}
          {selectedTopics.map(id => <input key={id} type="hidden" name="tags" value={id} />)}

          <FormError message={state?.error} className="forum-error" />

          {/* Titel */}
          <div>
            <label className="forum-label" htmlFor="forum-title">Titel / Frage</label>
            <input
              id="forum-title"
              name="title"
              type="text"
              className="forum-input"
              placeholder="z.B. Simson S51 springt nicht an – was könnte das sein?"
              required
              disabled={pending}
              maxLength={200}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Body */}
          <div>
            <label className="forum-label" htmlFor="forum-body">Details</label>
            <textarea
              id="forum-body"
              name="body"
              className="forum-textarea"
              placeholder="Beschreib dein Problem oder deine Frage so genau wie möglich. Je mehr Details, desto besser die Antworten!"
              rows={8}
              required
              disabled={pending}
              style={{ minHeight: 180 }}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>

          {/* Marke */}
          <div>
            <label className="forum-label" htmlFor="forum-brand">Marke (optional)</label>
            <select
              id="forum-brand"
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

          {/* Bild */}
          <div>
            <label className="forum-label">Bild anhängen (optional)</label>
            <input type="hidden" name="image_url" value={imageUrl} />
            <ForumImageUpload userId={user?.id} imageUrl={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Themen-Tags */}
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

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
            <button type="submit" disabled={pending || !session} className="forum-submit-btn">
              {pending ? 'Wird gespeichert…' : 'Frage stellen →'}
            </button>
          </div>
        </form>
    </div>
  )
}
