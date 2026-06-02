/**
 * Backfill-Script: PLZ → lat/lng für bestehende Profile befüllen.
 *
 * Ausführen:
 *   node --env-file=.env.local scripts/backfill-geodata.js
 *
 * Voraussetzung: migration_geodata.sql wurde in Supabase ausgeführt.
 */

import { createClient } from '@supabase/supabase-js'

// ── Konfiguration ──────────────────────────────────────────────

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Standardmäßig DE; passe an wenn deine User auch AT/CH haben
const DEFAULT_COUNTRY = 'DE'

// Delay zwischen API-Requests um OpenPLZ nicht zu überlasten
const DELAY_MS = 200

// ──────────────────────────────────────────────────────────────

if (!SUPABASE_URL || !SUPABASE_ROLE_KEY) {
  console.error('Fehler: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/** PLZ → Koordinaten via OpenPLZ API */
async function resolvePostalCode(plz, country = DEFAULT_COUNTRY) {
  if (!plz?.trim()) return null
  const countryPath = country.toLowerCase()
  const url = `https://openplzapi.org/${countryPath}/Localities?postalCode=${encodeURIComponent(plz.trim())}`
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    const first = data[0]
    const lat = typeof first.latitude === 'number' ? first.latitude : parseFloat(first.latitude)
    const lng = typeof first.longitude === 'number' ? first.longitude : parseFloat(first.longitude)
    if (isNaN(lat) || isNaN(lng)) return null
    return { lat, lng }
  } catch (err) {
    console.error(`  Fehler bei PLZ ${plz}:`, err.message)
    return null
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('Lade Profile mit PLZ aber ohne Koordinaten…\n')

  // Alle Profile mit PLZ aber ohne lat/lng laden
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, plz')
    .not('plz', 'is', null)
    .is('lat', null)

  if (error) {
    console.error('Supabase-Fehler:', error.message)
    process.exit(1)
  }

  const total = profiles?.length ?? 0
  if (total === 0) {
    console.log('Keine Profile zum Befüllen gefunden. Fertig.')
    return
  }

  console.log(`${total} Profile gefunden.\n`)

  let erfolge = 0
  let fehler  = 0

  for (let i = 0; i < total; i++) {
    const profile = profiles[i]
    process.stdout.write(`${i + 1}/${total}  ${profile.name || profile.id}  PLZ: ${profile.plz} → `)

    const coords = await resolvePostalCode(profile.plz, DEFAULT_COUNTRY)

    if (!coords) {
      console.log('nicht aufgelöst, übersprungen.')
      fehler++
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ lat: coords.lat, lng: coords.lng })
        .eq('id', profile.id)

      if (updateError) {
        console.log(`Update-Fehler: ${updateError.message}`)
        fehler++
      } else {
        console.log(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} ✓`)
        erfolge++
      }
    }

    // Pause zwischen Requests
    if (i < total - 1) await sleep(DELAY_MS)
  }

  console.log(`\nFertig: ${erfolge} aktualisiert, ${fehler} übersprungen.`)
}

main().catch(err => {
  console.error('Unerwarteter Fehler:', err)
  process.exit(1)
})
