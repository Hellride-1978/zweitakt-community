'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

export default function LikeButton({ targetType, targetId, initialCount = 0 }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState(false)
  const ref = useRef(null)

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

  useEffect(() => {
    if (!prompt) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setPrompt(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [prompt])

  const toggle = async () => {
    if (!user) { setPrompt(p => !p); return }
    if (loading) return
    setLoading(true)
    if (liked) {
      await supabase.from('likes').delete()
        .eq('target_type', targetType).eq('target_id', targetId).eq('user_id', user.id)
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
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase',
          color: liked ? 'var(--accent-hot)' : 'var(--ink-muted)',
          background: 'none', border: '1.5px solid',
          borderColor: prompt ? 'var(--ink)' : liked ? 'var(--accent-hot)' : 'var(--hairline)',
          borderRadius: 100, padding: '7px 14px', cursor: 'pointer',
          transition: 'color .18s, border-color .18s', opacity: loading ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>{liked ? '♥' : '♡'}</span>
        {count > 0 ? <span>{count}</span> : <span>Like</span>}
      </button>

      {prompt && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
          background: 'var(--ink)', color: 'var(--cream)',
          borderRadius: 14, padding: '14px 16px', minWidth: 200,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          zIndex: 100,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>
            Zum Liken bitte:
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href="/auth/login"
              style={{
                flex: 1, textAlign: 'center', padding: '8px 12px', borderRadius: 100,
                background: 'var(--accent)', color: 'var(--ink)',
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
                textDecoration: 'none', fontWeight: 600,
              }}
            >
              Anmelden
            </Link>
            <Link
              href="/auth/register"
              style={{
                flex: 1, textAlign: 'center', padding: '8px 12px', borderRadius: 100,
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Registrieren
            </Link>
          </div>
          {/* Pfeil nach unten */}
          <div style={{
            position: 'absolute', bottom: -7, left: 20,
            width: 14, height: 14, background: 'var(--ink)',
            transform: 'rotate(45deg)', borderRadius: 2,
          }} />
        </div>
      )}
    </div>
  )
}
