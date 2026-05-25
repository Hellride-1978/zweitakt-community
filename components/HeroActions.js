'use client'

import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

export default function HeroActions() {
  const { user, loading } = useAuth()
  if (loading) return null
  return (
    <div className="zh-hero-actions">
      {user ? (
        <>
          <Link href="/dashboard" className="zh-btn">
            Mein Dashboard
            <svg className="w-4 h-2.5" viewBox="0 0 16 10" fill="none">
              <path d="M1 5h13M10 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/events" className="zh-btn zh-btn-outline">Termine & Ausfahrten</Link>
        </>
      ) : (
        <>
          <Link href="/auth/register" className="zh-btn">
            Jetzt mitmachen
            <svg className="w-4 h-2.5" viewBox="0 0 16 10" fill="none">
              <path d="M1 5h13M10 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </>
      )}
    </div>
  )
}
