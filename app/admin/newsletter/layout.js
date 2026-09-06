import { notFound } from 'next/navigation'
import { isEnabled } from '@/lib/features'

// [DEAKTIVIERT 2026-09: newsletter]
// Der Newsletter-Versand ist stillgelegt. Code bleibt erhalten,
// Reaktivierung über FEATURES.newsletter in lib/features.js.
export default function AdminNewsletterLayout({ children }) {
  if (!isEnabled('newsletter')) notFound()
  return children
}
