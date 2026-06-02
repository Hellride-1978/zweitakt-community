/**
 * PLZ → Koordinaten via Nominatim (OpenStreetMap) – kostenlos, kein API-Key.
 * Nutzungsbedingungen: max. 1 Request/Sekunde, User-Agent Pflicht.
 * https://nominatim.org/release-docs/latest/api/Search/
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'zweitakthoden/1.0 (info@zweitakthoden.de)'

// Ländercodes für Nominatim (ISO 3166-1 alpha-2)
const COUNTRY_CODES = { DE: 'DE', AT: 'AT', CH: 'CH' }

/**
 * Löst eine Postleitzahl in Koordinaten auf.
 * @param {string} plz - Postleitzahl
 * @param {'DE' | 'AT' | 'CH'} country - Land
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export async function resolvePostalCode(plz, country = 'DE') {
  if (!plz?.trim()) return null

  const cc = COUNTRY_CODES[country] ?? 'DE'
  const url = `${NOMINATIM}?postalcode=${encodeURIComponent(plz.trim())}&country=${cc}&format=json&limit=1`

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null

    // Nominatim liefert lat und lon als Strings
    const lat = parseFloat(data[0].lat)
    const lng = parseFloat(data[0].lon)

    if (isNaN(lat) || isNaN(lng)) return null

    return { lat, lng }
  } catch {
    return null
  }
}
