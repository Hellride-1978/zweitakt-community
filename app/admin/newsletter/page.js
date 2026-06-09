'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'martin@delavega.de'

function EmailPreview({ headline, body, ctaLabel, ctaUrl, imageUrl }) {
  const bodyParts = body.split('\n\n').filter(Boolean)

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
        {/* Bild */}
        {imageUrl && (
          <img src={imageUrl} alt="" style={{ width: '100%', display: 'block', maxHeight: 240, objectFit: 'cover' }} />
        )}
        {/* Body */}
        <div style={{ padding: '24px 24px 20px' }}>
          {bodyParts.length > 0 ? bodyParts.map((p, i) => (
            <p key={i} style={{ fontFamily: 'Arial', fontSize: 14, color: '#1a1108', lineHeight: 1.7, margin: '0 0 12px' }}>
              {p}
            </p>
          )) : (
            <p style={{ fontFamily: 'Arial', fontSize: 14, color: '#999', fontStyle: 'italic' }}>Text erscheint hier…</p>
          )}
          {ctaLabel && ctaUrl && (
            <div style={{ marginTop: 16 }}>
              <span style={{ background: '#1a1108', color: '#fff', padding: '10px 20px', borderRadius: 100, fontFamily: 'monospace', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {ctaLabel} →
              </span>
            </div>
          )}
        </div>
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

export default function AdminNewsletterPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [subject,       setSubject]       = useState('')
  const [headline,      setHeadline]      = useState('')
  const [body,          setBody]          = useState('')
  const [ctaLabel,      setCtaLabel]      = useState('')
  const [ctaUrl,        setCtaUrl]        = useState('')
  const [imageUrl,      setImageUrl]      = useState('')
  const [imagePreview,  setImagePreview]  = useState('')
  const [imageUploading,setImageUploading]= useState(false)
  const [subCount,      setSubCount]      = useState(null)
  const [statsLoading,  setStatsLoading]  = useState(false)
  const [sending,       setSending]       = useState(false)
  const [result,        setResult]        = useState(null)
  const [error,         setError]         = useState(null)
  const [confirmed,     setConfirmed]     = useState(false)

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

  async function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Bild zu groß — max. 5 MB.'); return }
    setImageUploading(true)
    setError(null)
    setImagePreview(URL.createObjectURL(file))
    const ext  = file.name.split('.').pop() || 'jpg'
    const path = `newsletter/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('newsletter-images').upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setError('Bild-Upload fehlgeschlagen: ' + upErr.message); setImagePreview(''); setImageUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('newsletter-images').getPublicUrl(path)
    setImageUrl(publicUrl)
    setImageUploading(false)
  }

  function handleImageRemove() {
    setImageUrl('')
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleInsertStats() {
    setStatsLoading(true)
    const [{ count: memberCount }, { count: bikeCount }] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vehicles').select('id', { count: 'exact', head: true }),
    ])
    const line = `Aktuell sind ${memberCount ?? '?'} Schrauber und ${bikeCount ?? '?'} Bikes auf Zweitakthoden registriert.`
    setBody(prev => prev.trim() ? `${prev.trim()}\n\n${line}` : line)
    setStatsLoading(false)
  }

  async function handlePreview() {
    setSending(true); setError(null); setResult(null)
    const token = await getToken()
    const res = await fetch('/api/admin/send-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ subject, headline, body, ctaLabel, ctaUrl, imageUrl, preview: true }),
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
      body: JSON.stringify({ subject, headline, body, ctaLabel, ctaUrl, imageUrl, preview: false }),
    })
    const data = await res.json()
    setSending(false)
    if (data.error) setError(data.error)
    else {
      setResult({ type: 'sent', message: `✓ Gesendet an ${data.sent} Abonnenten${data.failed ? ` (${data.failed} fehlgeschlagen)` : ''}.` })
      setConfirmed(false)
    }
  }

  const canSend = subject.trim() && headline.trim() && body.trim()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
        Admin
      </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <label className="zh-label">Betreff</label>
            <input className="zh-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="z.B. News aus der Crew – Juni 2026" />
          </div>

          <div>
            <label className="zh-label">Headline (fett, groß im dunklen Header)</label>
            <input className="zh-input" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="z.B. Neue Bikes. Neue Treffen." />
          </div>

          {/* Bild */}
          <div>
            <label className="zh-label">Bild (optional) — erscheint unter dem Header</label>
            {imagePreview ? (
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--hairline)', marginBottom: 8 }}>
                <img src={imagePreview} alt="Vorschau" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                {imageUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,17,8,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff' }}>
                    Lädt hoch…
                  </div>
                )}
                {!imageUploading && (
                  <button
                    onClick={handleImageRemove}
                    style={{ position: 'absolute', top: 8, right: 8, background: '#1a1108', color: '#fff', border: 'none', borderRadius: 100, padding: '4px 10px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1px', cursor: 'pointer' }}
                  >
                    × Entfernen
                  </button>
                )}
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: '1.5px dashed var(--hairline)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-muted)' }}>
                <span>📎</span>
                <span>Bild auswählen (JPG, PNG, WebP — max. 5 MB)</span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleImageSelect} />
              </label>
            )}
          </div>

          {/* Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="zh-label" style={{ marginBottom: 0 }}>Text (Leerzeile = neuer Absatz)</label>
              <button
                onClick={handleInsertStats}
                disabled={statsLoading}
                style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', background: 'none', border: '1px solid var(--hairline)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: 'var(--ink-muted)', opacity: statsLoading ? 0.5 : 1 }}
              >
                {statsLoading ? '…' : '📊 Aktuelle Zahlen einfügen'}
              </button>
            </div>
            <textarea
              className="zh-input"
              rows={10}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={`Schreib deinen Newsletter-Text hier…\n\nJeder Absatz wird automatisch als eigener Textblock dargestellt.\n\nPlatzhalter: {{anrede}} → "Hallo Martin," | {{name}} → "Martin"`}
              style={{ resize: 'vertical', minHeight: 200 }}
            />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1px', color: 'var(--ink-muted)', marginTop: 6 }}>
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

          {/* Feedback */}
          {error && <div className="zh-error">{error}</div>}
          {result && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: result.type === 'sent' ? 'color-mix(in oklab, #22c55e 10%, var(--cream))' : 'color-mix(in oklab, var(--accent) 15%, var(--cream))', border: `1.5px solid ${result.type === 'sent' ? '#22c55e' : 'var(--accent-ink)'}`, fontFamily: 'var(--sans)', fontSize: 14, color: result.type === 'sent' ? '#166534' : 'var(--ink)' }}>
              {result.message}
            </div>
          )}

          {/* Aktionen */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8, borderTop: '1px solid var(--hairline)' }}>
            <button onClick={handlePreview} disabled={!canSend || sending || imageUploading} className="zh-btn zh-btn-outline" style={{ opacity: !canSend ? 0.4 : 1 }}>
              {sending ? 'Sendet…' : 'Vorschau an mich senden →'}
            </button>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)' }}>
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              Ja, ich möchte diesen Newsletter an alle {subCount ?? '…'} Abonnenten senden.
            </label>

            <button onClick={handleSend} disabled={!canSend || !confirmed || sending || imageUploading} className="zh-btn" style={{ opacity: (!canSend || !confirmed) ? 0.4 : 1 }}>
              {sending ? 'Wird gesendet…' : `An ${subCount ?? '…'} Abonnenten senden →`}
            </button>
          </div>
        </div>

        {/* ── Vorschau ── */}
        <div className="newsletter-preview-col">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 12 }}>
            Live-Vorschau
          </div>
          <EmailPreview headline={headline} body={body} ctaLabel={ctaLabel} ctaUrl={ctaUrl} imageUrl={imagePreview || imageUrl} />
        </div>

      </div>
    </div>
  )
}
