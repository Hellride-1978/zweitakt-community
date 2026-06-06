import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm" style={{ textAlign: 'center', paddingTop: 64 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>
          404
        </div>
        <h1 className="zd-h1">Seite nicht gefunden.</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink-soft)', marginTop: 12, lineHeight: 1.6 }}>
          Diese Seite existiert nicht oder wurde verschoben.
        </p>
        <Link href="/" className="zh-btn" style={{ display: 'inline-flex', marginTop: 32 }}>
          Zur Startseite →
        </Link>
      </div>
    </div>
  )
}
