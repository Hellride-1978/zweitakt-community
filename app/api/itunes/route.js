import { rateLimit, getClientIp } from '@/lib/internalApiAuth'

// Die iTunes Search API braucht keinen Key, verhält sich bei CORS je nach
// Endpoint und Region aber unterschiedlich. Deshalb läuft alles über diese
// Route: gleiche Origin für den Client, ein Rate-Limit und eine schlanke,
// stabile Antwortform statt der sehr breiten Original-Payload.
const ITUNES = 'https://itunes.apple.com'
const COUNTRY = 'DE'

// artworkUrl100 zeigt auf ein 100×100-Thumbnail. Der Bilddienst liefert unter
// gleichem Pfad beliebige Kantenlängen – für den Druck holen wir die größte
// verlässlich verfügbare Variante.
const PRINT_ARTWORK_SIZE = 1400

function upscaleArtwork(url, size) {
  if (!url) return null
  return url.replace(/\/\d+x\d+([a-z-]*)\.(jpg|png)$/i, `/${size}x${size}$1.$2`)
}

async function fetchItunes(path, revalidate) {
  let res
  try {
    res = await fetch(`${ITUNES}${path}`, {
      headers: { 'User-Agent': 'zweitakthoden/1.0' },
      next: { revalidate },
    })
  } catch {
    // Netzwerkfehler wie jeden anderen Ausfall behandeln: leere Trefferliste
    // statt einer 500er-Seite.
    return null
  }
  if (!res.ok) return null
  // Apple antwortet auf lookup-Endpoints mit text/javascript – res.json()
  // würde daran scheitern, deshalb der Umweg über den Text.
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function mapArtist(item) {
  return {
    id: item.artistId,
    name: item.artistName,
    genre: item.primaryGenreName || null,
  }
}

function mapAlbum(item) {
  return {
    id: item.collectionId,
    name: item.collectionName,
    artist: item.artistName,
    artwork: item.artworkUrl100 || null,
    artworkPrint: upscaleArtwork(item.artworkUrl100, PRINT_ARTWORK_SIZE),
    releaseDate: item.releaseDate || null,
    trackCount: item.trackCount ?? null,
    // Kommt 1:1 aus der API – kein konstruierter Link.
    appleMusicUrl: item.collectionViewUrl || null,
  }
}

function mapTrack(item) {
  return {
    id: item.trackId,
    name: item.trackName,
    trackNumber: item.trackNumber ?? 0,
    discNumber: item.discNumber ?? 1,
    timeMillis: item.trackTimeMillis ?? null,
  }
}

export async function GET(request) {
  const ip = getClientIp(request)
  const limited = rateLimit(`itunes:${ip}`, 40, 60_000)
  if (limited) return limited

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'artists') {
    const term = searchParams.get('term')?.trim()
    if (!term || term.length > 120) return Response.json({ results: [] })
    const data = await fetchItunes(
      `/search?term=${encodeURIComponent(term)}&entity=musicArtist&limit=15&country=${COUNTRY}`,
      3600
    )
    const results = (data?.results || [])
      .filter((r) => r.wrapperType === 'artist' && r.artistId && r.artistName)
      .map(mapArtist)
    return Response.json({ results })
  }

  if (type === 'albums') {
    const artistId = searchParams.get('artistId')
    if (!/^\d{1,15}$/.test(artistId || '')) return Response.json({ results: [] })
    const data = await fetchItunes(
      `/lookup?id=${artistId}&entity=album&limit=100&country=${COUNTRY}`,
      3600
    )
    const results = (data?.results || [])
      .filter((r) => r.wrapperType === 'collection' && r.collectionId && r.collectionName)
      .map(mapAlbum)
      .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
    return Response.json({ results })
  }

  if (type === 'tracks') {
    const collectionId = searchParams.get('collectionId')
    if (!/^\d{1,15}$/.test(collectionId || '')) return Response.json({ results: [], album: null })
    const data = await fetchItunes(
      `/lookup?id=${collectionId}&entity=song&limit=200&country=${COUNTRY}`,
      3600
    )
    const raw = data?.results || []
    const album = raw.find((r) => r.wrapperType === 'collection')
    const results = raw
      .filter((r) => r.wrapperType === 'track' && r.trackName)
      .map(mapTrack)
      .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber)
    return Response.json({ results, album: album ? mapAlbum(album) : null })
  }

  return Response.json({ error: 'Unbekannter Typ' }, { status: 400 })
}
