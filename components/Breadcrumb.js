'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'

const SECTION_MAP = {
  events:   { label: 'Termine',     href: '/events' },
  vehicles: { label: 'Bikes',       href: '/vehicles' },
  profiles: { label: 'Schrauber',   href: '/profiles' },
  profile:  { label: 'Schrauber',   href: '/profiles' },
  messages: { label: 'Nachrichten', href: '/messages' },
}

const chipBase = {
  fontFamily: 'var(--mono)',
  fontSize: 10,
  letterSpacing: '1.6px',
  textTransform: 'uppercase',
  padding: '5px 11px',
  borderRadius: 100,
  border: '1.5px solid var(--ink)',
  whiteSpace: 'nowrap',
  lineHeight: 1,
  textDecoration: 'none',
}

export default function Breadcrumb({ crumb }) {
  const pathname = usePathname()
  const segment = pathname?.split('/').filter(Boolean)[0]
  const section = SECTION_MAP[segment]
  const isTop = !section || !crumb || crumb === section?.label

  if (!section) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '20px var(--gutter) 10px',
    }}>
      {/* Haus-Chip — immer sichtbar */}
      <Link
        href="/"
        aria-label="Startseite"
        style={{
          ...chipBase,
          background: 'var(--ink)',
          color: 'var(--cream)',
          display: 'flex',
          alignItems: 'center',
          marginRight: 2,
        }}
      >
        <FontAwesomeIcon icon={faHouse} style={{ fontSize: 11 }} />
      </Link>

      {/* Section chip */}
      {isTop ? (
        <span style={{ ...chipBase, background: 'var(--ink)', color: 'var(--cream)' }}>
          {section.label}
        </span>
      ) : (
        <Link href={section.href} style={{ ...chipBase, background: 'var(--cream)', color: 'var(--ink)' }}>
          {section.label}
        </Link>
      )}

      {/* Arrow + current page chip */}
      {!isTop && crumb && (
        <>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: 1 }}>→</span>
          <span style={{
            ...chipBase,
            background: 'var(--ink)',
            color: 'var(--cream)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 'min(40vw, 320px)',
          }}>
            {crumb}
          </span>
        </>
      )}
    </div>
  )
}
