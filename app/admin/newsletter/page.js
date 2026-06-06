'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'martin@delavega.de'

function EmailPreview({ headline, body, ctaLabel, ctaUrl }) {
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

  const [subject,    setSubject]    = useState('')
  const [headline,   setHeadline]   = useState('')
  const [body,       setBody]       = useState('')
  const [ctaLabel,   setCtaLabel]   = useState('')
  const [ctaUrl,     setCtaUrl]     = useState('')
  const [subCount,   setSubCount]   = useState(null)
  const [sending,    setSending]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState(null)
  const [confirmed,  setConfirmed]  = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'confirmed')
      .then(({ count }) => { if (count !== null) setSubCount(count) })
  }, [user])

  if (loading || !user || user.email !== ADMIN_EMAIL) return null

  async function handlePreview() {
    setSending(true); setError(null); setResult(null)
    const res = await fetch('/api/admin/send-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, headline, body, ctaLabel, ctaUrl, adminEmail: user.email, preview: true }),
    })
    const data = await res.json()
    setSending(false)
    if (data.error) setError(data.error)
    else setResult({ type: 'preview', message: 'Vorschau-Mail an dich gesendet.' })
  }

  async function handleSend() {
    if (!confirmed) { setError('Bitte bestätige den Versand.'); return }
    setSending(true); setError(null); setResult(null)
    const res = await fetch('/api/admin/send-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, headline, body, ctaLabel, ctaUrl, adminEmail: user.email, preview: false }),
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
            <input
              className="zh-input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="z.B. News aus der Crew – Juni 2026"
            />
          </div>

          <div>
            <label className="zh-label">Headline (fett, groß im dunklen Header)</label>
            <input
              className="zh-input"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="z.B. Neue Bikes. Neue Treffen."
            />
          </div>

          <div>
            <label className="zh-label">Text (Leerzeile = neuer Absatz)</label>
            <textarea
              className="zh-input"
              rows={10}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Schreib deinen Newsletter-Text hier…

Jeder Absatz wird automatisch als eigener Textblock dargestellt."
              style={{ resize: 'vertical', minHeight: 200 }}
            />
          </div>

          <div className="newsletter-cta-row">
            <div>
              <label className="zh-label">Button-Text (optional)</label>
              <input
                className="zh-input"
                value={ctaLabel}
                onChange={e => setCtaLabel(e.target.value)}
                placeholder="z.B. Zum Forum"
              />
            </div>
            <div>
              <label className="zh-label">Button-URL (optional)</label>
              <input
                className="zh-input"
                value={ctaUrl}
                onChange={e => setCtaUrl(e.target.value)}
                placeholder="https://zweitakthoden.de/forum"
              />
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
            <button
              onClick={handlePreview}
              disabled={!canSend || sending}
              className="zh-btn zh-btn-outline"
              style={{ opacity: !canSend ? 0.4 : 1 }}
            >
              {sending ? 'Sendet…' : 'Vorschau an mich senden →'}
            </button>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)' }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Ja, ich möchte diesen Newsletter an alle {subCount ?? '…'} Abonnenten senden.
            </label>

            <button
              onClick={handleSend}
              disabled={!canSend || !confirmed || sending}
              className="zh-btn"
              style={{ opacity: (!canSend || !confirmed) ? 0.4 : 1 }}
            >
              {sending ? 'Wird gesendet…' : `An ${subCount ?? '…'} Abonnenten senden →`}
            </button>
          </div>
        </div>

        {/* ── Vorschau ── */}
        <div className="newsletter-preview-col">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 12 }}>
            Live-Vorschau
          </div>
          <EmailPreview headline={headline} body={body} ctaLabel={ctaLabel} ctaUrl={ctaUrl} />
        </div>

      </div>
    </div>
  )
}
