import { notFound } from 'next/navigation'
import './forum.css'
import DesktopLayout from '@/components/DesktopLayout'
import { isEnabled } from '@/lib/features'

// [DEAKTIVIERT 2026-09: forum]
// Alle /forum-Routen sind serverseitig dicht. Code bleibt vollständig erhalten,
// Reaktivierung über FEATURES.forum in lib/features.js.
export default function ForumLayout({ children }) {
  if (!isEnabled('forum')) notFound()
  return <DesktopLayout>{children}</DesktopLayout>
}
