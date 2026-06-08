import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'

export const metadata = {
  title: 'Datenschutzerklärung — Zweitakthoden',
}

export default function DatenschutzPage() {
  return (
    <DesktopLayout>
      <div className="feed-col">
        <div className="feed-head" style={{ marginBottom: 32 }}>
          <div>
            <div className="zd-mono accent">Rechtliches</div>
            <h1 className="zd-h1" style={{ marginTop: 6 }}>Datenschutz.</h1>
          </div>
        </div>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>

        <div className="zh-card" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>1. Verantwortlicher</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Martin de la Vega<br />
              Verladestr. 3, 29574 Ebstorf<br />
              E-Mail: <a href="mailto:info@zweitakthoden.de" style={{ color: 'var(--accent-accessible)' }}>info@zweitakthoden.de</a>
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
              <li>Forum-Beiträge und Antworten («Die Anlaufstelle»)</li>
              <li>Postleitzahl (PLZ) und geografische Koordinaten (Breitengrad/Längengrad) – freiwillig, für die Anzeige auf der Schrauber-Karte</li>
              <li>Kommentare auf Terminen und Fahrzeugen (Text, Zeitstempel, Zuordnung zum Profil)</li>
              <li>Privat-Nachrichten (Inhalt, Zeitstempel, Sender/Empfänger – nur für die beteiligten Nutzer sichtbar)</li>
              <li>Likes auf Terminen, Profilen und Fahrzeugen (Zuordnung zum Profil und zum Zielobjekt)</li>
              <li>Letzter Aktivitätszeitpunkt (<code>last_seen</code>) – wird alle 5 Minuten automatisch aktualisiert solange du eingeloggt bist, für den Online-Status auf Profilkacheln</li>
            </ul>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Daten, die du in deinem Profil, bei Terminen oder im Forum einträgst, sind öffentlich sichtbar — auch ohne Anmeldung. Forum-Beiträge können von dir als Autor jederzeit bearbeitet oder gelöscht werden.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Wenn du das Kontaktformular verwendest, werden Name, E-Mail-Adresse und Nachricht dauerhaft in unserer Datenbank gespeichert. Wenn du eine Schrauberhalle anlegst, werden Beschreibung, bis zu fünf Fotos und deine Schrauber-Skills gespeichert und sind für alle Mitglieder öffentlich sichtbar.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>3. Zweck der Verarbeitung</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Deine Daten werden ausschließlich für den Betrieb dieser Community-Plattform verwendet: Anmeldung, Profilverwaltung und Koordination von Ausfahrten. Eine Weitergabe an Dritte zu Werbezwecken findet nicht statt.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Deine E-Mail-Adresse wird außerdem verwendet, um dich über Community-Aktivitäten zu benachrichtigen, an denen du beteiligt bist: neue Kommentare auf deinen Terminen oder Fahrzeugen, Änderungen an Terminen für die du angemeldet bist, sowie neue Teilnehmer an deinen Terminen. Wenn du den Newsletter abonnierst, erhältst du gelegentlich Community-Updates und Neuigkeiten von Zweitakthoden — nur mit deiner ausdrücklichen Einwilligung (Double-Opt-in).
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>4. Eingesetzte Dienste</h2>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Supabase</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir nutzen Supabase (Supabase Inc., 970 Trestle Glen Rd, Oakland, CA 94610, USA) für Datenbank, Authentifizierung und Datei-Speicher. Supabase verarbeitet Daten auf EU-Servern (Frankfurt) und ist nach dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>supabase.com/privacy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Vercel</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Das Hosting erfolgt über Vercel Inc. (340 Pine Street, Suite 701, San Francisco, CA 94104, USA). Dabei können technische Zugriffsdaten (IP-Adresse, Browser, Zeitpunkt) kurzfristig in Logdateien gespeichert werden. Weitere Informationen: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>vercel.com/legal/privacy-policy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Vercel Analytics &amp; Speed Insights</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir nutzen Vercel Analytics und Vercel Speed Insights (Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA) zur Analyse des Nutzungsverhaltens und der Seitenperformance. Beide Dienste arbeiten <strong>cookielos</strong> und erheben keine personenbezogenen Daten — es werden keine IP-Adressen gespeichert und keine Nutzerprofile erstellt. Die Auswertung erfolgt vollständig anonymisiert. Weitere Informationen: <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>vercel.com/docs/analytics/privacy-policy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Eigenes Seitenaufruf-Tracking</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir betreiben ein eigenes, datenschutzfreundliches Tracking zur Analyse der Seitennutzung. Dabei werden ausschließlich der aufgerufene Pfad (z.&nbsp;B. <code>/forum</code>), der ungefähre Gerätetyp (Desktop, Mobile oder Tablet, ermittelt aus dem User-Agent-String) sowie das Herkunftsland (ermittelt aus dem IP-basierten Geolokalisierungs-Header von Vercel — ohne Speicherung der IP-Adresse selbst) in unserer Supabase-Datenbank gespeichert. Es werden keine Nutzerprofile erstellt, keine persönlichen Daten wie Name oder E-Mail-Adresse erhoben und keine Cookies verwendet. Die Auswertung dient ausschließlich dem Betrieb und der Verbesserung dieser Plattform.
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Newsletter</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wenn du dich für unseren Newsletter anmeldest, speichern wir deine E-Mail-Adresse, den Zeitpunkt der Anmeldung sowie die IP-Adresse des Anmeldezeitpunkts (Double-Opt-in-Nachweis gemäß § 7 Abs. 2 Nr. 3 UWG). Die Anmeldung erfolgt über ein Double-Opt-in-Verfahren: du erhältst zunächst eine Bestätigungs-E-Mail und wirst erst nach Klick auf den Bestätigungs-Link in den Verteiler aufgenommen. Du kannst dich jederzeit über den Abmelde-Link in jeder Newsletter-Mail oder über deinen Account-Bereich (Einstellungen → Benachrichtigungen) abmelden. Nach der Abmeldung wird dein Status auf „abgemeldet" gesetzt; der Eintrag verbleibt zu Nachweiszwecken in der Datenbank.
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>E-Mail-Versand (SMTP)</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Für den Versand von Benachrichtigungs- und Newsletter-E-Mails nutzen wir einen eigenen SMTP-Server (Strato AG, Pascalstraße 10, 10587 Berlin). Der Versand erfolgt über eine dedizierte Absender-Adresse (<code>send.zweitakthoden.de</code>). Die E-Mail-Adresse des Empfängers wird ausschließlich für den jeweiligen Versand verwendet und nicht an Dritte weitergegeben. Weitere Informationen: <a href="https://www.strato.de/datenschutz/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>strato.de/datenschutz</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>OpenStreetMap / Nominatim</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Zur Anzeige von Kartenausschnitten bei Terminen und zur Umwandlung von Ort- und PLZ-Eingaben in geografische Koordinaten (für Profilseiten und die Schrauber-Karte) nutzen wir OpenStreetMap und den Nominatim-Dienst der OpenStreetMap Foundation. Dabei werden Ortsnamen oder Postleitzahlen an Nominatim übermittelt; es werden keine personenbezogenen Daten wie Name oder E-Mail-Adresse weitergegeben. Weitere Informationen: <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>osmfoundation.org/wiki/Privacy_Policy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Supabase Storage</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Für Profilbilder (Bucket: <code>avatars</code>), Fahrzeugfotos (Bucket: <code>vehicles</code>), Schrauberhallen-Fotos (Bucket: <code>garage</code>) und Termin-Titelbilder (Bucket: <code>event-images</code>) nutzen wir Supabase Storage. Alle Fotos sind öffentlich über eine URL abrufbar. Du kannst deine Fotos jederzeit in den Einstellungen löschen.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>5. Cookies und lokale Speicherung</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir setzen ausschließlich technisch notwendige Cookies und lokale Speicherung ein, um deine Anmeldung zu ermöglichen. Es werden keine Tracking- oder Werbe-Cookies verwendet.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Im lokalen Speicher (localStorage) werden außerdem deine Farbpaletten- und Theme-Einstellung, der Status des Cookie-Banners, der Fortschritt der Onboarding-Tour sowie Snooze-Einstellungen für Hinweis-Banner gespeichert. Diese Daten verlassen deinen Browser nicht.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>6. Deine Rechte</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner gespeicherten Daten sowie das Recht auf Datenübertragbarkeit. Wende dich dazu an: <a href="mailto:info@zweitakthoden.de" style={{ color: 'var(--accent-accessible)' }}>info@zweitakthoden.de</a>
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Du hast außerdem das Recht, dich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>7. Kontakt Datenschutz</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Bei Fragen zum Datenschutz erreichst du uns unter: <a href="mailto:info@zweitakthoden.de" style={{ color: 'var(--accent-accessible)' }}>info@zweitakthoden.de</a>
            </p>
          </section>

        </div>

        <div style={{ marginTop: '32px' }}>
          <Link href="/" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-accessible)', borderBottom: '1px solid var(--accent-accessible)' }}>
            ← Zurück zur Startseite
          </Link>
        </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
