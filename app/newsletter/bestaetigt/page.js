import Link from 'next/link'

export const metadata = { title: 'Newsletter bestätigt – Zweitakthoden' }

export default function NewsletterBestaetigtPage({ searchParams }) {
  const error = searchParams?.error
  const already = searchParams?.already

  if (error) {
    return (
      <div className="zh-page">
        <div className="zh-page-inner" style={{ maxWidth: 560, textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--ink)', marginBottom: 16 }}>
            Link ungültig.
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Dieser Bestätigungslink ist abgelaufen oder wurde bereits verwendet.
            Trag dich einfach neu ein und wir schicken dir einen frischen Link.
          </p>
          <Link href="/" className="zh-btn">Zur Startseite →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="zh-page">
      <div className="zh-page-inner" style={{ maxWidth: 560, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 12 }}>
          {already ? 'Bereits bestätigt' : 'Newsletter'}
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 6vw, 52px)', color: 'var(--ink)', lineHeight: 1, marginBottom: 20 }}>
          {already ? 'Schon dabei!' : 'Willkommen an Bord.'}
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
          {already
            ? 'Deine E-Mail-Adresse ist bereits bestätigt. Du bekommst weiterhin unsere Updates.'
            : 'Deine Anmeldung ist bestätigt. Wir haben dir gerade eine Willkommensmail geschickt.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/forum" className="zh-btn">Zum Forum →</Link>
          <Link href="/" className="zd-btn outline">Zur Startseite</Link>
        </div>
      </div>
    </div>
  )
}
