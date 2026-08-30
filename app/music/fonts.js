import {
  Anton,
  Archivo_Black,
  Bebas_Neue,
  Boogaloo,
  Oswald,
  Permanent_Marker,
  Righteous,
} from 'next/font/google'

// Alle Poster-Schriften sind vorab bekannt und werden deshalb statisch über
// next/font/google eingebunden – kein Nachladen von fonts.googleapis.com zur
// Laufzeit. next/font hostet die Dateien selbst, dadurch bleibt der Canvas
// beim PNG-Export sauber (gleiche Origin, kein CORS-Problem).
const anton           = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })
const archivoBlack    = Archivo_Black({ weight: '400', subsets: ['latin'], display: 'swap' })
const bebasNeue       = Bebas_Neue({ weight: '400', subsets: ['latin'], display: 'swap' })
const boogaloo        = Boogaloo({ weight: '400', subsets: ['latin'], display: 'swap' })
const oswald          = Oswald({ weight: '400', subsets: ['latin'], display: 'swap' })
const permanentMarker = Permanent_Marker({ weight: '400', subsets: ['latin'], display: 'swap' })
const righteous       = Righteous({ weight: '400', subsets: ['latin'], display: 'swap' })

// `font.style.fontFamily` liefert eine Liste wie `'__Anton_ab12', '__Anton_Fallback_ab12'`.
// Für ctx.font und document.fonts.load() brauchen wir nur den ersten Namen.
function primaryFamily(fontFamily) {
  const first = fontFamily.split(',')[0].trim()
  return first.replace(/^['"]|['"]$/g, '')
}

function entry(key, label, font) {
  return {
    key,
    label,
    className: font.className,
    // Vollständige Liste inkl. Fallback – für CSS
    stack: font.style.fontFamily,
    // Nur der erste Name – für Canvas und die FontFace-API
    family: primaryFamily(font.style.fontFamily),
  }
}

export const POSTER_FONTS = [
  entry('boogaloo', 'Boogaloo', boogaloo),
  entry('anton', 'Anton', anton),
  entry('bebas', 'Bebas Neue', bebasNeue),
  entry('archivo', 'Archivo Black', archivoBlack),
  entry('oswald', 'Oswald', oswald),
  entry('righteous', 'Righteous', righteous),
  entry('marker', 'Permanent Marker', permanentMarker),
]

export const DEFAULT_FONT_KEY = 'boogaloo'

export function getPosterFont(key) {
  return POSTER_FONTS.find((f) => f.key === key) || POSTER_FONTS[0]
}
