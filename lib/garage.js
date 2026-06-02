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
]

// Skill-Badge-Farben (rotierend, passend zum Design-System)
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
}

/** Gibt den Skill-Badge JSX-Style zurück */
export function skillBadgeStyle(active = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--mono)',
    fontSize: 10,
    letterSpacing: '1.4px',
    textTransform: 'uppercase',
    padding: '5px 10px',
    borderRadius: 100,
    border: `1.5px solid ${active ? 'var(--accent-ink)' : 'var(--hairline)'}`,
    background: active ? 'var(--accent-3)' : 'transparent',
    color: active ? 'var(--accent-ink)' : 'var(--ink-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  }
}
