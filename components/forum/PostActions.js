'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { deletePost } from '@/app/forum/actions'

export default function PostActions({ postId, authorId }) {
  const [userId,  setUserId]  = useState(null)
  const [token,   setToken]   = useState(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
      setToken(session?.access_token ?? null)
    })
  }, [])

  if (!userId || userId !== authorId) return null

  const handleDelete = () => {
    if (!window.confirm('Beitrag wirklich löschen? Das kann nicht rückgängig gemacht werden.')) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('postId', postId)
      await deletePost(token, fd)
      router.push('/forum')
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <Link href={`/forum/${postId}/bearbeiten`} className="forum-action-btn">
        Bearbeiten
      </Link>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="forum-action-btn forum-action-btn--delete"
      >
        {pending ? '…' : 'Löschen'}
      </button>
    </div>
  )
}
