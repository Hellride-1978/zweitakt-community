'use client'

import { useState, useEffect, useTransition } from 'react'
import { supabase } from '@/lib/supabase'
import { toggleVote } from '@/app/forum/actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons'

export default function VoteButton({ postId, replyId, initialUpvotes, initialDownvotes }) {
  const [upvotes,      setUpvotes]      = useState(Number(initialUpvotes)   || 0)
  const [downvotes,    setDownvotes]    = useState(Number(initialDownvotes) || 0)
  const [userUpvoted,  setUserUpvoted]  = useState(false)
  const [userDownvoted,setUserDownvoted]= useState(false)
  const [token,        setToken]        = useState(null)
  const [pending,      startTransition] = useTransition()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token ?? null)
    })
  }, [])

  const handleVote = (value) => {
    if (!token) return

    const isUp      = value === 1
    const isActive  = isUp ? userUpvoted : userDownvoted
    const prevUp    = upvotes
    const prevDown  = downvotes
    const prevUpV   = userUpvoted
    const prevDownV = userDownvoted

    // Optimistisch
    if (isUp) {
      setUpvotes(u => isActive ? u - 1 : u + 1)
      setUserUpvoted(!isActive)
    } else {
      setDownvotes(d => isActive ? d - 1 : d + 1)
      setUserDownvoted(!isActive)
    }

    startTransition(async () => {
      const fd = new FormData()
      if (postId)  fd.set('postId',  postId)
      if (replyId) fd.set('replyId', replyId)
      fd.set('value', String(value))
      const result = await toggleVote(token, fd)
      if (result?.error) {
        setUpvotes(prevUp)
        setDownvotes(prevDown)
        setUserUpvoted(prevUpV)
        setUserDownvoted(prevDownV)
      }
    })
  }

  const tip = token ? null : 'Einloggen zum Abstimmen'

  return (
    <div className="forum-vote">
      <button
        className={`forum-vote-btn up${userUpvoted ? ' active' : ''}`}
        onClick={() => handleVote(1)}
        disabled={pending || !token}
        title={tip}
        aria-label="Hilfreich"
      >
        <FontAwesomeIcon icon={faThumbsUp} />
        <span className="forum-vote-count">{upvotes}</span>
      </button>
      <button
        className={`forum-vote-btn down${userDownvoted ? ' active' : ''}`}
        onClick={() => handleVote(-1)}
        disabled={pending || !token}
        title={tip}
        aria-label="Nicht hilfreich"
      >
        <FontAwesomeIcon icon={faThumbsDown} />
        <span className="forum-vote-count">{downvotes}</span>
      </button>
    </div>
  )
}
