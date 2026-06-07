'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    navigator.sendBeacon('/api/track', JSON.stringify({ path: pathname }))
  }, [pathname])

  return null
}
