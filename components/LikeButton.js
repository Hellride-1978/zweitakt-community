'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

export default function LikeButton({ targetType, targetId, initialCount = 0 }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!targetId) return
    supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .then(({ count: n }) => setCount(n ?? initialCount))

    if (user) {
      supabase
        .from('likes')
        .select('id')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data))
    }
  }, [user, targetType, targetId, initialCount])

  const toggle = async () => {
    if (!user || loading) return
    setLoading(true)
    if (liked) {
      await supabase.from('likes').delete()
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', user.id)
      setLiked(false)
      setCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('likes').insert({ target_type: targetType, target_id: targetId, user_id: user.id })
      setLiked(true)
      setCount(c => c + 1)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={user ? (liked ? 'Like entfernen' : 'Liken') : 'Zum Liken bitte einloggen'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontFamily: 'var(--mono)',
        fontSize: 12,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: liked ? 'var(--accent-hot)' : 'var(--ink-muted)',
        background: 'none',
        border: '1.5px solid',
        borderColor: liked ? 'var(--accent-hot)' : 'var(--hairline)',
        borderRadius: 100,
        padding: '7px 14px',
        cursor: user ? 'pointer' : 'default',
        transition: 'color .18s, border-color .18s',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{liked ? '♥' : '♡'}</span>
      {count > 0 && <span>{count}</span>}
      {count === 0 && <span>Like</span>}
    </button>
  )
}
