'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const mono = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.8px', textTransform: 'uppercase' }

function BasketRow({ item, onRemove, onToggleRole }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 0',
      borderBottom: '1px solid var(--hairline)',
    }}>
      {/* Avatar / E-Mail-Icon */}
      <div style={{ flexShrink: 0 }}>
        {item.type === 'user' ? (
          <div className="zh-avatar offline" style={{ width: 32, height: 32, fontSize: 12 }}>
            {item.label.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1.5px solid var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            ...mono, fontSize: 11, color: 'var(--ink-muted)',
          }}>
            ✉
          </div>
        )}
      </div>

      {/* Name / E-Mail */}
      <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--display)', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.label}
      </div>

      {/* Rollen-Schalter */}
      <div style={{ display: 'flex', flexShrink: 0, border: '1.5px solid var(--ink)', borderRadius: 100, overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => item.role !== 'member' && onToggleRole(item.key)}
          style={{
            padding: '5px 12px',
            ...mono, fontSize: 9,
            border: 'none', cursor: item.role === 'member' ? 'default' : 'pointer',
            background: item.role === 'member' ? 'var(--ink)' : 'none',
            color: item.role === 'member' ? 'var(--cream)' : 'var(--ink-muted)',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          Mitglied
        </button>
        <button
          type="button"
          onClick={() => item.role !== 'admin' && onToggleRole(item.key)}
          style={{
            padding: '5px 12px',
            ...mono, fontSize: 9,
            border: 'none', borderLeft: '1px solid var(--hairline)', cursor: item.role === 'admin' ? 'default' : 'pointer',
            background: item.role === 'admin' ? 'var(--ink)' : 'none',
            color: item.role === 'admin' ? 'var(--cream)' : 'var(--ink-muted)',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          ★ Admin
        </button>
      </div>

      {/* Entfernen */}
      <button
        type="button"
        onClick={() => onRemove(item.key)}
        aria-label={`${item.label} entfernen`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  )
}

export default function InviteMember({ clubId, existingMemberIds = [], inviteAction }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [basket, setBasket] = useState([])
  const [working, setWorking] = useState(false)
  const [msg, setMsg] = useState(null)
  const debounceRef = useRef(null)

  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
  const basketKeys = new Set(basket.map(b => b.key))
  const excluded = new Set([...existingMemberIds, ...basket.filter(b => b.type === 'user').map(b => b.id)])

  const search = (val) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `%${val.trim()}%`)
        .limit(8)
      setResults((data || []).filter(p => !excluded.has(p.id)))
      setSearching(false)
    }, 280)
  }

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setMsg(null)
    if (!isEmail(val)) search(val)
    else setResults([])
  }

  const addUser = (profile) => {
    if (excluded.has(profile.id) || basketKeys.has(profile.id)) return
    setBasket(b => [...b, { type: 'user', key: profile.id, id: profile.id, label: profile.name || 'Unbekannt', role: 'member' }])
    setQuery('')
    setResults([])
  }

  const addEmail = (email) => {
    const key = email.trim().toLowerCase()
    if (basketKeys.has(key)) return
    setBasket(b => [...b, { type: 'email', key, label: email.trim(), role: 'member' }])
    setQuery('')
    setResults([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = query.trim()
      if (isEmail(val)) addEmail(val)
    }
  }

  const toggleRole = (key) => {
    setBasket(b => b.map(item =>
      item.key === key ? { ...item, role: item.role === 'admin' ? 'member' : 'admin' } : item
    ))
  }

  const removeFromBasket = (key) => {
    setBasket(b => b.filter(x => x.key !== key))
  }

  const handleSubmit = async () => {
    if (basket.length === 0 || working) return
    setWorking(true)
    setMsg(null)

    const errors = []

    for (const item of basket) {
      if (item.type === 'user') {
        const { error } = await supabase.from('club_members').insert({
          club_id: clubId,
          user_id: item.id,
          role: item.role,
        })
        if (error) errors.push(`${item.label}: ${error.message}`)
      } else {
        if (!inviteAction) {
          errors.push(`${item.label}: E-Mail-Einladungen nicht konfiguriert`)
          continue
        }
        const result = await inviteAction(item.label, item.role)
        if (result?.error) errors.push(`${item.label}: ${result.error}`)
      }
    }

    setWorking(false)

    if (errors.length === 0) {
      const n = basket.length
      setMsg({ type: 'ok', text: `${n} ${n === 1 ? 'Person' : 'Personen'} eingeladen.` })
      setBasket([])
      router.refresh()
    } else {
      setMsg({ type: 'error', text: errors.join('\n') })
    }
  }

  const emailCandidate = isEmail(query) && !basketKeys.has(query.trim().toLowerCase())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Eingabe */}
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          placeholder="Name suchen oder E-Mail eingeben…"
          className="zh-input"
          style={{ width: '100%' }}
          autoComplete="off"
        />
        {searching && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', ...mono, color: 'var(--ink-muted)' }}>
            …
          </span>
        )}
      </div>

      {/* Suchergebnisse */}
      {(results.length > 0 || emailCandidate) && (
        <div style={{ border: '1.5px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
          {results.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addUser(p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: (i < results.length - 1 || emailCandidate) ? '1px solid var(--hairline)' : 'none',
              }}
            >
              <div className="zh-avatar offline" style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                {p.avatar_url
                  ? <img src={p.avatar_url} alt={p.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (p.name || '?').charAt(0).toUpperCase()
                }
              </div>
              <span style={{ fontFamily: 'var(--display)', fontSize: 15, flex: 1 }}>{p.name}</span>
              <span style={{ ...mono, color: 'var(--accent)', flexShrink: 0 }}>+ Auswahl</span>
            </button>
          ))}

          {emailCandidate && (
            <button
              type="button"
              onClick={() => addEmail(query)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ ...mono, color: 'var(--ink-muted)', width: 28, textAlign: 'center', flexShrink: 0 }}>✉</span>
              <span style={{ fontFamily: 'var(--display)', fontSize: 15, flex: 1 }}>{query.trim()}</span>
              <span style={{ ...mono, color: 'var(--accent)', flexShrink: 0 }}>+ Einladen</span>
            </button>
          )}
        </div>
      )}

      {/* Auswahl-Liste mit individuellen Rollen */}
      {basket.length > 0 && (
        <div>
          <div style={{ ...mono, color: 'var(--accent)', marginBottom: 6 }}>
            Auswahl ({basket.length})
          </div>
          <div>
            {basket.map(item => (
              <BasketRow
                key={item.key}
                item={item}
                onRemove={removeFromBasket}
                onToggleRole={toggleRole}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      {msg && (
        <div style={{ ...mono, color: msg.type === 'ok' ? '#45a36a' : '#c55a3c', whiteSpace: 'pre-line' }}>
          {msg.text}
        </div>
      )}

      {/* Abschicken */}
      {basket.length > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={working}
          className="zh-btn"
          style={{ opacity: working ? 0.6 : 1 }}
        >
          {working ? 'Lädt…' : `${basket.length} ${basket.length === 1 ? 'Person' : 'Personen'} einladen →`}
        </button>
      )}
    </div>
  )
}
