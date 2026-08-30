import {
  Abril_Fatface,
  Alfa_Slab_One,
  Anton,
  Archivo_Black,
  Bebas_Neue,
  Boogaloo,
  Bungee,
  Lobster,
  Monoton,
  New_Rocker,
  Oswald,
  Permanent_Marker,
  Playfair_Display,
  Righteous,
  Space_Grotesk,
  Staatliches,
  Titan_One,
} from 'next/font/google'

// Alle Poster-Schriften sind vorab bekannt und werden deshalb statisch über
// next/font/google eingebunden – kein Nachladen von fonts.googleapis.com zur
// Laufzeit. next/font hostet die Dateien selbst, dadurch bleibt der Canvas
// beim PNG-Export sauber (gleiche Origin, kein CORS-Problem).
//
// preload: false, weil es viele sind: Vorgeladen werden sie sonst alle beim
// Seitenaufruf, obwohl sie erst gebraucht werden, wenn die Schriftauswahl
// aufgeklappt wird. Geladen werden sie weiterhin automatisch, sobald sie
// tatsächlich gezeichnet werden.
// next/font wird zur Buildzeit ausgewertet – die Optionen muessen literal
// dastehen, ein gemeinsames Objekt laesst sich nicht hineinspreaden.
//
// latin-ext deckt Zeichen wie Ł, ż oder ğ ab. Dank unicode-range laedt der
// Browser die zusaetzlichen Dateien nur, wenn sie wirklich gebraucht werden.

const abrilFatface    = Abril_Fatface({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const alfaSlabOne     = Alfa_Slab_One({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const anton           = Anton({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const archivoBlack    = Archivo_Black({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const bebasNeue       = Bebas_Neue({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const boogaloo        = Boogaloo({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const bungee          = Bungee({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const lobster         = Lobster({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const monoton         = Monoton({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const newRocker       = New_Rocker({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const oswald          = Oswald({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const permanentMarker = Permanent_Marker({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const playfairDisplay = Playfair_Display({ weight: '800', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const righteous       = Righteous({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const spaceGrotesk    = Space_Grotesk({ weight: '700', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const staatliches     = Staatliches({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })
const titanOne        = Titan_One({ weight: '400', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false })

// `font.style.fontFamily` liefert eine Liste wie `'__Anton_ab12', '__Anton_Fallback_ab12'`.
// Für ctx.font und document.fonts.load() brauchen wir nur den ersten Namen.
function primaryFamily(fontFamily) {
  const first = fontFamily.split(',')[0].trim()
  return first.replace(/^['"]|['"]$/g, '')
}

// Das Gewicht muss mitgeführt werden: Der Canvas kennt die CSS-Klasse nicht und
// braucht es in ctx.font. Es wird direkt aus next/font gelesen statt hier noch
// einmal gepflegt – sonst koennten beide auseinanderlaufen und das Poster fiele
// still auf die Fallback-Schrift zurueck.
function entry(key, label, font) {
  return {
    key,
    label,
    weight: String(font.style.fontWeight || 400),
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
  entry('staatliches', 'Staatliches', staatliches),
  entry('spacegrotesk', 'Space Grotesk', spaceGrotesk),
  entry('righteous', 'Righteous', righteous),
  entry('titan', 'Titan One', titanOne),
  entry('bungee', 'Bungee', bungee),
  entry('alfaslab', 'Alfa Slab One', alfaSlabOne),
  entry('playfair', 'Playfair Display', playfairDisplay),
  entry('abril', 'Abril Fatface', abrilFatface),
  entry('monoton', 'Monoton', monoton),
  entry('newrocker', 'New Rocker', newRocker),
  entry('lobster', 'Lobster', lobster),
  entry('marker', 'Permanent Marker', permanentMarker),
]

export const DEFAULT_FONT_KEY = 'boogaloo'

export function getPosterFont(key) {
  return POSTER_FONTS.find((f) => f.key === key) || POSTER_FONTS[0]
}
