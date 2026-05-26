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
    if (saved === 'pink') {
      document.documentElement.setAttribute('data-theme', 'pink')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  const toggle = (t) => {
    setTheme(t)
    localStorage.setItem('zh-theme', t)
    if (t === 'pink') {
      document.documentElement.setAttribute('data-theme', 'pink')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
