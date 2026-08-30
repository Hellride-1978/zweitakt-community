import { rateLimit, getClientIp } from '@/lib/internalApiAuth'

// Apple liefert die Cover von *.mzstatic.com ohne verlässliche CORS-Header.
// Ein direkt geladenes <img> würde den Canvas "tainten" und toBlob() beim
// PNG-Export mit einem SecurityError abbrechen lassen. Diese Route reicht das
// Bild über die eigene Origin durch – damit bleibt der Canvas sauber.
const MAX_BYTES = 15 * 1024 * 1024

// Ohne Content-Length-Header wäre die Größenprüfung wirkungslos, deshalb wird
// zusätzlich beim Durchreichen mitgezählt und bei Überschreitung abgebrochen.
function limitStream(maxBytes) {
  let seen = 0
  return new TransformStream({
    transform(chunk, controller) {
      seen += chunk.byteLength
      if (seen > maxBytes) controller.error(new Error('Bild zu groß'))
      else controller.enqueue(chunk)
    },
  })
}

function isAllowedHost(hostname) {
  return hostname === 'mzstatic.com' || hostname.endsWith('.mzstatic.com')
}

export async function GET(request) {
  const ip = getClientIp(request)
  // Die Albenauswahl zeigt bis zu 100 Thumbnails, die alle über diese Route
  // laufen – ein enges Limit würde die Cover reihenweise kaputt machen.
  const limited = rateLimit(`artwork:${ip}`, 300, 60_000)
  if (limited) return limited

  const raw = new URL(request.url).searchParams.get('url')
  if (!raw) return new Response('Fehlender url-Parameter', { status: 400 })

  let target
  try {
    target = new URL(raw)
  } catch {
    return new Response('Ungültige URL', { status: 400 })
  }

  // Strikte Allowlist – die Route darf ausschließlich Apples Bild-CDN abrufen,
  // sonst wäre sie ein offener Proxy ins interne Netz.
  if (target.protocol !== 'https:' || !isAllowedHost(target.hostname)) {
    return new Response('Host nicht erlaubt', { status: 400 })
  }

  let upstream
  try {
    upstream = await fetch(target.toString(), {
      headers: { 'User-Agent': 'zweitakthoden/1.0' },
      next: { revalidate: 86400 },
    })
  } catch {
    // Ohne den Fang wuerde ein Netzwerkfehler als 500 durchschlagen.
    return new Response('Cover nicht erreichbar', { status: 502 })
  }

  if (!upstream.ok) return new Response('Cover nicht erreichbar', { status: 502 })

  const contentType = upstream.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) {
    return new Response('Kein Bild', { status: 415 })
  }

  const length = Number(upstream.headers.get('content-length') || 0)
  if (length > MAX_BYTES) return new Response('Bild zu groß', { status: 413 })

  // Ohne Body liefe pipeThrough in einen TypeError und damit in eine 500.
  if (!upstream.body) return new Response('Cover nicht erreichbar', { status: 502 })

  return new Response(upstream.body.pipeThrough(limitStream(MAX_BYTES)), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
