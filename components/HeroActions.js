'use client'

import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default function HeroActions() {
  const { user, loading } = useAuth()
  if (loading) return null
  return (
    <div className="zh-hero-actions">
      {user ? (
        <>
          <Link href="/dashboard" className="zh-btn">
            Mein Dashboard
            <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '14px' }} />
          </Link>
          <Link href="/events" className="zh-btn zh-btn-outline">Termine & Ausfahrten</Link>
        </>
      ) : (
        <>
          <Link href="/auth/register" className="zh-btn">
            Jetzt mitmachen
            <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '14px' }} />
          </Link>
        </>
      )}
    </div>
  )
}
