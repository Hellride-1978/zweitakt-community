const TRANSLATIONS = [
  [/invalid login credentials/i,         'Ungültige Anmeldedaten. Bitte E-Mail und Passwort prüfen.'],
  [/email not confirmed/i,               'E-Mail noch nicht bestätigt. Bitte die Bestätigungsmail prüfen.'],
  [/user already registered/i,           'Diese E-Mail-Adresse ist bereits registriert.'],
  [/email already in use/i,              'Diese E-Mail-Adresse ist bereits registriert.'],
  [/password.*at least.*characters/i,    'Das Passwort ist zu kurz.'],
  [/password.*too short/i,               'Das Passwort ist zu kurz.'],
  [/new password should be different/i,  'Das neue Passwort muss sich vom alten unterscheiden.'],
  [/email.*invalid.*format/i,            'Ungültige E-Mail-Adresse.'],
  [/invalid email/i,                     'Ungültige E-Mail-Adresse.'],
  [/email link is invalid or has expired/i, 'Der Link ist ungültig oder abgelaufen.'],
  [/token has expired or is invalid/i,   'Der Link ist abgelaufen oder ungültig.'],
  [/for security purposes.*only request.*after/i, 'Bitte kurz warten, bevor du es erneut versuchst.'],
  [/email rate limit exceeded/i,         'Zu viele Versuche. Bitte später erneut versuchen.'],
  [/rate limit/i,                        'Zu viele Versuche. Bitte kurz warten.'],
  [/network.*error|fetch.*fail/i,        'Netzwerkfehler. Bitte Verbindung prüfen.'],
]

export function translateAuthError(msg) {
  if (!msg) return 'Ein unbekannter Fehler ist aufgetreten.'
  for (const [pattern, translation] of TRANSLATIONS) {
    if (pattern.test(msg)) return translation
  }
  return msg
}
