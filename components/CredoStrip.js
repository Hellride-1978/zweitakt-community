import Link from 'next/link'

export default function CredoStrip() {
  return (
    <section className="credo-strip-wrap">
      <div className="credo-strip">
        <div className="credo-col">
          <span className="credo-eye">Worum geht&rsquo;s?</span>
          <h3 className="credo-hl">Schrauben. Fahren. Bock haben.</h3>
          <p className="credo-body">Hauptsache Zweitakt. Marke &amp; Hubraum: zweitrangig.</p>
        </div>
        <div className="credo-divider" aria-hidden="true" />
        <div className="credo-col">
          <span className="credo-eye">Keine Szene. Keine Show.</span>
          <h3 className="credo-hl">Garage statt Gallery.</h3>
          <p className="credo-body">Kein Posing. Kein Spec-War. Echter Austausch unter Leuten, die selbst anpacken.</p>
        </div>
        <div className="credo-divider" aria-hidden="true" />
        <div className="credo-col">
          <span className="credo-eye">Mitmachen ist einfach.</span>
          <h3 className="credo-hl">Dein Platz in der Garage.</h3>
          <p className="credo-body">Kein Experte nötig. Einfach Bock auf Zweitakt.</p>
          <Link href="/auth/register" className="zh-btn zh-btn-accent credo-btn">Kostenlos anmelden →</Link>
        </div>
      </div>
    </section>
  )
}
