import { notFound } from 'next/navigation'
import { isEnabled } from '@/lib/features'

// [DEAKTIVIERT 2026-09: messages]
// Alle /messages-Routen sind serverseitig dicht. Code bleibt vollständig
// erhalten, Reaktivierung über FEATURES.messages in lib/features.js.
export default function MessagesLayout({ children }) {
  if (!isEnabled('messages')) notFound()
  return children
}
