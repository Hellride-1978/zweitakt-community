'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import DesktopLayout from '@/components/DesktopLayout'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faTrash, faShield, faShieldHalved, faEnvelope, faUserPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

function slugify(str) {
  return str
    .toLowerCase().trim()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function EditClubPage({ params }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [slug, setSlug] = useState(null)
  const [club, setClub] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [form, setForm] = useState({ name: '', slug: '', description: '', location: '', founded_year: '', instagram: '', website: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Member management
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [memberMsg, setMemberMsg] = useState(null)
  const [processing, setProcessing] = useState(null)

  // Resolve params (Next.js 16 async params)
  useEffect(() => {
    params.then ? params.then(p => setSlug(p.slug)) : setSlug(params.slug)
  }, [params])

  const loadClub = useCallback(async () => {
    if (!slug) return
    const { data, error: err } = await supabase
      .from('clubs')
      .select('*, club_memberships(id, user_id, email, role, status)')
      .eq('slug', slug)
      .single()
    if (err || !data) { setError('Klub nicht gefunden.'); return }

    // Profiles separat laden
    const userIds = (data.club_memberships || []).map(m => m.user_id).filter(Boolean)
    let profilesMap = {}
    if (userIds.length > 0) {
      const { data: profileRows } = await supabase
        .from('profiles').select('id, name, avatar_url').in('id', userIds)
      profileRows?.forEach(p => { profilesMap[p.id] = p })
    }
    const membershipsWithProfiles = (data.club_memberships || []).map(m => ({
      ...m, profiles: profilesMap[m.user_id] || null,
    }))

    setClub(data)
    setMemberships(membershipsWithProfiles)
    setForm({
      name: data.name || '',
      slug: data.slug || '',
      description: data.description || '',
      location: data.location || '',
      founded_year: data.founded_year ? String(data.founded_year) : '',
      instagram: data.links?.instagram || '',
      website: data.links?.website || '',
    })
  }, [slug])

  useEffect(() => { if (!authLoading) loadClub() }, [slug, authLoading, loadClub])

  const isAdmin = memberships.filter(m => m.status === 'active' && m.role === 'admin').some(m => m.user_id === user?.id)
  const isCreator = club?.created_by === user?.id

  if (authLoading || !slug || !club) {
    return <DesktopLayout crumb="Klub bearbeiten"><div style={{ padding: 40 }}>Lädt…</div></DesktopLayout>
  }
  if (!user) {
    return <DesktopLayout crumb="Klub bearbeiten"><div className="zh-page"><div className="zh-page-inner"><p style={{ marginTop: 40 }}>Nicht angemeldet.</p></div></div></DesktopLayout>
  }
  if (!isAdmin) {
    return <DesktopLayout crumb="Klub bearbeiten"><div className="zh-page"><div className="zh-page-inner"><p style={{ marginTop: 40 }}>Kein Zugriff — du bist kein Admin dieses Klubs.</p></div></div></DesktopLayout>
  }

  // ── Club details save ──
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name ist Pflicht.'); return }
    setSaving(true); setError(null); setSuccess(null)
    const links = {}
    if (form.instagram.trim()) links.instagram = form.instagram.trim()
    if (form.website.trim()) links.website = form.website.trim()

    const { error: upErr } = await supabase
      .from('clubs')
      .update({
        name: form.name.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        founded_year: form.founded_year ? parseInt(form.founded_year) : null,
        links,
      })
      .eq('id', club.id)

    setSaving(false)
    if (upErr) { setError(upErr.message); return }
    setSuccess('Gespeichert.')
    // If slug changed: redirect (currently slug is not editable after creation to avoid broken links)
  }

  // ── Member search ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    const activeMemberIds = memberships.filter(m => m.status === 'active').map(m => m.user_id).filter(Boolean)
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .ilike('name', `%${searchQuery.trim()}%`)
      .limit(8)
    setSearchResults((data || []).filter(p => !activeMemberIds.includes(p.id) && p.id !== user.id))
    setSearching(false)
  }

  const handleAddMember = async (profileId) => {
    setMemberMsg(null)
    const existing = memberships.find(m => m.user_id === profileId)
    if (existing) { setMemberMsg('Person ist bereits Mitglied oder ausstehend.'); return }
    const { error: insErr } = await supabase.from('club_memberships').insert({
      club_id: club.id, user_id: profileId, role: 'member', status: 'active',
    })
    if (insErr) { setMemberMsg(insErr.message); return }
    setSearchQuery(''); setSearchResults([])
    setMemberMsg('Mitglied hinzugefügt.')
    loadClub()
  }

  // ── E-Mail-Einladung ──
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) { setMemberMsg('Ungültige E-Mail-Adresse.'); return }
    setInviting(true); setMemberMsg(null)

    // Prüfen ob bereits eingeladen
    const alreadyInvited = memberships.find(m => m.email === inviteEmail.trim().toLowerCase())
    if (alreadyInvited) { setMemberMsg('Diese E-Mail wurde bereits eingeladen.'); setInviting(false); return }

    const { error: insErr } = await supabase.from('club_memberships').insert({
      club_id: club.id, user_id: null, email: inviteEmail.trim().toLowerCase(),
      role: 'member', status: 'pending', invited_by: user.id,
    })
    if (insErr) { setMemberMsg(insErr.message); setInviting(false); return }

    // E-Mail senden
    await fetch('/api/clubs/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubName: club.name, clubSlug: club.slug, email: inviteEmail.trim() }),
    })

    setInviteEmail('')
    setMemberMsg('Einladung verschickt.')
    setInviting(false)
    loadClub()
  }

  // ── Role change ──
  const handleRoleChange = async (membershipId, newRole, targetIsAdmin) => {
    if (targetIsAdmin && newRole === 'member' && !isCreator) return
    setProcessing(membershipId)
    await supabase.from('club_memberships').update({ role: newRole }).eq('id', membershipId)
    setProcessing(null)
    loadClub()
  }

  // ── Remove member ──
  const handleRemove = async (membershipId, targetIsAdmin) => {
    if (targetIsAdmin && !isCreator) return
    if (!window.confirm('Mitglied entfernen?')) return
    setProcessing(membershipId)
    await supabase.from('club_memberships').delete().eq('id', membershipId)
    setProcessing(null)
    loadClub()
  }

  // ── Confirm / reject pending ──
  const handleConfirm = async (membershipId) => {
    setProcessing(membershipId)
    await supabase.from('club_memberships').update({ status: 'active' }).eq('id', membershipId)
    setProcessing(null)
    loadClub()
  }
  const handleReject = async (membershipId) => {
    if (!window.confirm('Anfrage ablehnen?')) return
    setProcessing(membershipId)
    await supabase.from('club_memberships').delete().eq('id', membershipId)
    setProcessing(null)
    loadClub()
  }

  const activeMembers = memberships.filter(m => m.status === 'active' && m.user_id)
  const pendingMembers = memberships.filter(m => m.status === 'pending')

  const actionBtn = (onClick, title, icon, color) => (
    <button onClick={onClick} title={title} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid var(--hairline)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />
    </button>
  )

  return (
    <DesktopLayout crumb={`${club.name} bearbeiten`}>
      <div className="zh-page">
        <div className="zh-page-inner" style={{ maxWidth: 760 }}>
          <Link href={`/clubs/${club.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 24, textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} /> Zurück zum Klub
          </Link>
          <div>
            <div className="zd-mono accent">Admin</div>
            <h1 className="zh-page-title" style={{ marginTop: 6 }}>{club.name} <em>bearbeiten.</em></h1>
          </div>

          {/* ── Club details ── */}
          {error && <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff0f0', border: '1.5px solid #e00', borderRadius: 10, fontSize: 14, color: '#c00' }}>{error}</div>}
          {success && <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fff4', border: '1.5px solid #3a8', borderRadius: 10, fontSize: 14, color: '#1a7a3a' }}>{success}</div>}

          <form onSubmit={handleSave} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="zd-card">
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 20, margin: '0 0 20px' }}>Grunddaten</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="zh-label">Name *</label>
                  <input className="zh-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="zh-label">Beschreibung</label>
                  <textarea className="zh-input" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="zh-label">Region / Stadt</label>
                    <input className="zh-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="z.B. Berlin" />
                  </div>
                  <div>
                    <label className="zh-label">Gründungsjahr</label>
                    <input className="zh-input" type="number" min="1900" max={new Date().getFullYear()} value={form.founded_year} onChange={e => setForm(f => ({ ...f, founded_year: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="zh-label">Instagram</label>
                  <input className="zh-input" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="https://instagram.com/euerklub" />
                </div>
                <div>
                  <label className="zh-label">Website</label>
                  <input className="zh-input" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://euerklub.de" />
                </div>
              </div>
            </div>
            <div>
              <button type="submit" disabled={saving} className="zd-btn accent" style={{ display: 'inline-flex' }}>
                {saving ? 'Speichert…' : 'Änderungen speichern →'}
              </button>
            </div>
          </form>

          {/* ── Member management ── */}
          <div style={{ marginTop: 48 }}>
            <div className="zd-mono accent" style={{ marginBottom: 4 }}>Verwaltung</div>
            <h2 className="zd-h2" style={{ marginBottom: 24 }}>Mitglieder <em>verwalten.</em></h2>

            {memberMsg && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--accent-3)', border: '1.5px solid var(--accent)', borderRadius: 10, fontSize: 13 }}>
                {memberMsg}
              </div>
            )}

            {/* Active members list */}
            <div className="zd-card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 16px' }}>Aktive Mitglieder</h3>
              {activeMembers.length === 0 && <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Noch keine Mitglieder.</p>}
              {activeMembers.map((m) => {
                const prof = m.profiles
                const isThisAdmin = m.role === 'admin'
                const isThisCreator = club.created_by === m.user_id
                const isMe = m.user_id === user.id
                const canModify = !isThisAdmin || isCreator
                const busy = processing === m.id
                return (
                  <div key={m.id} className="club-member-row" style={{ opacity: busy ? 0.5 : 1 }}>
                    <div className="zh-avatar" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
                      {prof?.avatar_url
                        ? <img src={prof.avatar_url} alt={prof.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : (prof?.name || '?').charAt(0).toUpperCase()
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>{prof?.name || '—'}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.4px', textTransform: 'uppercase', color: isThisAdmin ? 'var(--accent-ink)' : 'var(--ink-muted)', marginTop: 2 }}>
                        {isThisAdmin ? (isThisCreator ? 'Gründer · Admin' : 'Admin') : 'Mitglied'}
                      </div>
                    </div>
                    {!isMe && canModify && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isThisAdmin
                          ? actionBtn(() => !busy && handleRoleChange(m.id, 'member', true), 'Zu Member zurückstufen', faShieldHalved, 'var(--ink-muted)')
                          : actionBtn(() => !busy && handleRoleChange(m.id, 'admin', false), 'Zum Admin machen', faShield, 'var(--accent-ink)')
                        }
                        {actionBtn(() => !busy && handleRemove(m.id, isThisAdmin), 'Entfernen', faTrash, '#c00')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pending members */}
            {pendingMembers.length > 0 && (
              <div className="zd-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 16px' }}>Ausstehend</h3>
                {pendingMembers.map((m) => {
                  const name = m.profiles?.name || m.email || 'Unbekannt'
                  const busy = processing === m.id
                  return (
                    <div key={m.id} className="club-pending-row" style={{ opacity: busy ? 0.5 : 1 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>{name}</div>
                        {m.email && (
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.5px', marginTop: 2 }}>{m.email}</div>
                        )}
                      </div>
                      <button onClick={() => !busy && handleConfirm(m.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #3a8a3a', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1px', color: '#3a8a3a' }}>Bestätigen</button>
                      <button onClick={() => !busy && handleReject(m.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #c00', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1px', color: '#c00' }}>Ablehnen</button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add by search */}
            <div className="zd-card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 14px' }}>
                <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: 16, marginRight: 8 }} />
                Mitglied hinzufügen
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="zh-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                  placeholder="Name suchen…"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleSearch} disabled={searching} className="zd-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 13 }} />
                  {searching ? 'Sucht…' : 'Suchen'}
                </button>
              </div>
              {searchResults.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {searchResults.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--hairline)', borderRadius: 10, background: 'var(--cream)' }}>
                      <div className="zh-avatar" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
                        {p.avatar_url
                          ? <img src={p.avatar_url} alt={p.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : (p.name || '?').charAt(0).toUpperCase()
                        }
                      </div>
                      <span style={{ flex: 1, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                      <button type="button" onClick={() => handleAddMember(p.id)} className="zd-btn accent" style={{ fontSize: 12, padding: '6px 12px' }}>
                        Hinzufügen
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && !searching && (
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-muted)' }}>Keine Ergebnisse.</p>
              )}
            </div>

            {/* Invite by email */}
            <div className="zd-card">
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 14px' }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 16, marginRight: 8 }} />
                Per E-Mail einladen
              </h3>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                Person erhält eine Einladungs-E-Mail. Nach der Registrierung wird sie automatisch als Mitglied aufgenommen.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="zh-input"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleInvite())}
                  placeholder="email@beispiel.de"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleInvite} disabled={inviting} className="zd-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 13 }} />
                  {inviting ? 'Lädt…' : 'Einladen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
