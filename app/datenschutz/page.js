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
            <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 8 }}>Stand: August 2026</p>
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
              <li>Vor- und Nachname – freiwillig, nur wenn du sie in den Profil-Einstellungen einträgst</li>
              <li>Freiwillig angegebene Informationen wie Wohnort, Fahrzeuge und Profiltext</li>
              <li>Teilnahme an Ausfahrten</li>
              <li>Forum-Beiträge und Antworten («Die Anlaufstelle»)</li>
              <li>Postleitzahl (PLZ) und geografische Koordinaten (Breitengrad/Längengrad) – freiwillig, für die Anzeige auf der Schrauber-Karte</li>
              <li>Kommentare auf Terminen und Fahrzeugen (Text, Zeitstempel, Zuordnung zum Profil)</li>
              <li>Privat-Nachrichten (Inhalt, Zeitstempel, Sender/Empfänger – nur für die beteiligten Nutzer sichtbar)</li>
              <li>Likes auf Terminen, Profilen und Fahrzeugen (Zuordnung zum Profil und zum Zielobjekt)</li>
              <li>Letzter Aktivitätszeitpunkt (<code>last_seen</code>) – wird alle 5 Minuten automatisch aktualisiert solange du eingeloggt bist, für den Online-Status auf Profilkacheln</li>
              <li>Benachrichtigungs-Einstellungen (z.&nbsp;B. ob du bei neuen Forum-Antworten per E-Mail benachrichtigt werden möchtest) – in deinem Profil gespeichert und jederzeit in den Einstellungen änderbar</li>
            </ul>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Daten, die du in deinem Profil, bei Terminen oder im Forum einträgst, sind öffentlich sichtbar — auch ohne Anmeldung. Forum-Beiträge können von dir als Autor jederzeit bearbeitet oder gelöscht werden.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Wenn du das Kontaktformular verwendest, werden Name, E-Mail-Adresse und Nachricht in unserer Datenbank gespeichert (zur Speicherdauer siehe Abschnitt 4). Wenn du eine Schrauberhalle anlegst, werden Beschreibung, bis zu fünf Fotos und deine Schrauber-Skills gespeichert und sind für alle Mitglieder öffentlich sichtbar.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Wenn du das Feedback-Widget (der Button unten rechts auf jeder Seite) verwendest, werden Feedback-Typ (Lob, Bug oder Idee), Nachrichtentext sowie die aktuelle Seiten-URL in unserer Datenbank gespeichert. Die Angabe einer E-Mail-Adresse ist optional — wird sie angegeben, wird sie zusammen mit dem Feedback-Inhalt als interne Admin-Benachrichtigung per E-Mail (SMTP, Strato AG) an info@zweitakthoden.de weitergeleitet. Das Feedback-Widget kann auch ohne Anmeldung genutzt werden — in diesem Fall wird kein Nutzerkonto verknüpft.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Wenn du dein Konto löschst, werden dein Profil, deine Fahrzeuge, deine Ausfahrts-Teilnahmen und die von dir erstellten Termine, deine Schrauberhalle, deine Forum-Beiträge und -Antworten, deine Kommentare, deine Likes sowie deine Privat-Nachrichten gelöscht. Ebenfalls gelöscht werden alle von dir hochgeladenen Bilder (Profilbild, Fahrzeugfotos, Schrauberhallen-Fotos, Forum-Bilder und Termin-Titelbilder).
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Drei Dinge bleiben bewusst erhalten: <strong>Feedback-Einträge</strong> bleiben zur Auswertung gespeichert, werden dabei aber anonymisiert — sowohl die Zuordnung zu deinem Profil als auch eine freiwillig angegebene E-Mail-Adresse werden entfernt. <strong>Nachrichten über das Kontaktformular</strong> bleiben gespeichert, da sie keinem Nutzerkonto zugeordnet sind. Dein <strong>Newsletter-Abonnement</strong> (E-Mail-Adresse, Anmeldezeitpunkt und Opt-in-IP) bleibt zu gesetzlichen Nachweiszwecken bestehen. Für alle drei kannst du die vollständige Löschung jederzeit per E-Mail bei uns beantragen.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>3. Zweck der Verarbeitung und Rechtsgrundlagen</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Deine Daten werden ausschließlich für den Betrieb dieser Community-Plattform verwendet: Anmeldung, Profilverwaltung und Koordination von Ausfahrten. Eine Weitergabe an Dritte zu Werbezwecken findet nicht statt.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Deine E-Mail-Adresse wird außerdem verwendet, um dich über Community-Aktivitäten zu benachrichtigen, an denen du beteiligt bist: neue Kommentare auf deinen Terminen oder Fahrzeugen, Änderungen an Terminen für die du angemeldet bist, neue Teilnehmer an deinen Terminen sowie neue Privat-Nachrichten von anderen Mitgliedern. Wenn du den Newsletter abonnierst, erhältst du gelegentlich Community-Updates und Neuigkeiten von Zweitakthoden — nur mit deiner ausdrücklichen Einwilligung (Double-Opt-in).
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '12px' }}>
              Die Rechtsgrundlagen der jeweiligen Verarbeitungen im Überblick:
            </p>
            <ul style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.9, color: 'var(--ink-soft)', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>Profil, Fahrzeuge, Termine, Forum, Nachrichten, Kommentare, Likes:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / Betrieb der Plattform)</li>
              <li><strong>Benachrichtigungs-E-Mails (Kommentare, Teilnahmen, Nachrichten):</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
              <li><strong>Newsletter:</strong> Art. 6 Abs. 1 lit. a DSGVO (ausdrückliche Einwilligung via Double-Opt-in)</li>
              <li><strong>Eigenes Seitenaufruf-Tracking (page_views):</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse — Analyse und Verbesserung des Plattformbetriebs; kein Personenbezug)</li>
              <li><strong>Kontaktformular und Feedback-Widget:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse — Bearbeitung von Anfragen und Verbesserung der Plattform)</li>
              <li><strong>Interne Betreiber-Benachrichtigungen</strong> über neue Mitglieder, Termine, Fahrzeuge und Schrauberhallen: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse — zeitnahe Sichtung neuer Inhalte und Moderation)</li>
              <li><strong>Kartenanzeige, Geocoding und Profilbilder von Drittanbietern:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse — Darstellung der Plattform, siehe Abschnitt 5)</li>
              <li><strong>Standortabfrage über den Browser:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung — erfolgt nur nach ausdrücklicher Freigabe im Browser)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>4. Speicherdauer</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir speichern personenbezogene Daten so lange, wie es für den jeweiligen Zweck erforderlich ist. Nach welchen Kriterien sich das richtet:
            </p>
            <ul style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.9, color: 'var(--ink-soft)', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>Alle Inhalte, die an dein Konto gebunden sind</strong> (Profil, Fahrzeuge, Termine, Schrauberhalle, Forum-Beiträge, Kommentare, Likes, Nachrichten und die zugehörigen Bilder): gespeichert, bis du sie selbst löschst oder dein Konto löschst. Die Kontolöschung entfernt sie unmittelbar und vollständig.</li>
              <li><strong>Newsletter-Abonnements:</strong> E-Mail-Adresse, Anmeldezeitpunkt und Opt-in-IP werden auch nach einer Abmeldung als Double-Opt-in-Nachweis aufbewahrt (§ 7 Abs. 2 Nr. 3 UWG). Auf Anfrage löschen wir den Eintrag vollständig.</li>
              <li><strong>Kontaktformular-Nachrichten und Feedback-Einträge:</strong> werden bis auf Weiteres gespeichert, da sie der Bearbeitung deiner Anfrage und der Verbesserung der Plattform dienen. Eine automatische Löschung nach fester Frist findet derzeit nicht statt — du kannst die Löschung jederzeit verlangen (siehe Abschnitt 7).</li>
              <li><strong>Seitenaufruf-Statistiken:</strong> werden unbefristet gespeichert. Sie enthalten keine personenbezogenen Daten (nur Pfad, Gerätetyp und Herkunftsland) und lassen sich keiner Person zuordnen.</li>
              <li><strong>Zugriffslogs unseres Hosters:</strong> richten sich nach der Datenschutzrichtlinie von Vercel, auf die wir keinen Einfluss haben.</li>
            </ul>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '12px' }}>
              Unabhängig davon löschen wir Daten, sobald du uns dazu aufforderst und keine gesetzliche Aufbewahrungspflicht entgegensteht.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>5. Eingesetzte Dienste</h2>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Supabase</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir nutzen Supabase (Supabase Inc., 970 Trestle Glen Rd, Oakland, CA 94610, USA) für Datenbank, Authentifizierung und Datei-Speicher. Supabase verarbeitet Daten auf EU-Servern (Frankfurt) und ist nach dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>supabase.com/privacy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Google (OAuth-Login)</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Du kannst dich wahlweise mit deiner E-Mail-Adresse oder über deinen Google-Account anmelden. Bei der Anmeldung via Google OAuth wird eine Verbindung zu Google-Servern hergestellt und dein Name, deine E-Mail-Adresse sowie dein Google-Profilbild an Supabase übermittelt, um dein Konto zu erstellen oder zu verknüpfen. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Weitere Informationen: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>policies.google.com/privacy</a>
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
              Für den Versand von Benachrichtigungs- und Newsletter-E-Mails nutzen wir einen eigenen SMTP-Server (Strato AG, Pascalstraße 10, 10587 Berlin). Die E-Mail-Adresse des Empfängers wird ausschließlich für den jeweiligen Versand verwendet und nicht an Dritte weitergegeben. Weitere Informationen: <a href="https://www.strato.de/datenschutz/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>strato.de/datenschutz</a>
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Über denselben SMTP-Server versenden wir auch <strong>interne Betreiber-Benachrichtigungen</strong> an unsere eigene Adresse info@zweitakthoden.de: bei einer neuen Registrierung (Anzeigename und E-Mail-Adresse des neuen Mitglieds), bei einem neuen Termin oder einem neuen Fahrzeug (E-Mail-Adresse des Erstellers) sowie bei einer neuen Schrauberhalle (Name, E-Mail-Adresse und angegebene Skills). Diese Mails dienen ausschließlich dazu, dass wir neue Inhalte zeitnah sichten können.
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Benachrichtigungen zu Kommentaren, Termin-Beitritten und Termin-Änderungen gehen an die jeweils betroffenen Mitglieder — bei Terminen auch an alle angemeldeten Teilnehmer. Für diese Mails gibt es derzeit keine gesonderte Abmeldemöglichkeit in den Einstellungen; abschalten lässt sich bislang nur die Benachrichtigung über Forum-Antworten. Auf Wunsch nehmen wir dich manuell aus dem Versand — schreib uns dazu einfach eine E-Mail.
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Resend (Forum-Benachrichtigungen)</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Für den Versand von Benachrichtigungs-E-Mails bei neuen Forum-Antworten nutzen wir Resend (Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA). Bei einer neuen Antwort werden alle betroffenen Empfänger benachrichtigt: der Autor des Threads sowie alle Personen, die zuvor in diesem Thread geantwortet haben. Dabei werden die E-Mail-Adressen der Empfänger sowie eine Textvorschau der neuen Antwort (max. 200 Zeichen) an Resend übermittelt. Der Versand erfolgt über die dedizierte Absender-Adresse <code>noreply@send.zweitakthoden.de</code>. Die Übertragung in die USA erfolgt auf Grundlage von Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Du kannst diese Benachrichtigungen jederzeit in deinen Profil-Einstellungen (Einstellungen → Benachrichtigungen → Forum-Antworten) abbestellen. Weitere Informationen: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>resend.com/legal/privacy-policy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Kartendarstellung und Geocoding</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Für Karten und die Umwandlung von Orts- und PLZ-Eingaben in geografische Koordinaten nutzen wir mehrere externe Dienste. <strong>Wichtig:</strong> Kartenkacheln und ein Teil dieser Abfragen werden direkt von deinem Browser geladen. Dabei wird deine <strong>IP-Adresse</strong> zwangsläufig an den jeweiligen Anbieter übertragen — technisch bedingt und nicht vermeidbar, solange die Karte angezeigt wird.
            </p>
            <ul style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.9, color: 'var(--ink-soft)', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>OpenStreetMap Foundation</strong> — Kartenkacheln auf Termindetailseiten und der Termin-Karte sowie der Geocoding-Dienst Nominatim (Umwandlung von PLZ und Ortsnamen in Koordinaten und umgekehrt). Ein Teil dieser Anfragen läuft über unseren Server, ein Teil direkt aus deinem Browser. <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>Datenschutzerklärung</a></li>
              <li><strong>CARTO</strong> (CARTO Inc., USA) — liefert die Kartenkacheln der Schrauber-Karte auf der Startseite. <a href="https://carto.com/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>Datenschutzerklärung</a></li>
              <li><strong>openPLZ API</strong> — löst eine eingegebene Postleitzahl in den zugehörigen Ort auf, während du sie in den Profil-Einstellungen eintippst. Übermittelt werden die PLZ und deine IP-Adresse. <a href="https://www.openplzapi.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>openplzapi.org</a></li>
            </ul>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              An keinen dieser Dienste werden Name, E-Mail-Adresse oder andere Kontodaten übermittelt.
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Standortabfrage</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Auf der Terminübersicht und der Termin-Karte kannst du deinen Standort ermitteln lassen, um Termine in deiner Nähe zu finden. Dein Browser fragt dich in diesem Fall ausdrücklich um Erlaubnis — ohne deine Zustimmung passiert nichts. Stimmst du zu, werden die ermittelten Koordinaten zur Umkreissuche verwendet und zusätzlich an Nominatim (OpenStreetMap Foundation) übermittelt, um daraus deine Postleitzahl zu bestimmen. Wir speichern deinen so ermittelten Standort <strong>nicht</strong> in unserer Datenbank; er bleibt nur für die Dauer deines Besuchs im Browser. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du jederzeit in den Einstellungen deines Browsers widerrufen kannst.
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Google-Profilbilder</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Mitglieder, die sich über Google angemeldet haben, behalten ihr Google-Profilbild als Avatar. Diese Bilder liegen auf Google-Servern (<code>googleusercontent.com</code>) und werden direkt von deinem Browser geladen, sobald du eine Seite mit solchen Profilbildern aufrufst — etwa die Mitgliederliste. Dabei wird deine IP-Adresse an Google übertragen, auch dann, wenn du selbst kein Google-Konto nutzt. Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>policies.google.com/privacy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Supabase Storage</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Für Profilbilder (Bucket: <code>avatars</code>), Fahrzeugfotos (Bucket: <code>vehicles</code>), Schrauberhallen-Fotos (Bucket: <code>garage</code>), Termin-Titelbilder (Bucket: <code>event-images</code>), Forum-Bilder in Posts und Antworten (Bucket: <code>forum-images</code>) sowie Bilder in Newsletter-Mailings (Bucket: <code>newsletter-images</code>) nutzen wir Supabase Storage. Alle Fotos und Bilder sind öffentlich über eine URL abrufbar — auch von Personen ohne Benutzerkonto. Fahrzeugfotos und Schrauberhallen-Fotos kannst du jederzeit einzeln löschen; dein Profilbild kannst du jederzeit durch ein anderes ersetzen. Bei einer Kontolöschung werden alle deine hochgeladenen Bilder vollständig entfernt.
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Google Search Console</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Wir nutzen Google Search Console (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland) zur Überwachung der Sichtbarkeit dieser Website in der Google-Suche. Dabei übermitteln wir unsere Sitemap an Google und erhalten anonymisierte Informationen darüber, wie die Seite in den Suchergebnissen erscheint (z.&nbsp;B. Klickzahlen, Impressionen, Crawling-Fehler). Es werden keine personenbezogenen Daten der Seitenbesucher an Google übermittelt. Weitere Informationen: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-accessible)' }}>policies.google.com/privacy</a>
            </p>

            <h3 style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px', marginTop: '16px' }}>Externe Links</h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Diese Website enthält Links zu externen Plattformen — etwa zu Instagram und Facebook (beide Meta Platforms Ireland Limited, 4 Grand Canal Square, Dublin 2, Irland). Der Facebook-Link erscheint als Teilen-Schaltfläche auf Termindetailseiten: Erst wenn du ihn anklickst, wirst du zu Facebook weitergeleitet und die Adresse des geteilten Termins wird übergeben. Es sind keine Social-Media-Plugins eingebunden, die schon beim bloßen Aufruf einer Seite Daten übertragen. Für die Datenverarbeitung auf den externen Seiten ist ausschließlich der jeweilige Anbieter verantwortlich. Wir haben keinen Einfluss auf deren Datenschutzpraktiken und empfehlen, die jeweiligen Datenschutzerklärungen zu lesen.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>6. Lokale Speicherung im Browser</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Diese Website setzt <strong>keine Cookies</strong> — weder eigene noch von Dritten, weder für die Anmeldung noch für Tracking oder Werbung. Stattdessen nutzen wir ausschließlich den lokalen Speicher deines Browsers (<code>localStorage</code>). Dort werden folgende Einträge abgelegt:
            </p>
            <ul style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.9, color: 'var(--ink-soft)', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>Anmeldesitzung</strong> — enthält deine Zugangs- und Erneuerungs-Token sowie die zu deinem Konto gehörenden Angaben (Nutzerkennung und E-Mail-Adresse). Ohne diesen Eintrag ist keine Anmeldung möglich; er ist technisch notwendig.</li>
              <li><strong>Farbpalette</strong> — welches der fünf Farbschemata du gewählt hast</li>
              <li><strong>Hinweisbanner bestätigt</strong> — damit der Banner am unteren Rand nur einmal erscheint</li>
              <li><strong>Onboarding-Tour</strong> — ob du die Einführungstour bereits gesehen oder übersprungen hast</li>
              <li><strong>PLZ-Hinweis ausgeblendet</strong> — bis wann der Hinweis zur fehlenden Postleitzahl pausiert ist</li>
              <li><strong>Ansicht der Terminliste</strong> — ob du Termine als Kacheln oder als Liste anzeigen lässt</li>
            </ul>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Bis auf die Anmeldesitzung verlässt keiner dieser Einträge deinen Browser — sie dienen ausschließlich der Darstellung. Die Anmeldesitzung wird bei jeder Anfrage an unseren Datenbank-Anbieter Supabase übertragen, weil sie dich dort ausweist. Alle Einträge kannst du jederzeit über die Einstellungen deines Browsers löschen; du wirst dadurch abgemeldet und die genannten Einstellungen werden zurückgesetzt.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>7. Deine Rechte</h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner gespeicherten Daten sowie das Recht auf Datenübertragbarkeit. Wende dich dazu an: <a href="mailto:info@zweitakthoden.de" style={{ color: 'var(--accent-accessible)' }}>info@zweitakthoden.de</a>
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: '8px' }}>
              Du hast außerdem das Recht, dich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '20px', marginBottom: '8px' }}>8. Kontakt Datenschutz</h2>
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
