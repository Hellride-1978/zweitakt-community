'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'martin@delavega.de'

// ── Live-Vorschau ────────────────────────────────────────────────────────────

function EmailPreview({ headline, blocks, ctaLabel, ctaUrl }) {
  return (
    <div style={{ background: '#e8e8e8', padding: '32px 16px', borderRadius: 14, minHeight: 300 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 14, border: '1.5px solid #1a1108', boxShadow: '4px 4px 0 #1a1108', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#1a1108', padding: '20px 24px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#9bc3d6', marginBottom: 6 }}>Zweitakthoden</div>
          <div style={{ fontFamily: 'Arial', fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            {headline || <span style={{ opacity: 0.3 }}>Headline…</span>}
          </div>
        </div>

        {/* Blöcke */}
        {blocks.map((block, i) => {
          if (block.type === 'image') {
            return block.preview || block.url
              ? <img key={block.id} src={block.preview || block.url} alt="" style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }} />
              : <div key={block.id} style={{ height: 80, background: '#f2f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 10, color: '#aaa', letterSpacing: '1px' }}>BILD</div>
          }
          const parts = block.content.split('\n\n').filter(Boolean)
          return (
            <div key={block.id} style={{ padding: i === 0 ? '20px 24px 4px' : '8px 24px 4px' }}>
              {parts.length > 0
                ? parts.map((p, j) => <p key={j} style={{ fontFamily: 'Arial', fontSize: 14, color: '#1a1108', lineHeight: 1.7, margin: '0 0 10px' }}>{p}</p>)
                : <p style={{ fontFamily: 'Arial', fontSize: 14, color: '#ccc', fontStyle: 'italic', margin: 0 }}>Text…</p>
              }
            </div>
          )
        })}

        {/* CTA */}
        {ctaLabel && ctaUrl && (
          <div style={{ padding: '8px 24px 20px' }}>
            <span style={{ background: '#1a1108', color: '#fff', padding: '10px 20px', borderRadius: 100, fontFamily: 'monospace', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {ctaLabel} →
            </span>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(26,17,8,0.1)', padding: '12px 24px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#8a7a6e', letterSpacing: '1px' }}>
            zweitakthoden.de — <span style={{ color: '#1a6080' }}>Newsletter abmelden</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Zwischen-Blöcke-Buttons ──────────────────────────────────────────────────

function AddBlockBar({ onAddText, onAddImage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
      <button onClick={onAddText}  style={addBtnStyle}>+ Text</button>
      <button onClick={onAddImage} style={addBtnStyle}>+ Bild</button>
      <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
    </div>
  )
}
const addBtnStyle = {
  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase',
  background: 'none', border: '1px solid var(--hairline)', borderRadius: 6,
  padding: '3px 10px', cursor: 'pointer', color: 'var(--ink-muted)', whiteSpace: 'nowrap',
}

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

function newBlock(type) {
  return { id: Date.now() + Math.random(), type, content: '', url: '', preview: '', uploading: false }
}

export default function AdminNewsletterPage() {
  const { user, loading } = useAuth()
  const router  = useRouter()
  const fileRefs = useRef({})

  const [subject,     setSubject]     = useState('')
  const [headline,    setHeadline]    = useState('')
  const [blocks,      setBlocks]      = useState([newBlock('text')])
  const [ctaLabel,    setCtaLabel]    = useState('')
  const [ctaUrl,      setCtaUrl]      = useState('')
  const [subCount,    setSubCount]    = useState(null)
  const [statsLoading,setStatsLoading]= useState(false)
  const [sending,     setSending]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [error,       setError]       = useState(null)
  const [confirmed,   setConfirmed]   = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'confirmed')
      .then(({ count }) => { if (count !== null) setSubCount(count) })
  }, [user])

  if (loading || !user || user.email !== ADMIN_EMAIL) return null

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  // ── Block-Management ──────────────────────────────────────────────────────

  function addBlock(afterIdx, type) {
    setBlocks(prev => [
      ...prev.slice(0, afterIdx + 1),
      newBlock(type),
      ...prev.slice(afterIdx + 1),
    ])
  }

  function removeBlock(id) {
    setBlocks(prev => prev.length > 1 ? prev.filter(b => b.id !== id) : prev)
  }

  function updateBlockContent(id, content) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }

  function updateBlock(id, patch) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  }

  // ── Bild-Upload ───────────────────────────────────────────────────────────

  async function handleImageSelect(blockId, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Bild zu groß — max. 5 MB.'); return }
    setError(null)
    updateBlock(blockId, { preview: URL.createObjectURL(file), uploading: true })
    const ext  = file.name.split('.').pop() || 'jpg'
    const path = `newsletter/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('newsletter-images')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setError('Bild-Upload fehlgeschlagen: ' + upErr.message)
      updateBlock(blockId, { preview: '', uploading: false })
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('newsletter-images').getPublicUrl(path)
    updateBlock(blockId, { url: publicUrl, uploading: false })
  }

  // ── Stats einfügen ────────────────────────────────────────────────────────

  async function handleInsertStats() {
    setStatsLoading(true)
    const [{ count: memberCount }, { count: bikeCount }] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vehicles').select('id', { count: 'exact', head: true }),
    ])
    const line = `Aktuell sind ${memberCount ?? '?'} Schrauber und ${bikeCount ?? '?'} Bikes auf Zweitakthoden registriert.`
    setBlocks(prev => {
      // Letzten Text-Block finden und anhängen
      const lastTextIdx = [...prev].reverse().findIndex(b => b.type === 'text')
      if (lastTextIdx === -1) return [...prev, { ...newBlock('text'), content: line }]
      const realIdx = prev.length - 1 - lastTextIdx
      return prev.map((b, i) => i === realIdx
        ? { ...b, content: b.content.trim() ? `${b.content.trim()}\n\n${line}` : line }
        : b
      )
    })
    setStatsLoading(false)
  }

  // ── Versand ───────────────────────────────────────────────────────────────

  const blocksForApi = blocks.map(b => ({
    type: b.type,
    content: b.type === 'text' ? b.content : b.url,
  }))
  const hasImages   = blocks.some(b => b.type === 'image' && b.uploading)
  const hasText     = blocks.some(b => b.type === 'text' && b.content.trim())
  const canSend     = subject.trim() && headline.trim() && hasText

  async function handlePreview() {
    setSending(true); setError(null); setResult(null)
    const token = await getToken()
    const res = await fetch('/api/admin/send-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ subject, headline, blocks: blocksForApi, ctaLabel, ctaUrl, preview: true }),
    })
    const data = await res.json()
    setSending(false)
    if (data.error) setError(data.error)
    else setResult({ type: 'preview', message: 'Vorschau-Mail an dich gesendet.' })
  }

  async function handleSend() {
    if (!confirmed) { setError('Bitte bestätige den Versand.'); return }
    setSending(true); setError(null); setResult(null)
    const token = await getToken()
    const res = await fetch('/api/admin/send-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ subject, headline, blocks: blocksForApi, ctaLabel, ctaUrl, preview: false }),
    })
    const data = await res.json()
    setSending(false)
    if (data.error) setError(data.error)
    else {
      setResult({ type: 'sent', message: `✓ Gesendet an ${data.sent} Abonnenten${data.failed ? ` (${data.failed} fehlgeschlagen)` : ''}.` })
      setConfirmed(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>Admin</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, lineHeight: 1, margin: 0 }}>Newsletter erstellen</h1>
        {subCount !== null && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-muted)' }}>
            <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{subCount}</span> bestätigte Abonnenten
          </div>
        )}
      </div>

      <div className="newsletter-layout">

        {/* ── Editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label className="zh-label">Betreff</label>
            <input className="zh-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="z.B. News aus der Crew – Juni 2026" />
          </div>

          <div>
            <label className="zh-label">Headline (fett, groß im dunklen Header)</label>
            <input className="zh-input" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="z.B. Neue Bikes. Neue Treffen." />
          </div>

          {/* ── Block-Editor ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="zh-label" style={{ marginBottom: 0 }}>Inhalt</label>
              <button
                onClick={handleInsertStats}
                disabled={statsLoading}
                style={{ ...addBtnStyle, color: 'var(--ink-soft)', borderColor: 'var(--ink-soft)' }}
              >
                {statsLoading ? '…' : '📊 Aktuelle Zahlen einfügen'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {blocks.map((block, idx) => (
                <div key={block.id}>
                  {/* Block */}
                  <div style={{ position: 'relative', borderRadius: 10, border: '1.5px solid var(--hairline)', overflow: 'hidden', marginBottom: 0 }}>

                    {/* Löschen-Button */}
                    {blocks.length > 1 && (
                      <button
                        onClick={() => removeBlock(block.id)}
                        title="Block löschen"
                        style={{ position: 'absolute', top: 6, right: 6, zIndex: 1, background: 'var(--parchment)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', lineHeight: 1.4 }}
                      >
                        ×
                      </button>
                    )}

                    {block.type === 'text' ? (
                      <div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', padding: '6px 10px 4px', borderBottom: '1px solid var(--hairline)', background: 'var(--cream-2)' }}>
                          Text
                        </div>
                        <textarea
                          className="zh-input"
                          rows={5}
                          value={block.content}
                          onChange={e => updateBlockContent(block.id, e.target.value)}
                          placeholder={idx === 0
                            ? 'Schreib deinen Text hier…\n\nLeerzeile = neuer Absatz. Platzhalter: {{anrede}} oder {{name}}'
                            : 'Weiterer Textblock…'}
                          style={{ resize: 'vertical', minHeight: 100, border: 'none', borderRadius: 0, outline: 'none', boxShadow: 'none' }}
                        />
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', padding: '6px 10px 4px', borderBottom: '1px solid var(--hairline)', background: 'var(--cream-2)' }}>
                          Bild
                        </div>
                        {block.preview || block.url ? (
                          <div style={{ position: 'relative' }}>
                            <img src={block.preview || block.url} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                            {block.uploading && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,17,8,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff' }}>
                                Lädt hoch…
                              </div>
                            )}
                          </div>
                        ) : (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-muted)' }}>
                            <span>📎 Bild auswählen (JPG, PNG, WebP — max. 5 MB)</span>
                            <input
                              ref={el => fileRefs.current[block.id] = el}
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              style={{ display: 'none' }}
                              onChange={e => handleImageSelect(block.id, e.target.files?.[0])}
                            />
                          </label>
                        )}
                        {(block.preview || block.url) && !block.uploading && (
                          <button
                            onClick={() => updateBlock(block.id, { url: '', preview: '' })}
                            style={{ width: '100%', padding: '6px', background: 'none', border: 'none', borderTop: '1px solid var(--hairline)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}
                          >
                            × Bild entfernen
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Trennlinie mit Add-Buttons */}
                  <AddBlockBar
                    onAddText={()  => addBlock(idx, 'text')}
                    onAddImage={() => addBlock(idx, 'image')}
                  />
                </div>
              ))}
            </div>

            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1px', color: 'var(--ink-muted)', marginTop: 4 }}>
              Platzhalter: <code style={{ background: 'var(--parchment)', padding: '1px 4px', borderRadius: 3 }}>{'{{anrede}}'}</code> → „Hallo Martin," &nbsp;|&nbsp; <code style={{ background: 'var(--parchment)', padding: '1px 4px', borderRadius: 3 }}>{'{{name}}'}</code> → „Martin"
            </div>
          </div>

          <div className="newsletter-cta-row">
            <div>
              <label className="zh-label">Button-Text (optional)</label>
              <input className="zh-input" value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder="z.B. Zum Forum" />
            </div>
            <div>
              <label className="zh-label">Button-URL (optional)</label>
              <input className="zh-input" value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="https://zweitakthoden.de/forum" />
            </div>
          </div>

          {error  && <div className="zh-error">{error}</div>}
          {result && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: result.type === 'sent' ? 'color-mix(in oklab, #22c55e 10%, var(--cream))' : 'color-mix(in oklab, var(--accent) 15%, var(--cream))', border: `1.5px solid ${result.type === 'sent' ? '#22c55e' : 'var(--accent-ink)'}`, fontFamily: 'var(--sans)', fontSize: 14, color: result.type === 'sent' ? '#166534' : 'var(--ink)' }}>
              {result.message}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8, borderTop: '1px solid var(--hairline)' }}>
            <button onClick={handlePreview} disabled={!canSend || sending || hasImages} className="zh-btn zh-btn-outline" style={{ opacity: !canSend ? 0.4 : 1 }}>
              {sending ? 'Sendet…' : 'Vorschau an mich senden →'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)' }}>
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              Ja, ich möchte diesen Newsletter an alle {subCount ?? '…'} Abonnenten senden.
            </label>
            <button onClick={handleSend} disabled={!canSend || !confirmed || sending || hasImages} className="zh-btn" style={{ opacity: (!canSend || !confirmed) ? 0.4 : 1 }}>
              {sending ? 'Wird gesendet…' : `An ${subCount ?? '…'} Abonnenten senden →`}
            </button>
          </div>
        </div>

        {/* ── Vorschau ── */}
        <div className="newsletter-preview-col">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 12 }}>Live-Vorschau</div>
          <EmailPreview headline={headline} blocks={blocks} ctaLabel={ctaLabel} ctaUrl={ctaUrl} />
        </div>

      </div>
    </div>
  )
}
