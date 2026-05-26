import Link from 'next/link'

export const metadata = {
  title: 'Impressum — Zweitakthoden',
}

export default function ImpressumPage() {
  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm">
        <div style={{ marginBottom: '32px' }}>
          <div className="zh-section-mark">Rechtliches</div>
          <h1 className="zh-page-title" style={{ marginTop: '16px' }}>Impressum.</h1>
        </div>

        <div className="zh-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>Angaben gemäß § 5 TMG</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Martin de la Vega<br />
              Verladestr. 3<br />
              29574 Ebstorf
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>Kontakt</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              E-Mail: <a href="mailto:info@zweitakthoden.de" style={{ color: 'var(--accent)' }}>info@zweitakthoden.de</a>
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>Verantwortlich für den Inhalt</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Martin de la Vega<br />
              Verladestr. 3<br />
              29574 Ebstorf
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>Haftung für Inhalte</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>Haftung für Links</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

        </div>

        <div style={{ marginTop: '32px' }}>
          <Link href="/" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}
