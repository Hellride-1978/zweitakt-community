import Link from 'next/link'

export const metadata = {
  title: 'Datenschutzerklärung — Zweitakthoden',
}

export default function DatenschutzPage() {
  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm">
        <div style={{ marginBottom: '32px' }}>
          <div className="zh-section-mark">Rechtliches</div>
          <h1 className="zh-page-title" style={{ marginTop: '16px' }}>Datenschutz.</h1>
        </div>

        <div className="zh-card" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>1. Verantwortlicher</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Martin de la Vega<br />
              Verladestr. 3, 29574 Ebstorf<br />
              E-Mail: <a href="mailto:info@zweitakthoden.de" style={{ color: 'var(--accent-ink)' }}>info@zweitakthoden.de</a>
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>2. Welche Daten wir speichern</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Bei der Registrierung erheben wir folgende Daten:
            </p>
            <ul style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.9, color: 'var(--ink-soft)', paddingLeft: '20px', marginTop: '8px' }}>
              <li>E-Mail-Adresse (für Login und Benachrichtigungen)</li>
              <li>Anzeigename und optionales Profilbild</li>
              <li>Freiwillig angegebene Informationen wie Wohnort, Fahrzeuge und Profiltext</li>
              <li>Teilnahme an Ausfahrten</li>
            </ul>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Daten, die du in deinem Profil oder bei Terminen einträgst, sind für andere eingeloggte Mitglieder sichtbar.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>3. Zweck der Verarbeitung</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Deine Daten werden ausschließlich für den Betrieb dieser Community-Plattform verwendet: Anmeldung, Profilverwaltung und Koordination von Ausfahrten. Eine Weitergabe an Dritte zu Werbezwecken findet nicht statt.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>4. Eingesetzte Dienste</h2>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Supabase</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir nutzen Supabase (Supabase Inc., 970 Trestle Glen Rd, Oakland, CA 94610, USA) für Datenbank, Authentifizierung und Datei-Speicher. Supabase verarbeitet Daten auf EU-Servern (Frankfurt) und ist nach dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>supabase.com/privacy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Vercel</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Das Hosting erfolgt über Vercel Inc. (340 Pine Street, Suite 701, San Francisco, CA 94104, USA). Dabei können technische Zugriffsdaten (IP-Adresse, Browser, Zeitpunkt) kurzfristig in Logdateien gespeichert werden. Weitere Informationen: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>vercel.com/legal/privacy-policy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Vercel Analytics &amp; Speed Insights</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir nutzen Vercel Analytics und Vercel Speed Insights (Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA) zur Analyse des Nutzungsverhaltens und der Seitenperformance. Beide Dienste arbeiten <strong>cookielos</strong> und erheben keine personenbezogenen Daten — es werden keine IP-Adressen gespeichert und keine Nutzerprofile erstellt. Die Auswertung erfolgt vollständig anonymisiert. Weitere Informationen: <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>vercel.com/docs/analytics/privacy-policy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Resend</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Für den Versand von Benachrichtigungs-E-Mails bei neuen Registrierungen nutzen wir Resend (Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA). Dabei werden Name und E-Mail-Adresse des neuen Mitglieds einmalig zum Versand der Benachrichtigung übermittelt und nicht dauerhaft bei Resend gespeichert. Resend ist nach dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>resend.com/legal/privacy-policy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>OpenStreetMap / Nominatim</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Zur Anzeige von Kartenausschnitten und Ortsbezeichnungen bei Terminen nutzen wir OpenStreetMap und den Nominatim-Dienst der OpenStreetMap Foundation. Dabei werden Koordinaten von Treffpunkten übermittelt, jedoch keine personenbezogenen Daten. Weitere Informationen: <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>osmfoundation.org/wiki/Privacy_Policy</a>
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>5. Cookies und lokale Speicherung</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir setzen ausschließlich technisch notwendige Cookies und lokale Speicherung ein, um deine Anmeldung zu ermöglichen. Es werden keine Tracking- oder Werbe-Cookies verwendet.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>6. Deine Rechte</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner gespeicherten Daten sowie das Recht auf Datenübertragbarkeit. Wende dich dazu an: <a href="mailto:info@zweitakthoden.de" style={{ color: 'var(--accent-ink)' }}>info@zweitakthoden.de</a>
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Du hast außerdem das Recht, dich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>7. Kontakt Datenschutz</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Bei Fragen zum Datenschutz erreichst du uns unter: <a href="mailto:info@zweitakthoden.de" style={{ color: 'var(--accent-ink)' }}>info@zweitakthoden.de</a>
            </p>
          </section>

        </div>

        <div style={{ marginTop: '32px' }}>
          <Link href="/" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-ink)', borderBottom: '1px solid var(--accent-ink)' }}>
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}
