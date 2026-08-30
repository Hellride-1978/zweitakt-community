'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { validateImageFile } from '@/lib/validateImage'
import { POSTER_FONTS, DEFAULT_FONT_KEY, getPosterFont } from './fonts'
import {
  FORMATS,
  DEFAULT_FORMAT_KEY,
  DEFAULT_DPI,
  DEFAULT_PAPER,
  DPI_MIN,
  DPI_MAX,
  PAPER_PRESETS,
  PIXEL_WARN_THRESHOLD,
  drawPoster,
  ensureFontsLoaded,
  getFormat,
  pixelSize,
  posterColors,
} from './poster'
import './music.css'

const EMPTY_FORM = { artist: '', album: '', release: '', tracksText: '', qrUrl: '' }
const IDLE_SEARCH = { status: 'idle', results: [] }

/* Liest den echten Familiennamen aus einer CSS-Variablen des Root-Layouts.
   next/font vergibt generierte Namen wie `__DM_Mono_a1b2` – die brauchen wir
   für ctx.font, weil der Canvas keine CSS-Variablen kennt. */
function familyFromCssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!value) return fallback
  return value.split(',')[0].trim().replace(/^['"]|['"]$/g, '')
}

function siteFamilies() {
  return {
    mono: familyFromCssVar('--font-mono', 'monospace'),
    sans: familyFromCssVar('--font-sans', 'sans-serif'),
  }
}

function formatReleaseDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function releaseYear(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear())
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Ein A3-Canvas mit 300 dpi belegt rund 70 MB. Nach dem Export sofort freigeben,
// sonst hält der Browser den Speicher bis zur nächsten Garbage Collection.
function releaseCanvas(canvas) {
  canvas.width = 0
  canvas.height = 0
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function PosterGenerator() {
  const [manualMode, setManualMode] = useState(false)

  const [artistQuery, setArtistQuery] = useState('')
  const [search, setSearch] = useState(IDLE_SEARCH)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [albums, setAlbums] = useState([])
  const [albumsLoading, setAlbumsLoading] = useState(false)
  const [selectedAlbumId, setSelectedAlbumId] = useState(null)
  const [tracksLoading, setTracksLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [coverSrc, setCoverSrc] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [coverError, setCoverError] = useState(null)
  const [uploadUrl, setUploadUrl] = useState(null)

  const [fontKey, setFontKey] = useState(DEFAULT_FONT_KEY)
  const [paper, setPaper] = useState(DEFAULT_PAPER)
  const [formatKey, setFormatKey] = useState(DEFAULT_FORMAT_KEY)
  const [dpi, setDpi] = useState(DEFAULT_DPI)

  const [exporting, setExporting] = useState(null) // null | 'png' | 'pdf'
  const [exportError, setExportError] = useState(null)

  const canvasRef = useRef(null)
  const previewWrapRef = useRef(null)
  const fileInputRef = useRef(null)
  const albumRequest = useRef(0)
  const [previewWidth, setPreviewWidth] = useState(0)

  const format = getFormat(formatKey)
  const font = getPosterFont(fontKey)
  const exportSize = pixelSize(format, dpi)
  const exportPixels = exportSize.width * exportSize.height
  const showResults = !manualMode && artistQuery.trim().length >= 2
  const paperContrast = posterColors(paper).textContrast

  const tracks = useMemo(
    () => form.tracksText.split('\n').map((t) => t.trim()).filter(Boolean),
    [form.tracksText]
  )

  const posterContent = useMemo(
    () => ({
      // Ohne Quelle gilt auch ein noch geladenes Bild als "kein Cover".
      cover: coverSrc ? coverImage : null,
      artist: form.artist,
      album: form.album,
      release: form.release,
      tracks,
      qrUrl: form.qrUrl.trim(),
      paper,
      displayFamily: font.family,
    }),
    [coverSrc, coverImage, form, tracks, paper, font.family]
  )

  // Die Schriften der Seite stehen nur im Browser fest, deshalb erst beim
  // Zeichnen auflösen – so braucht es dafür keinen State.
  const buildPosterData = useCallback(() => {
    const { mono, sans } = siteFamilies()
    return { ...posterContent, monoFamily: mono, sansFamily: sans }
  }, [posterContent])

  /* ── Interpreten-Suche (entprellt) ── */
  useEffect(() => {
    const term = artistQuery.trim()
    if (manualMode || term.length < 2) return undefined

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setSearch({ status: 'loading', results: [] })
      try {
        const res = await fetch(`/api/itunes?type=artists&term=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        setSearch({ status: 'done', results: data.results || [] })
        setApiError(null)
      } catch (err) {
        if (err.name === 'AbortError') return
        setSearch({ status: 'done', results: [] })
        setApiError('Die Suche ist gerade nicht erreichbar.')
      }
    }, 350)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [artistQuery, manualMode])

  /* ── Alben des gewählten Interpreten ── */
  const loadAlbums = useCallback(async (artist) => {
    setSelectedArtist(artist)
    setSearch(IDLE_SEARCH)
    setAlbums([])
    setSelectedAlbumId(null)
    setAlbumsLoading(true)
    try {
      const res = await fetch(`/api/itunes?type=albums&artistId=${artist.id}`)
      const data = await res.json()
      setAlbums(data.results || [])
      setApiError(null)
    } catch {
      setApiError('Die Alben konnten nicht geladen werden.')
    } finally {
      setAlbumsLoading(false)
    }
  }, [])

  /* ── Album wählen: Tracklist, Cover, Release und Apple-Music-Link füllen ── */
  const chooseAlbum = useCallback(async (album) => {
    // Bei schnellen Klicks darf eine verspätete Antwort das inzwischen gewählte
    // Album nicht mehr überschreiben.
    const token = albumRequest.current + 1
    albumRequest.current = token

    setSelectedAlbumId(album.id)
    setTracksLoading(true)
    setCoverError(null)
    setForm((prev) => ({
      ...prev,
      artist: album.artist || prev.artist,
      album: album.name || prev.album,
      release: formatReleaseDate(album.releaseDate) || prev.release,
      // collectionViewUrl kommt direkt aus der API – kein konstruierter Link.
      qrUrl: album.appleMusicUrl || prev.qrUrl,
    }))

    if (album.artworkPrint) {
      setUploadUrl(null)
      setCoverSrc(`/api/artwork?url=${encodeURIComponent(album.artworkPrint)}`)
    } else if (!uploadUrl) {
      // Ohne eigenes Bild darf nicht das Cover des vorher gewählten Albums stehen bleiben.
      setCoverSrc(null)
    }

    try {
      const res = await fetch(`/api/itunes?type=tracks&collectionId=${album.id}`)
      const data = await res.json()
      if (albumRequest.current !== token) return
      const list = data.results || []
      setForm((prev) => ({
        ...prev,
        tracksText: list.length ? list.map((t) => t.name).join('\n') : prev.tracksText,
        qrUrl: data.album?.appleMusicUrl || prev.qrUrl,
      }))
      setApiError(null)
    } catch {
      if (albumRequest.current !== token) return
      setApiError('Die Tracklist konnte nicht geladen werden – trag sie einfach von Hand ein.')
    } finally {
      if (albumRequest.current === token) setTracksLoading(false)
    }
  }, [uploadUrl])

  /* ── Cover laden ── */
  useEffect(() => {
    if (!coverSrc) return undefined
    let active = true
    const img = new Image()
    // Beide Quellen liegen auf der eigenen Origin (Proxy-Route bzw. Blob-URL),
    // der Canvas bleibt damit exportierbar.
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!active) return
      setCoverImage(img)
      setCoverError(null)
    }
    img.onerror = () => {
      if (!active) return
      setCoverImage(null)
      setCoverError('Das Cover konnte nicht geladen werden. Lade stattdessen ein eigenes Bild hoch.')
    }
    img.src = coverSrc
    return () => {
      active = false
    }
  }, [coverSrc])

  useEffect(() => () => {
    if (uploadUrl) URL.revokeObjectURL(uploadUrl)
  }, [uploadUrl])

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const error = validateImageFile(file)
    if (error) {
      setCoverError(error)
      return
    }
    if (uploadUrl) URL.revokeObjectURL(uploadUrl)
    const url = URL.createObjectURL(file)
    setUploadUrl(url)
    setCoverSrc(url)
    setCoverError(null)
  }

  const removeCover = () => {
    if (uploadUrl) URL.revokeObjectURL(uploadUrl)
    setUploadUrl(null)
    setCoverSrc(null)
    setCoverError(null)
  }

  /* ── Vorschau: gleiche Zeichenfunktion wie der Export ── */
  useEffect(() => {
    const wrap = previewWrapRef.current
    if (!wrap) return undefined
    // Der ResizeObserver meldet sich direkt nach observe() mit der Startbreite.
    const observer = new ResizeObserver((entries) => {
      setPreviewWidth(entries[0].contentRect.width)
    })
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || previewWidth <= 0) return undefined
    let active = true
    const data = buildPosterData()
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const cssHeight = (previewWidth * format.hMm) / format.wMm

    ensureFontsLoaded([data.displayFamily, data.monoFamily, data.sansFamily]).then(() => {
      if (!active) return
      canvas.width = Math.round(previewWidth * ratio)
      canvas.height = Math.round(cssHeight * ratio)
      canvas.style.height = `${cssHeight}px`
      const ctx = canvas.getContext('2d')
      if (ctx) drawPoster(ctx, canvas.width, canvas.height, data)
    })

    return () => {
      active = false
    }
  }, [buildPosterData, previewWidth, format])

  /* ── Export ── */
  const renderExportCanvas = async () => {
    const { width, height } = pixelSize(format, dpi)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas konnte nicht erstellt werden.')
    const data = buildPosterData()
    await ensureFontsLoaded([data.displayFamily, data.monoFamily, data.sansFamily])
    drawPoster(ctx, width, height, data)
    return canvas
  }

  const baseFilename = () => {
    const name = [form.artist, form.album].filter(Boolean).map(slugify).filter(Boolean).join('-')
    return `poster-${name || 'album'}-${format.key}-${dpi}dpi`
  }

  const exportPng = async () => {
    setExporting('png')
    setExportError(null)
    try {
      const canvas = await renderExportCanvas()
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      releaseCanvas(canvas)
      if (!blob) throw new Error('Canvas lieferte kein Bild')
      triggerDownload(blob, `${baseFilename()}.png`)
    } catch {
      setExportError(
        'Der Export ist fehlgeschlagen – vermutlich ist die Auflösung für diesen Browser zu hoch. Stell die dpi niedriger ein und probier es nochmal.'
      )
    } finally {
      setExporting(null)
    }
  }

  const exportPdf = async () => {
    setExporting('pdf')
    setExportError(null)
    try {
      const canvas = await renderExportCanvas()
      const image = canvas.toDataURL('image/jpeg', 0.94)
      releaseCanvas(canvas)
      const { jsPDF } = await import('jspdf')
      // Seitengröße in mm, nicht in px – sonst stimmt die Druckgröße nicht.
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [format.wMm, format.hMm] })
      pdf.addImage(image, 'JPEG', 0, 0, format.wMm, format.hMm)
      pdf.save(`${baseFilename()}.pdf`)
    } catch {
      setExportError(
        'Das PDF konnte nicht erzeugt werden – bei sehr hohen dpi-Werten geht dem Browser der Speicher aus. Versuch es mit einem niedrigeren Wert.'
      )
    } finally {
      setExporting(null)
    }
  }

  const resetSearch = () => {
    setSelectedArtist(null)
    setAlbums([])
    setSelectedAlbumId(null)
    setArtistQuery('')
    setSearch(IDLE_SEARCH)
  }

  const setField = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }))

  const busy = exporting !== null

  return (
    <div className="mp-root">
      <div className="mp-head">
        <div className="zd-mono accent">Poster-Generator</div>
        <h1 className="zd-h1" style={{ marginTop: 6 }}>
          Dein Album.<br />
          <em>An deiner Wand.</em>
        </h1>
        <p className="zh-page-lead">
          Interpret suchen, Album wählen, Format einstellen – fertig ist das Druckfile. Cover und
          Tracklist kommen direkt von Apple, der QR-Code führt zum Album in Apple Music.
        </p>
      </div>

      <div className="mp-layout">
        <div className="mp-controls">
          {/* ── Suche ── */}
          <section className="zd-card mp-panel">
            <div className="mp-panel-head">
              <h2 className="zd-h3">1 — Album finden</h2>
              <div className="tab-pills" role="group" aria-label="Eingabemodus">
                <button
                  type="button"
                  className={`tab-pill${manualMode ? '' : ' on'}`}
                  onClick={() => setManualMode(false)}
                  aria-pressed={!manualMode}
                >
                  Suche
                </button>
                <button
                  type="button"
                  className={`tab-pill${manualMode ? ' on' : ''}`}
                  onClick={() => setManualMode(true)}
                  aria-pressed={manualMode}
                >
                  Manuell
                </button>
              </div>
            </div>

            {manualMode ? (
              <p className="mp-hint">
                Manueller Modus: Trag Interpret, Album und Tracklist unten selbst ein und lade ein
                eigenes Cover hoch. Es wird nichts bei Apple abgefragt.
              </p>
            ) : !selectedArtist ? (
              <>
                <div className="mp-field">
                  <label className="zh-label" htmlFor="mp-artist-search">Interpret</label>
                  <input
                    id="mp-artist-search"
                    className="zh-input"
                    type="search"
                    value={artistQuery}
                    onChange={(e) => setArtistQuery(e.target.value)}
                    placeholder="z. B. Nirvana"
                    autoComplete="off"
                  />
                </div>
                {showResults && search.status === 'loading' && <p className="mp-hint">Suche läuft …</p>}
                {showResults && search.status === 'done' && !search.results.length && (
                  <p className="mp-hint">
                    Nichts gefunden. Wechsel auf „Manuell“ und trag die Daten selbst ein.
                  </p>
                )}
                {showResults && search.results.length > 0 && (
                  <ul className="mp-result-list">
                    {search.results.map((artist) => (
                      <li key={artist.id}>
                        <button type="button" className="mp-result" onClick={() => loadAlbums(artist)}>
                          <span className="mp-result-name">{artist.name}</span>
                          {artist.genre && <span className="mp-result-meta">{artist.genre}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>
                <div className="mp-artist-bar">
                  <span className="zh-pill">{selectedArtist.name}</span>
                  <button type="button" className="zd-btn-sm" onClick={resetSearch}>
                    Anderer Interpret
                  </button>
                </div>
                {albumsLoading && <p className="mp-hint">Alben werden geladen …</p>}
                {!albumsLoading && !albums.length && (
                  <p className="mp-hint">Zu diesem Interpreten sind keine Alben hinterlegt.</p>
                )}
                {albums.length > 0 && (
                  <ul className="mp-album-grid">
                    {albums.map((album) => (
                      <li key={album.id}>
                        <button
                          type="button"
                          className={`mp-album${selectedAlbumId === album.id ? ' is-active' : ''}`}
                          onClick={() => chooseAlbum(album)}
                          aria-pressed={selectedAlbumId === album.id}
                        >
                          {album.artwork ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              className="mp-album-cover"
                              src={`/api/artwork?url=${encodeURIComponent(album.artwork)}`}
                              alt=""
                              loading="lazy"
                              width={100}
                              height={100}
                            />
                          ) : (
                            <span className="mp-album-cover mp-album-cover--empty" aria-hidden="true" />
                          )}
                          <span className="mp-album-name">{album.name}</span>
                          <span className="mp-album-meta">
                            {releaseYear(album.releaseDate)}
                            {album.trackCount ? ` · ${album.trackCount} Tracks` : ''}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {tracksLoading && <p className="mp-hint">Tracklist wird geladen …</p>}
              </>
            )}

            {apiError && <p className="zh-error" style={{ marginTop: 14 }}>{apiError}</p>}
          </section>

          {/* ── Text ── */}
          <section className="zd-card mp-panel">
            <h2 className="zd-h3">2 — Text</h2>
            <p className="mp-hint">Alles frei überschreibbar – die Suche füllt die Felder nur vor.</p>

            <div className="mp-field-row">
              <div className="mp-field">
                <label className="zh-label" htmlFor="mp-artist">Interpret</label>
                <input id="mp-artist" className="zh-input" value={form.artist} onChange={setField('artist')} />
              </div>
              <div className="mp-field">
                <label className="zh-label" htmlFor="mp-album">Album</label>
                <input id="mp-album" className="zh-input" value={form.album} onChange={setField('album')} />
              </div>
            </div>

            <div className="mp-field">
              <label className="zh-label" htmlFor="mp-release">Release</label>
              <input
                id="mp-release"
                className="zh-input"
                value={form.release}
                onChange={setField('release')}
                placeholder="24. September 1991"
              />
            </div>

            <div className="mp-field">
              <label className="zh-label" htmlFor="mp-tracks">
                Tracklist — ein Titel pro Zeile ({tracks.length})
              </label>
              <textarea
                id="mp-tracks"
                className="zh-input mp-textarea"
                rows={8}
                value={form.tracksText}
                onChange={setField('tracksText')}
                placeholder={'Smells Like Teen Spirit\nIn Bloom\nCome as You Are'}
              />
            </div>

            <div className="mp-field">
              <label className="zh-label" htmlFor="mp-qr">Apple-Music-Link für den QR-Code</label>
              <input
                id="mp-qr"
                className="zh-input"
                type="url"
                value={form.qrUrl}
                onChange={setField('qrUrl')}
                placeholder="https://music.apple.com/de/album/…"
              />
              <p className="mp-hint">
                Wird bei der Suche automatisch übernommen. Ohne Link bleibt die Ecke frei.
              </p>
            </div>
          </section>

          {/* ── Cover ── */}
          <section className="zd-card mp-panel">
            <h2 className="zd-h3">3 — Cover</h2>
            <p className="mp-hint">
              Das Cover wird unverändert übernommen – kein Filter, kein Duotone, nur passend
              zugeschnitten. Für großformatigen Druck lohnt ein eigenes Bild in hoher Auflösung.
            </p>
            <div className="mp-cover-row">
              <div className="mp-cover-thumb">
                {coverSrc && coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={coverSrc} alt="Gewähltes Cover" />
                ) : (
                  <span className="mp-cover-empty">Kein Cover</span>
                )}
              </div>
              <div className="mp-cover-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleUpload}
                  className="sr-only"
                  id="mp-upload"
                />
                <button type="button" className="zd-btn outline" onClick={() => fileInputRef.current?.click()}>
                  Eigenes Bild
                </button>
                {coverSrc && (
                  <button type="button" className="zd-btn-sm" onClick={removeCover}>
                    Entfernen
                  </button>
                )}
              </div>
            </div>
            {coverError && <p className="zh-error" style={{ marginTop: 14 }}>{coverError}</p>}
          </section>

          {/* ── Gestaltung ── */}
          <section className="zd-card mp-panel">
            <h2 className="zd-h3">4 — Gestaltung</h2>

            <div className="mp-field">
              <span className="zh-label">Hintergrund</span>
              <div className="mp-paper-row">
                {PAPER_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className={`mp-paper${paper.toLowerCase() === preset.value ? ' is-active' : ''}`}
                    style={{ background: preset.value }}
                    onClick={() => setPaper(preset.value)}
                    aria-pressed={paper.toLowerCase() === preset.value}
                    title={preset.label}
                  >
                    <span className="sr-only">{preset.label}</span>
                  </button>
                ))}
                <label className="mp-paper mp-paper-custom" title="Eigene Farbe">
                  <span className="sr-only">Eigene Hintergrundfarbe</span>
                  <input
                    type="color"
                    value={paper}
                    onChange={(e) => setPaper(e.target.value)}
                  />
                </label>
              </div>
              <p className="mp-hint">
                Die Schriftfarbe passt sich automatisch an — auf dunklem Grund wird sie hell.
                {paperContrast < 4.5 && ' Bei dieser Farbe wird der Text allerdings schwer lesbar.'}
              </p>
            </div>

            <div className="mp-field">
              <span className="zh-label">Schrift für Interpret und Albumtitel</span>
              <div className="mp-font-grid">
              {POSTER_FONTS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`mp-font ${item.className}${fontKey === item.key ? ' is-active' : ''}`}
                  onClick={() => setFontKey(item.key)}
                  aria-pressed={fontKey === item.key}
                >
                  {item.label}
                </button>
              ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── Vorschau & Export ── */}
        <aside className="mp-preview-col">
          <div className="mp-preview-sticky">
            <div className="mp-preview-wrap" ref={previewWrapRef}>
              <canvas ref={canvasRef} className="mp-canvas" role="img" aria-label="Vorschau des Posters" />
            </div>

            <div className="zd-card mp-panel mp-export-panel">
              <h2 className="zd-h3">5 — Export</h2>

              <div className="mp-field">
                <label className="zh-label" htmlFor="mp-format">Format</label>
                <select
                  id="mp-format"
                  className="zh-input"
                  value={formatKey}
                  onChange={(e) => setFormatKey(e.target.value)}
                >
                  {FORMATS.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label} — {item.hint}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mp-field">
                <label className="zh-label" htmlFor="mp-dpi">Auflösung — {dpi} dpi</label>
                <input
                  id="mp-dpi"
                  className="mp-range"
                  type="range"
                  min={DPI_MIN}
                  max={DPI_MAX}
                  step={6}
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                />
                <p className="mp-hint">
                  {exportSize.width} × {exportSize.height} px
                  {exportPixels > PIXEL_WARN_THRESHOLD &&
                    ' — sehr groß, auf dem Handy kann der Export scheitern.'}
                </p>
              </div>

              <div className="mp-export-actions">
                <button type="button" className="zd-btn" onClick={exportPng} disabled={busy}>
                  {exporting === 'png' ? 'Rendert …' : 'PNG laden'}
                </button>
                <button type="button" className="zd-btn outline" onClick={exportPdf} disabled={busy}>
                  {exporting === 'pdf' ? 'Rendert …' : 'PDF laden'}
                </button>
              </div>

              {exportError && <p className="zh-error" style={{ marginTop: 14 }}>{exportError}</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
