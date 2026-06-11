import { getSession } from '@/lib/wm-auth'
import { getAllMatches } from '@/lib/wm-db'
import { redirect } from 'next/navigation'
import { AdminClient } from './AdminClient'

export const metadata = { title: 'Admin · WM 2026' }
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/wm/dashboard')
  const matches = await getAllMatches()
  return (
    <div className="wm-page">
      <div className="wm-page-inner">
        <div className="wm-page-header">
          <h1 className="wm-page-title">Admin</h1>
          <p className="wm-page-sub">Manuelle Ergebnis-Überschreibung</p>
        </div>
        <AdminClient matches={matches} />
      </div>
    </div>
  )
}
