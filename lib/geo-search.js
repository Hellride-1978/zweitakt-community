/**
 * Geo-Suche: User im Umkreis finden via PostGIS RPC.
 * Voraussetzung: migration_geodata.sql wurde in Supabase ausgeführt.
 */
import { createServerClient } from '@/lib/supabase'

/**
 * Haversine-Formel – Entfernung in km zwischen zwei Koordinaten.
 * Wird als Fallback genutzt wenn PostGIS nicht verfügbar ist.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Entfernung in km
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Sucht User im angegebenen Umkreis via PostGIS RPC.
 * Gibt Profile sortiert nach Entfernung zurück, inklusive distance_km.
 *
 * @param {number} lat - Breitengrad Referenzpunkt
 * @param {number} lng - Längengrad Referenzpunkt
 * @param {number} radiusKm - Suchradius in Kilometern
 * @returns {Promise<Array>} Profile mit distance_km Feld
 */
export async function findUsersNearby(lat, lng, radiusKm) {
  const supabase = createServerClient()

  const { data, error } = await supabase.rpc('find_users_nearby', {
    ref_lat:   lat,
    ref_lng:   lng,
    radius_km: radiusKm,
  })

  if (error) {
    console.error('findUsersNearby Fehler:', error.message)
    return []
  }

  return data ?? []
}
