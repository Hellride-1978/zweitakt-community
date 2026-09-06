/**
 * Zentrale Feature-Flags.
 *
 * Hintergrund (2026-09): zweitakthoden.de wird von einer Community-Plattform
 * zu einem schlanken regionalen Treffen-/Event-Kalender umgebaut. Die Seite
 * hat praktisch keine aktive Nutzerschaft, das Pflegebudget liegt bei
 * 2–5 Std./Monat. Alle Community-Features, die laufende Moderation,
 * Mail-Zustellung oder DSGVO-Pflege verursachen, sind deshalb abgeschaltet.
 *
 * Wichtig: Es wurde KEIN Code gelöscht. Jedes Feature lässt sich durch
 * Umstellen des Flags auf `true` wieder aktivieren. Die zugehörigen
 * Supabase-Tabellen, RLS-Policies und Storage-Buckets existieren
 * unverändert weiter (Löschung siehe DEAKTIVIERTE_FEATURES.md, Phase 3).
 *
 * Stellen im Code, an denen ein Feature nur ausgehängt (nicht flag-geschützt)
 * wurde, sind mit `[DEAKTIVIERT 2026-09: <feature>]` kommentiert.
 */
export const FEATURES = {
  /** Forum inkl. Q&A, Votes, Tags, Bild-Upload, Resend-Benachrichtigungen */
  forum: false,

  /** Private Nachrichten zwischen Mitgliedern inkl. SMTP-Benachrichtigung */
  messages: false,

  /** Like-System auf Terminen, Fahrzeugen und Schrauberhallen */
  likes: false,

  /** Kommentare auf Terminen und Fahrzeugen inkl. SMTP-Benachrichtigung */
  comments: false,

  /** Online-Status (profiles.last_seen Heartbeat + Anzeige) */
  presence: false,

  /** Onboarding-Tour für frisch registrierte Nutzer */
  onboarding: false,

  /** Newsletter: Anmeldung, Double-Opt-in, Versand über /admin/newsletter.
   *  Die Abmelde-Routen bleiben bewusst aktiv, damit Abmeldelinks in
   *  bereits versendeten Mails weiter funktionieren (§ 7 UWG / Art. 21 DSGVO). */
  newsletter: false,
}

/** true, wenn das Feature aktiv ist. Unbekannte Namen gelten als deaktiviert. */
export function isEnabled(name) {
  return FEATURES[name] === true
}
