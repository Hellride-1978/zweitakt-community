import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/wm-auth'
import WmSubNav from './WmSubNav'
import './wm.css'

export const metadata = {
  title: { default: 'WM 2026 Tippspiel', template: '%s — WM Tippspiel' },
}

export default async function WmLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('wm_session')?.value
  const session = token ? await verifySessionToken(token) : null

  return (
    <>
      {session && <WmSubNav username={session.username} isAdmin={session.isAdmin} />}
      {children}
    </>
  )
}
