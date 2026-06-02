/**
 * PLZ → Koordinaten via OpenPLZ API (kostenlos, kein API-Key)
 * https://openplzapi.org
 */

const BASE_URL = 'https://openplzapi.org'

/**
 * Löst eine Postleitzahl in Koordinaten auf.
 * @param {string} plz - Postleitzahl
 * @param {'DE' | 'AT' | 'CH'} country - Land
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export async function resolvePostalCode(plz, country = 'DE') {
  if (!plz?.trim()) return null

  const countryPath = country.toLowerCase()
  const url = `${BASE_URL}/${countryPath}/Localities?postalCode=${encodeURIComponent(plz.trim())}`

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      // Kein Cache – Koordinaten sollen immer aktuell sein
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null

    const first = data[0]

    // OpenPLZ liefert latitude/longitude als Zahlen
    const lat = typeof first.latitude === 'number' ? first.latitude : parseFloat(first.latitude)
    const lng = typeof first.longitude === 'number' ? first.longitude : parseFloat(first.longitude)

    if (isNaN(lat) || isNaN(lng)) return null

    return { lat, lng }
  } catch {
    return null
  }
}
