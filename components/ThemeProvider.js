'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { applyPalette, DEFAULT_PALETTE } from '@/lib/palettes'

const ThemeContext = createContext({ palette: DEFAULT_PALETTE, setPalette: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  const [palette, setPaletteState] = useState(DEFAULT_PALETTE)

  useEffect(() => {
    const saved = localStorage.getItem('zh-palette') || DEFAULT_PALETTE
    setPaletteState(saved)
    applyPalette(saved)
  }, [])

  const setPalette = (key) => {
    setPaletteState(key)
    localStorage.setItem('zh-palette', key)
    applyPalette(key)
  }

  return (
    <ThemeContext.Provider value={{ palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}
