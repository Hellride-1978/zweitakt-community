// Fest vordefinierte Skill-Tags für die Garage
export const SKILLS = [
  'Mechanik',
  'Elektrik',
  'Lackieren',
  'Schweißen',
  'Tuning',
  'Restauration',
  'Teilebeschaffung',
  '3D-Druck',
  'Einsteiger einlernen',
  'Kaffeetrinker',
  'Pausenmeister',
  'Grill-Experte',
]

export const SKILL_COLORS = {
  'Mechanik':             { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Elektrik':             { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Lackieren':            { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Schweißen':            { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Tuning':               { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Restauration':         { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Teilebeschaffung':     { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  '3D-Druck':             { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Einsteiger einlernen': { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Kaffeetrinker':        { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Pausenmeister':        { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
  'Grill-Experte':        { bg: 'var(--accent-3)',  ink: 'var(--accent-ink)' },
}

/** Gibt den Skill-Badge JSX-Style zurück */
export function skillBadgeStyle(active = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--display)',
    fontSize: 14,
    letterSpacing: '0.3px',
    padding: '5px 16px',
    borderRadius: 100,
    border: `2px solid ${active ? 'var(--accent-ink)' : 'var(--hairline)'}`,
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-muted)',
    boxShadow: active ? '2px 2px 0 var(--accent-ink)' : '2px 2px 0 var(--hairline)',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s, border-color 0.15s, color 0.15s',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  }
}
