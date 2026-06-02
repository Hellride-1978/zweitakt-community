'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import DesktopLayout from '@/components/DesktopLayout'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function NewClubPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', slug: '', description: '', location: '',
    founded_year: '', instagram: '', website: '',
  })
  const [slugEdited, setSlugEdited] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  if (loading) return <DesktopLayout crumb="Klub gründen"><div style={{ padding: 40 }}>Lädt…</div></DesktopLayout>

  if (!user) return (
    <DesktopLayout crumb="Klub gründen">
      <div className="zh-page"><div className="zh-page-inner">
        <p style={{ marginTop: 40 }}>
          Du musst <Link href="/auth/login" style={{ color: 'var(--accent-ink)' }}>angemeldet sein</Link>, um einen Klub zu gründen.
        </p>
      </div></div>
    </DesktopLayout>
  )

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(f => ({ ...f, name, ...(!slugEdited ? { slug: slugify(name) } : {}) }))
  }

  const handleSlugChange = (e) => {
    setSlugEdited(true)
    setForm(f => ({ ...f, slug: slugify(e.target.value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name ist Pflicht.'); return }
    if (!form.slug.trim()) { setError('URL-Slug ist Pflicht.'); return }

    setSaving(true)
    setError(null)

    const links = {}
    if (form.instagram.trim()) links.instagram = form.instagram.trim()
    if (form.website.trim()) links.website = form.website.trim()

    const { data: club, error: clubErr } = await supabase
      .from('clubs')
      .insert({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        founded_year: form.founded_year ? parseInt(form.founded_year) : null,
        links,
        created_by: user.id,
      })
      .select()
      .single()

    if (clubErr) {
      setError(clubErr.message.includes('unique') ? 'Dieser URL-Slug ist bereits vergeben.' : clubErr.message)
      setSaving(false)
      return
    }

    await supabase.from('club_memberships').insert({
      club_id: club.id,
      user_id: user.id,
      role: 'admin',
      status: 'active',
    })

    router.push(`/clubs/${club.slug}`)
  }

  const field = (label, key, props = {}) => (
    <div>
      <label className="zh-label">{label}</label>
      <input className="zh-input" value={form[key]} onChange={set(key)} {...props} />
    </div>
  )

  return (
    <DesktopLayout crumb="Klub gründen">
      <div className="zh-page">
        <div className="zh-page-inner" style={{ maxWidth: 680 }}>
          <Link href="/clubs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 24, textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} /> Alle Klubs
          </Link>
          <div>
            <div className="zd-mono accent">Neu</div>
            <h1 className="zh-page-title" style={{ marginTop: 6 }}>Klub <em>gründen.</em></h1>
          </div>
          {error && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff0f0', border: '1.5px solid #e00', borderRadius: 10, fontSize: 14, color: '#c00' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="zd-card">
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 20, margin: '0 0 20px' }}>Grunddaten</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="zh-label">Name *</label>
                  <input className="zh-input" value={form.name} onChange={handleNameChange} placeholder="z.B. MZ-Freunde Berlin" required />
                </div>
                <div>
                  <label className="zh-label">URL-Slug *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-muted)', pointerEvents: 'none', userSelect: 'none' }}>
                      /clubs/
                    </span>
                    <input
                      className="zh-input"
                      style={{ paddingLeft: 72 }}
                      value={form.slug}
                      onChange={handleSlugChange}
                      placeholder="mz-freunde-berlin"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="zh-label">Beschreibung</label>
                  <textarea className="zh-input" rows={4} value={form.description} onChange={set('description')} placeholder="Wer seid ihr, was macht euch aus?" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {field('Region / Stadt', 'location', { placeholder: 'z.B. Berlin' })}
                  <div>
                    <label className="zh-label">Gründungsjahr</label>
                    <input className="zh-input" type="number" min="1900" max={new Date().getFullYear()} value={form.founded_year} onChange={set('founded_year')} placeholder={`z.B. ${new Date().getFullYear() - 5}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="zd-card">
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 20, margin: '0 0 20px' }}>Links</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {field('Instagram', 'instagram', { placeholder: 'https://instagram.com/euerklub' })}
                {field('Website', 'website', { placeholder: 'https://euerklub.de' })}
              </div>
            </div>

            <div>
              <button type="submit" disabled={saving} className="zd-btn accent" style={{ display: 'inline-flex' }}>
                {saving ? 'Wird gegründet…' : 'Klub gründen →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DesktopLayout>
  )
}
