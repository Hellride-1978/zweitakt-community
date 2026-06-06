import Link from 'next/link'

export const metadata = { title: 'Newsletter abgemeldet – Zweitakthoden' }

export default function NewsletterAbgemeldetPage({ searchParams }) {
  const error = searchParams?.error
  const already = searchParams?.already

  return (
    <div className="zh-page">
      <div className="zh-page-inner" style={{ maxWidth: 560, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 12 }}>
          Newsletter
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 6vw, 52px)', color: 'var(--ink)', lineHeight: 1, marginBottom: 20 }}>
          {error ? 'Etwas lief schief.' : already ? 'Bereits abgemeldet.' : 'Schade, bis bald.'}
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
          {error
            ? 'Der Abmeldelink ist ungültig oder bereits verwendet.'
            : already
            ? 'Du warst bereits abgemeldet. Du bekommst keine weiteren Mails von uns.'
            : 'Du wurdest erfolgreich abgemeldet und bekommst keine Newsletter mehr von uns. Die Community bleibt dir natürlich erhalten.'}
        </p>
        <Link href="/" className="zh-btn">Zur Startseite →</Link>
      </div>
    </div>
  )
}
