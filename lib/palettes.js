export const PALETTES = {
  blue: {
    label:      'Blau',
    swatch:     'rgb(155,195,214)',
    accent:     'rgb(155,195,214)',
    accent2:    'rgb(175,210,225)',
    accent3:    'rgb(210,230,238)',
    accentInk:  'rgb(100,155,180)',
  },
  pink: {
    label:      'Rosa',
    swatch:     '#FF5C8F',
    accent:     '#FF5C8F',
    accent2:    '#ff85aa',
    accent3:    '#ffb3cb',
    accentInk:  '#e0366a',
  },
  sage: {
    label:      'Grün',
    swatch:     '#7DC4A0',
    accent:     '#7DC4A0',
    accent2:    '#9DD4B8',
    accent3:    '#C5E8D6',
    accentInk:  '#4FA87A',
  },
  amber: {
    label:      'Amber',
    swatch:     '#E8A045',
    accent:     '#E8A045',
    accent2:    '#F0BB78',
    accent3:    '#F8DCBA',
    accentInk:  '#C07820',
  },
  lilac: {
    label:      'Lila',
    swatch:     '#A99BD4',
    accent:     '#A99BD4',
    accent2:    '#C2B8E0',
    accent3:    '#DDD8EF',
    accentInk:  '#7A68B8',
  },
}

export const DEFAULT_PALETTE = 'blue'

export function applyPalette(key) {
  const p = PALETTES[key] || PALETTES[DEFAULT_PALETTE]
  const r = document.documentElement.style
  r.setProperty('--accent',       p.accent)
  r.setProperty('--accent-2',     p.accent2)
  r.setProperty('--accent-3',     p.accent3)
  r.setProperty('--accent-ink',   p.accentInk)
  r.setProperty('--accent-hot',   p.accent)
  r.setProperty('--accent-hot-2', p.accent2)
  r.setProperty('--accent-hot-3', p.accent3)
}
