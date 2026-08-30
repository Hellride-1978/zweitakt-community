import qrcode from 'qrcode-generator'

// Die Bibliothek kodiert Strings per Default als Latin-1 (c & 0xff) und würde
// Umlaute oder Sonderzeichen in URLs zerstören. Einmalig auf UTF-8 umstellen –
// entspricht dem UTF-8-Build von qrcode-generator, bleibt aber komplett offline.
qrcode.stringToBytes = (s) => Array.from(new TextEncoder().encode(s))

export const MM_PER_INCH = 25.4

export const FORMATS = [
  { key: 'a3',    label: 'A3',          hint: '29,7 × 42 cm', wMm: 297,   hMm: 420 },
  { key: 'a4',    label: 'A4',          hint: '21 × 29,7 cm', wMm: 210,   hMm: 297 },
  { key: '30x40', label: '30 × 40 cm',  hint: 'Rahmenformat', wMm: 300,   hMm: 400 },
  { key: '18x24', label: '18 × 24 in',  hint: '45,7 × 61 cm', wMm: 457.2, hMm: 609.6 },
]

export const DEFAULT_FORMAT_KEY = 'a3'
export const DPI_MIN = 72
export const DPI_MAX = 300
export const DEFAULT_DPI = 300

// Safari auf iOS begrenzt die Canvas-Fläche auf rund 16,7 Mio. Pixel und bricht
// darüber ohne Fehlermeldung ab. Ab dieser Schwelle warnen wir vorab.
export const PIXEL_WARN_THRESHOLD = 16_000_000

const DARK_INK = '#1a1108'
const LIGHT_INK = '#f7f5f0'

export const DEFAULT_PAPER = '#f6f3ec'

// Der Papierschleier über dem Cover-Hintergrund. Bei 0 % deckt er vollständig,
// das Cover ist dann unsichtbar; beim stärksten Wert bleiben 70 % Papier stehen.
// Die Schriftfarben werden gegen genau diesen Schleier gerechnet, siehe
// posterColors.
export const BACKDROP_VEIL_MIN = 0.70
export const BACKDROP_VEIL_MAX = 1
export const DEFAULT_BACKDROP_STRENGTH = 70

export function veilAlpha(strength) {
  const t = Math.min(100, Math.max(0, strength)) / 100
  return BACKDROP_VEIL_MAX - t * (BACKDROP_VEIL_MAX - BACKDROP_VEIL_MIN)
}

export const PAPER_PRESETS = [
  { key: 'papier',  label: 'Papier',  value: '#f6f3ec' },
  { key: 'weiss',   label: 'Weiß',    value: '#ffffff' },
  { key: 'sand',    label: 'Sand',    value: '#eadfc8' },
  { key: 'salbei',  label: 'Salbei',  value: '#d4e0d6' },
  { key: 'nacht',   label: 'Nacht',   value: '#1a1108' },
  { key: 'tiefsee', label: 'Tiefsee', value: '#16293d' },
]

