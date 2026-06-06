const BASE = `
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        {{HEADER}}
        {{BODY}}
        <tr><td style="padding:0 32px;"><div style="height:1px;background:rgba(26,17,8,0.15);"></div></td></tr>
        {{FOOTER}}
      </table>
    </td></tr>
  </table>
</body></html>`

function header(headline) {
  return `<tr>
    <td style="background:#1a1108;padding:24px 32px;">
      <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
      <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;color:#ffffff;line-height:1.15;font-weight:800;">${headline}</p>
    </td>
  </tr>`
}

function footer(unsubscribeUrl = null) {
  const unsub = unsubscribeUrl
    ? `<br><a href="${unsubscribeUrl}" style="color:#1a6080;text-decoration:underline;">Newsletter abmelden</a>`
    : ''
  return `<tr>
    <td style="padding:18px 32px 24px;">
      <p style="margin:0;font-size:11px;color:#5e5248;letter-spacing:1.5px;text-transform:uppercase;font-family:ui-monospace,'Courier New',monospace;">
        zweitakthoden.de — Die Community für Zweitakt-Schrauber${unsub}
      </p>
    </td>
  </tr>`
}

function btn(url, label) {
  return `<table cellpadding="0" cellspacing="0"><tr>
    <td style="background:#1a1108;border-radius:100px;">
      <a href="${url}" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${label}</a>
    </td>
  </tr></table>`
}

export function buildConfirmationEmail({ confirmUrl }) {
  const body = `<tr>
    <td style="padding:36px 32px 32px;">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#5e5248;font-family:ui-monospace,'Courier New',monospace;">Newsletter</p>
      <p style="margin:0 0 16px;font-family:Arial,system-ui,sans-serif;font-size:18px;color:#1a1108;line-height:1.5;">
        Danke für dein Interesse! Klick den Button unten um deine Anmeldung zu bestätigen.
      </p>
      <p style="margin:0 0 24px;font-family:Arial,system-ui,sans-serif;font-size:14px;color:#5e5248;line-height:1.6;">
        Du bekommst dann Community-Updates, Tipps rund um Zweitakter und Neuigkeiten von Zweitakthoden.
      </p>
      <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 24px;"></div>
      ${btn(confirmUrl, 'Anmeldung bestätigen →')}
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8a7a6e;line-height:1.5;">
        Falls du dich nicht angemeldet hast, kannst du diese Mail einfach ignorieren.
      </p>
    </td>
  </tr>`

  return BASE
    .replace('{{HEADER}}', header('Bestätige deine<br><em>Anmeldung.</em>'))
    .replace('{{BODY}}', body)
    .replace('{{FOOTER}}', footer())
}

export function buildWelcomeEmail({ unsubscribeUrl }) {
  const body = `<tr>
    <td style="padding:36px 32px 32px;">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#5e5248;font-family:ui-monospace,'Courier New',monospace;">Newsletter</p>
      <p style="margin:0 0 16px;font-family:Arial,system-ui,sans-serif;font-size:18px;color:#1a1108;line-height:1.5;">
        Du bist dabei — willkommen in der Crew!
      </p>
      <p style="margin:0 0 16px;font-family:Arial,system-ui,sans-serif;font-size:14px;color:#3a3028;line-height:1.6;">
        Als Newsletter-Abonnent bekommst du:
      </p>
      <ul style="margin:0 0 24px;padding-left:20px;font-family:Arial,system-ui,sans-serif;font-size:14px;color:#3a3028;line-height:1.8;">
        <li>Community-Updates und neue Mitglieder aus der Szene</li>
        <li>Tipps rund ums Schrauben an Zweitaktern</li>
        <li>Termine, Treffen und Ausfahrten in deiner Nähe</li>
      </ul>
      <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 24px;"></div>
      ${btn('https://zweitakthoden.de/forum', 'Zum Forum →')}
    </td>
  </tr>`

  return BASE
    .replace('{{HEADER}}', header('Willkommen bei den<br><em>Zweitakthoden.</em>'))
    .replace('{{BODY}}', body)
    .replace('{{FOOTER}}', footer(unsubscribeUrl))
}
