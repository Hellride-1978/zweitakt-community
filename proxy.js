import { isEnabled } from '@/lib/features'

/**
 * [DEAKTIVIERT 2026-09: forum]
 *
 * Das Forum ist abgeschaltet (siehe lib/features.js und
 * DEAKTIVIERTE_FEATURES.md). Für Suchmaschinen ist ein 404 hier das falsche
 * Signal: es bedeutet "vielleicht später wieder da", und Google lässt solche
 * URLs monatelang im Index. 410 Gone sagt "dauerhaft entfernt" und führt
 * deutlich schneller zur De-Indexierung.
 *
 * Betrifft nur /forum — die Route war öffentlich lesbar und ist indexiert.
 * /messages und /admin/* brauchen das nicht: sie waren hinter dem Login und
 * standen nie im Index; dort reicht der 404 aus dem Layout-Guard.
 *
 * Fällt das Flag wieder auf `true`, greift diese Antwort nicht mehr und das
 * Forum ist ohne weitere Änderung erreichbar.
 *
 * In Next 16 heißt die frühere `middleware.js` `proxy.js` — die alte
 * Konvention ist deprecated.
 */

const GONE_HTML = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Forum eingestellt — Zweitakthoden</title>
<style>
  :root {
    --bg: #e8e8e8;
    --card: #ffffff;
    --ink: #1a1108;
    --ink-soft: #5e5248;
    --accent: #1a6080;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #14100c;
      --card: #1f1a15;
      --ink: #f2ede7;
      --ink-soft: #b3a89d;
      --accent: #9bc3d6;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: var(--bg);
    color: var(--ink);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    line-height: 1.6;
  }
  main {
    max-width: 480px;
    width: 100%;
    background: var(--card);
    border: 1.5px solid var(--ink);
    border-radius: 18px;
    box-shadow: 5px 5px 0 var(--ink);
    padding: 36px 32px;
  }
  .mark {
    margin: 0 0 10px;
    font-family: ui-monospace, "Courier New", monospace;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  h1 { margin: 0 0 16px; font-size: 30px; line-height: 1.15; }
  p  { margin: 0 0 20px; color: var(--ink-soft); }
  a {
    display: inline-block;
    padding: 13px 26px;
    border-radius: 100px;
    background: var(--ink);
    color: var(--card);
    font-size: 13px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-decoration: none;
  }
  a:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
</style>
</head>
<body>
  <main>
    <p class="mark">Zweitakthoden</p>
    <h1>Das Forum gibt es nicht mehr.</h1>
    <p>
      Wir haben die Seite auf das Wesentliche eingedampft: einen Kalender für
      Treffen und Ausfahrten. Das Forum ist damit endgültig zu.
    </p>
    <a href="/events">Zu den Terminen &rarr;</a>
  </main>
</body>
</html>`

export function proxy() {
  if (isEnabled('forum')) return

  return new Response(GONE_HTML, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex',
    },
  })
}

export const config = {
  matcher: ['/forum', '/forum/:path*'],
}
