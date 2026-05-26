'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'blue', toggle: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('blue')

  useEffect(() => {
    const saved = localStorage.getItem('zh-theme') || 'blue'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved === 'pink' ? 'pink' : '')
  }, [])

  const toggle = (t) => {
    setTheme(t)
    localStorage.setItem('zh-theme', t)
    document.documentElement.setAttribute('data-theme', t === 'pink' ? 'pink' : '')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