function hexToRgb(hex) {
  const clean = String(hex).replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const n = Number.parseInt(full, 16)
  return Number.isNaN(n) ? [255, 255, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Relative Leuchtdichte nach WCAG – Grundlage für die Kontrastrechnung.
function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((value) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Mischt zwei Farben; t = 0 liefert a, t = 1 liefert b.
function mixHex(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return `#${ca
    .map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0'))
    .join('')}`
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * Leitet alle Posterfarben aus der gewählten Hintergrundfarbe ab. Die Schrift
 * wird nicht fest gesetzt, sondern es gewinnt die Variante mit dem größeren
 * Kontrast – sonst stünde auf dunklem Grund dunkler Text.
 */
export function posterColors(paper, backdropAlpha = 1) {
  // Mit Cover-Hintergrund liegt hinter der Schrift nicht mehr das reine Papier,
  // sondern Papier über einem beliebigen Bildausschnitt. Gerechnet wird deshalb
  // gegen die beiden Extremfälle – Cover komplett schwarz bzw. komplett weiss.
  // Sonst verspräche die Kontrastprüfung etwas, das im Druck nicht gilt.
  const backgrounds =
    backdropAlpha >= 1
      ? [paper]
      : [mixHex('#000000', paper, backdropAlpha), mixHex('#ffffff', paper, backdropAlpha)]

  const worstContrast = (color) =>
    Math.min(...backgrounds.map((bg) => contrastRatio(bg, color)))

  const onLight = worstContrast(DARK_INK)
  const onDark = worstContrast(LIGHT_INK)
  const useLight = onDark > onLight
  const ink = useLight ? LIGHT_INK : DARK_INK

  // Die gedämpfte Tinte für Tracknummern, Album und Datum entsteht durch
  // Mischen Richtung Papier. Bei mitteltonigem Untergrund reicht das nicht mehr
  // für lesbaren Text, deshalb wird schrittweise weniger gemischt – Lesbarkeit
  // geht vor feiner Abstufung.
  let inkSoft = ink
  for (const t of [0.35, 0.25, 0.15]) {
    const candidate = mixHex(ink, paper, t)
    if (worstContrast(candidate) >= 4.5) {
      inkSoft = candidate
      break
    }
  }

  return {
    paper,
    ink,
    inkSoft,
    placeholder: mixHex(paper, ink, 0.1),
    // Ein QR-Code braucht dunkle Module auf hellem Grund. Reicht der Kontrast
    // zum Papier nicht, bekommt er eine eigene helle Fläche untergelegt.
    qrNeedsPatch: onLight < 4,
    qrPatch: '#ffffff',
    qrInk: DARK_INK,
    // Massgeblich ist die schwächste tatsächlich verwendete Tinte auf dem
    // ungünstigsten Untergrund, sonst bliebe die Warnung genau dann aus, wenn
    // der Sekundärtext untergeht.
    textContrast: Math.min(worstContrast(ink), worstContrast(inkSoft)),
  }
}

export function getFormat(key) {
  return FORMATS.find((f) => f.key === key) || FORMATS[0]
}

export function pixelSize(format, dpi) {
  return {
    width: Math.round((format.wMm / MM_PER_INCH) * dpi),
    height: Math.round((format.hMm / MM_PER_INCH) * dpi),
  }
}

/* ───────────────────────── Text-Helfer ───────────────────────── */

// Zeichnet Text mit echtem Buchstabenabstand. ctx.letterSpacing wird nicht von
// allen Browsern unterstützt, deshalb Zeichen für Zeichen.
function spacedWidth(ctx, text, spacing) {
  let w = 0
  for (const ch of text) w += ctx.measureText(ch).width + spacing
  return text.length ? w - spacing : 0
}

function drawSpaced(ctx, text, x, y, spacing) {
  let cx = x
  for (const ch of text) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + spacing
  }
}

function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (ctx.measureText(text.slice(0, mid) + '…').width <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return text.slice(0, lo).trimEnd() + '…'
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const lines = []
  let current = words[0]
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`
    if (ctx.measureText(candidate).width <= maxWidth) current = candidate
    else {
      lines.push(current)
      current = words[i]
    }
  }
  lines.push(current)
  return lines
}

// Sucht die größte Schriftgröße, bei der der Text in maxLines Zeilen passt.
function fitBlock(ctx, text, family, maxWidth, maxSize, minSize, maxLines) {
  const step = Math.max(1, maxSize * 0.025)
  for (let size = maxSize; size >= minSize; size -= step) {
    ctx.font = `400 ${size}px "${family}"`
    const lines = wrapLines(ctx, text, maxWidth)
    // Ein einzelnes überlanges Wort lässt sich nicht umbrechen und ragt sonst
    // über den Satzspiegel hinaus – deshalb zusätzlich die Breite prüfen.
    const withinWidth = lines.every((line) => ctx.measureText(line).width <= maxWidth)
    if (lines.length <= maxLines && withinWidth) return { size, lines }
  }
  ctx.font = `400 ${minSize}px "${family}"`
  const all = wrapLines(ctx, text, maxWidth)
  const lines = all.slice(0, maxLines).map((line) => ellipsize(ctx, line, maxWidth))
  // Abgeschnittene Zeilen kennzeichnen, damit die Kürzung sichtbar bleibt.
  if (all.length > maxLines && lines.length && !lines[lines.length - 1].endsWith('…')) {
    lines[lines.length - 1] = ellipsize(ctx, `${lines[lines.length - 1]} …`, maxWidth)
  }
  return { size: minSize, lines }
}

/* Rechte Spalte gemeinsam umbrechen: Release, Interpret und Albumtitel müssen
   zusammen in die Höhe über dem QR-Code passen. Passt es nicht, werden Interpret
   und Album gemeinsam kleiner skaliert – so fällt nie ein Element ganz weg. */
function layoutRightColumn(ctx, content, opts) {
  const { W, rightW, availH, displayFamily } = opts
  const { release, artist, album } = content
  const dateSize = W * 0.019
  const STEPS = 11

  for (let step = 0; step <= STEPS; step++) {
    const scale = 1 - step * 0.05
    const dateGap = W * 0.022 * scale
    const midGap = W * 0.012 * scale
    const artistFit = artist
      ? fitBlock(ctx, artist, displayFamily, rightW, W * 0.062 * scale, W * 0.022 * scale, 2)
      : null
    const albumFit = album
      ? fitBlock(ctx, album, displayFamily, rightW, W * 0.036 * scale, W * 0.014 * scale, 2)
      : null

    let height = release ? dateSize + dateGap : 0
    if (artistFit) height += artistFit.lines.length * artistFit.size + midGap
    if (albumFit) height += albumFit.lines.length * albumFit.size * 1.08

    if (height <= availH || step === STEPS) {
      return { dateSize, dateGap, midGap, artist: artistFit, album: albumFit }
    }
  }
  return { dateSize, dateGap: 0, midGap: 0, artist: null, album: null }
}

/* ───────────────────────── Bausteine ───────────────────────── */

// Entspricht object-fit: cover – das Cover wird nie verzerrt, nur beschnitten.
function drawCoverImage(ctx, img, dx, dy, dw, dh) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) return
  const imgRatio = iw / ih
  const boxRatio = dw / dh
  let sw = iw
  let sh = ih
  if (imgRatio > boxRatio) sw = ih * boxRatio
  else sh = iw / boxRatio
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, dx, dy, dw, dh)
}

// Liefert null, wenn der Text nicht in einen QR-Code passt (max. ~2300 Byte).
// Die Bibliothek wirft dabei einen String, deshalb der weite catch.
function buildQr(text) {
  try {
    const qr = qrcode(0, 'M')
    qr.addData(text)
    qr.make()
    return qr
  } catch {
    return null
  }
}

/**
 * Zeichnet das Cover formatfüllend und stark unscharf als Hintergrund.
 *
 * Die Unschärfe entsteht nicht über ctx.filter = 'blur()' – das würde bei einem
 * A3-Export mit 300 dpi über 17 Millionen Pixel filtern und den Browser
 * sekundenlang blockieren. Stattdessen wird das Cover auf wenige Pixel
 * heruntergerechnet und wieder hochskaliert: Das Ergebnis ist praktisch
 * kostenlos, sieht in Vorschau und Export gleich aus und ist unabhängig von der
 * gewählten Auflösung.
 */
function drawBackdrop(ctx, img, W, H, colors, alpha) {
  const SMALL_W = 40
  const small = document.createElement('canvas')
  small.width = SMALL_W
  small.height = Math.max(1, Math.round((SMALL_W * H) / W))
  const smallCtx = small.getContext('2d')
  if (!smallCtx) return
  // Der Verkleinerungsschritt ist der einzige verlustbehaftete – ohne 'high'
  // saehe der Hintergrund je nach Aufloesung der Quelldatei anders aus.
  smallCtx.imageSmoothingEnabled = true
  smallCtx.imageSmoothingQuality = 'high'
  drawCoverImage(smallCtx, img, 0, 0, small.width, small.height)

  // Zwischenstufe: Zwei sanfte Vergrößerungen statt einer harten – sonst
  // zeichnen sich die Kanten der Ausgangspixel im Verlauf ab.
  const mid = document.createElement('canvas')
  mid.width = 480
  mid.height = Math.max(1, Math.round((480 * H) / W))
  const midCtx = mid.getContext('2d')
  if (!midCtx) return
  midCtx.imageSmoothingEnabled = true
  midCtx.imageSmoothingQuality = 'high'
  midCtx.drawImage(small, 0, 0, mid.width, mid.height)

  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  // Über das Format hinaus vergrößern und mittig beschneiden: Der Hintergrund
  // ist dadurch kein deckungsgleiches Abbild des scharfen Covers mehr, sondern
  // ein eigener Farbverlauf.
  const zoom = 1.35
  ctx.drawImage(mid, (W - W * zoom) / 2, (H - H * zoom) / 2, W * zoom, H * zoom)
  // Papierfarbe darüber, damit die Schrift ihren Kontrast behält.
  ctx.globalAlpha = alpha
  ctx.fillStyle = colors.paper
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

function drawQr(ctx, qr, x, y, size, colors) {
  const count = qr.getModuleCount()
  const quiet = 2
  const cell = size / (count + quiet * 2)

  if (colors.qrNeedsPatch) {
    ctx.fillStyle = colors.qrPatch
    ctx.fillRect(x, y, size, size)
  }
  ctx.fillStyle = colors.qrInk
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.isDark(row, col)) continue
      // Auf ganze Pixel runden, sonst entstehen Haarrisse zwischen den Modulen
      // und der Code wird unter Umständen nicht mehr erkannt.
      const x0 = x + Math.round((col + quiet) * cell)
      const y0 = y + Math.round((row + quiet) * cell)
      const x1 = x + Math.round((col + quiet + 1) * cell)
      const y1 = y + Math.round((row + quiet + 1) * cell)
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
    }
  }
}

// Registrier-Ecken – das Signature-Element im Zweitakthoden-Druckstil.
function drawRegistrationCorners(ctx, W, H, margin, colors) {
  const inset = margin * 0.42
  const arm = W * 0.028
  ctx.strokeStyle = colors.ink
  ctx.lineWidth = Math.max(1, W * 0.0032)
  ctx.lineCap = 'butt'
  const corners = [
    [inset, inset, 1, 1],
    [W - inset, inset, -1, 1],
    [inset, H - inset, 1, -1],
    [W - inset, H - inset, -1, -1],
  ]
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath()
    ctx.moveTo(cx, cy + sy * arm)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx + sx * arm, cy)
    ctx.stroke()
  }
}

/* ───────────────────────── Poster ───────────────────────── */

/**
 * Zeichnet das komplette Poster. Dieselbe Funktion bedient Vorschau und Export,
 * damit die Vorschau garantiert dem exportierten PNG entspricht.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W Breite in Pixeln
 * @param {number} H Höhe in Pixeln
 * @param {object} data Posterinhalt
 */
export function drawPoster(ctx, W, H, data) {
  const {
    cover = null,
    artist = '',
    album = '',
    release = '',
    tracks = [],
    qrUrl = '',
    paper = DEFAULT_PAPER,
    backdrop = false,
    backdropStrength = DEFAULT_BACKDROP_STRENGTH,
    displayFamily,
    monoFamily,
    sansFamily,
  } = data

  // Bei Stärke 0 deckt der Schleier vollständig – dann gibt es nichts zu
  // zeichnen und der QR-Code braucht auch keine eigene Fläche.
  const alpha = veilAlpha(backdropStrength)
  const activeBackdrop = backdrop && Boolean(cover) && alpha < 1
  const colors = posterColors(paper, activeBackdrop ? alpha : 1)

  ctx.save()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = colors.paper
  ctx.fillRect(0, 0, W, H)
  if (activeBackdrop) {
    drawBackdrop(ctx, cover, W, H, colors, alpha)
  }
  ctx.textBaseline = 'alphabetic'

  const margin = W * 0.062
  const innerW = W - margin * 2

  /* Cover – quadratisch, oben, unverändert (kein Filter, kein Duotone) */
  const coverTop = margin
  const coverSize = innerW
  if (cover) {
    drawCoverImage(ctx, cover, margin, coverTop, coverSize, coverSize)
  } else {
    ctx.fillStyle = colors.placeholder
    ctx.fillRect(margin, coverTop, coverSize, coverSize)
    ctx.fillStyle = colors.inkSoft
    ctx.font = `400 ${W * 0.022}px "${monoFamily}"`
    const spacing = W * 0.008
    const labelX = margin + coverSize / 2 - spacedWidth(ctx, 'COVER', spacing) / 2
    drawSpaced(ctx, 'COVER', labelX, coverTop + coverSize / 2, spacing)
  }
  ctx.strokeStyle = colors.ink
  ctx.lineWidth = Math.max(1, W * 0.002)
  ctx.strokeRect(margin, coverTop, coverSize, coverSize)

  /* Trenner */
  const ruleY = coverTop + coverSize + W * 0.042
  ctx.strokeStyle = colors.ink
  ctx.lineWidth = Math.max(1, W * 0.0045)
  ctx.beginPath()
  ctx.moveTo(margin, ruleY)
  ctx.lineTo(W - margin, ruleY)
  ctx.stroke()

  const bodyTop = ruleY + W * 0.038
  const bodyBottom = H - margin
  const bodyH = Math.max(0, bodyBottom - bodyTop)

  const leftW = innerW * 0.51
  const rightW = innerW * 0.44
  const rightX = margin + innerW - rightW

  /* ── Rechte Spalte: Release, Artist, Album, QR-Code ── */
  const qrSize = Math.min(innerW * 0.155, bodyH * 0.42)
  const qr = qrUrl ? buildQr(qrUrl) : null
  const hasQr = Boolean(qr)
  const qrY = bodyBottom - qrSize
  if (hasQr) {
    // Mit Cover-Hintergrund liegt hinter dem Code kein einheitliches Papier
    // mehr, sondern ein durchscheinendes Bild. Der Kontrast der Module lässt
    // sich dann nicht mehr aus der Papierfarbe ableiten – der Code bekommt
    // deshalb immer seine eigene helle Fläche.
    drawQr(ctx, qr, rightX, qrY, qrSize, {
      ...colors,
      qrNeedsPatch: colors.qrNeedsPatch || activeBackdrop,
    })
    ctx.fillStyle = colors.inkSoft
    ctx.font = `400 ${W * 0.0145}px "${monoFamily}"`
    const capX = rightX + qrSize + W * 0.018
    const capSpacing = W * 0.0022
    drawSpaced(ctx, 'HÖR REIN', capX, qrY + qrSize * 0.46, capSpacing)
    drawSpaced(ctx, 'APPLE MUSIC', capX, qrY + qrSize * 0.46 + W * 0.024, capSpacing)
  }

  const textBottom = hasQr ? qrY - W * 0.03 : bodyBottom
  const layout = layoutRightColumn(
    ctx,
    { release, artist, album },
    { W, rightW, availH: textBottom - bodyTop, displayFamily }
  )
  let cursorY = bodyTop

  if (release) {
    ctx.font = `400 ${layout.dateSize}px "${monoFamily}"`
    ctx.fillStyle = colors.inkSoft
    cursorY += layout.dateSize
    drawSpaced(ctx, release.toUpperCase(), rightX, cursorY, W * 0.0026)
    cursorY += layout.dateGap
  }

  if (layout.artist) {
    // fitBlock hat ctx.font zuletzt für die Messung gesetzt – vor dem Zeichnen neu setzen.
    ctx.font = `400 ${layout.artist.size}px "${displayFamily}"`
    ctx.fillStyle = colors.ink
    for (const line of layout.artist.lines) {
      cursorY += layout.artist.size * 0.86
      ctx.fillText(line, rightX, cursorY)
      cursorY += layout.artist.size * 0.14
    }
    cursorY += layout.midGap
  }

  if (layout.album) {
    ctx.font = `400 ${layout.album.size}px "${displayFamily}"`
    ctx.fillStyle = colors.inkSoft
    for (const line of layout.album.lines) {
      cursorY += layout.album.size * 0.92
      ctx.fillText(line, rightX, cursorY)
      cursorY += layout.album.size * 0.16
    }
  }

  /* ── Linke Spalte: Tracklist ── */
  const list = tracks.filter((t) => t && t.trim())
  if (list.length) {
    const maxSize = W * 0.0175
    const minSize = W * 0.008

    // Kurze Tracklisten bekommen eine einzige, breite Spalte – sonst müssten
    // Titel unnötig gekürzt werden. Erst wenn es in der Höhe nicht mehr
    // aufgeht, wird auf zwei Spalten umgebrochen.
    const rowsAtMaxSize = Math.max(1, Math.floor(bodyH / (maxSize * 1.75)))
    const rowsAtMinSize = Math.max(1, Math.floor(bodyH / (minSize * 1.75)))

    let cols = 1
    if (list.length > rowsAtMaxSize) cols = 2
    if (Math.ceil(list.length / 2) > rowsAtMinSize) cols = 3

    const colGap = cols === 1 ? 0 : leftW * 0.06
    const colW = (leftW - colGap * (cols - 1)) / cols
    const rows = Math.ceil(list.length / cols)
    // Was selbst in drei Spalten bei kleinster Schrift nicht mehr passt, wird
    // abgeschnitten – besser als Text, der unten aus dem Poster läuft.
    const visible = list.slice(0, cols * rowsAtMinSize)

    let size = maxSize
    while (size > minSize && rows * size * 1.75 > bodyH) size -= W * 0.0004
    const lineH = size * 1.75
    const numW = size * 1.9

    for (let i = 0; i < visible.length; i++) {
      const col = Math.floor(i / rows)
      const row = i - col * rows
      const x = margin + col * (colW + colGap)
      const y = bodyTop + row * lineH + size

      ctx.font = `400 ${size * 0.92}px "${monoFamily}"`
      ctx.fillStyle = colors.inkSoft
      ctx.fillText(String(i + 1).padStart(2, '0'), x, y)

      ctx.font = `400 ${size}px "${sansFamily}"`
      ctx.fillStyle = colors.ink
      ctx.fillText(ellipsize(ctx, visible[i].trim(), colW - numW), x + numW, y)
    }
  }

  drawRegistrationCorners(ctx, W, H, margin, colors)
  ctx.restore()
}

/**
 * Lädt die benötigten Schriften nach, bevor auf den Canvas gezeichnet wird.
 * Ohne diesen Schritt rendert der erste Export mit der Fallback-Schrift.
 */
export async function ensureFontsLoaded(families) {
  if (typeof document === 'undefined' || !document.fonts) return
  await Promise.all(
    families.filter(Boolean).map((family) =>
      document.fonts.load(`400 100px "${family}"`).catch(() => {})
    )
  )
  await document.fonts.ready
}
