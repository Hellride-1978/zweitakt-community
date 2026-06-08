'use client'

import { useActionState, useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { createReply } from '@/app/forum/actions'
import FormError from '@/components/FormError'
import ForumImageUpload from './ForumImageUpload'

export default function ReplyForm({ postId, onSuccess }) {
  const [session,  setSession]  = useState(undefined)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
  }, [])

  const boundAction = useMemo(
    () => session ? createReply.bind(null, session.access_token) : null,
    [session?.access_token]
  )

  const [state, dispatch, pending] = useActionState(
    boundAction ?? (async () => ({ error: 'Nicht eingeloggt' })),
    null
  )

  useEffect(() => {
    if (state?.ok) {
      setImageUrl('')
      if (onSuccess) onSuccess()
    }
  }, [state?.ok])

  if (session === undefined) return null

  if (!session) {
    return (
      <div className="forum-reply-form" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', marginBottom: 16, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Einloggen um zu antworten
        </p>
        <a href="/auth/login" className="zh-btn-accent" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 100, background: 'var(--accent)', color: 'var(--ink)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none' }}>
          Einloggen →
        </a>
      </div>
    )
  }

  return (
    <form action={dispatch} className="forum-reply-form" onReset={e => e.preventDefault()}>
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="image_url" value={imageUrl} />

      <h3 style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--ink)', margin: '0 0 20px' }}>
        Antwort schreiben
      </h3>

      <FormError message={state?.error} className="forum-error" />
      {state?.ok && <div style={{ color: 'var(--accent-accessible)', marginBottom: 16, fontSize: 14 }}>✓ Antwort gespeichert!</div>}

      <label className="forum-label">Deine Antwort</label>
      <textarea
        name="body"
        className="forum-textarea"
        placeholder="Schreib deine Antwort hier…"
        rows={5}
        required
        disabled={pending}
      />

      <div style={{ marginTop: 12 }}>
        <ForumImageUpload
          userId={session.user?.id}
          imageUrl={imageUrl}
          onChange={setImageUrl}
        />
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={pending} className="forum-submit-btn">
          {pending ? 'Wird gespeichert…' : 'Antwort abschicken →'}
        </button>
      </div>
    </form>
  )
}
