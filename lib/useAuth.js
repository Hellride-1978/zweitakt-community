'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Prüfe bei App-Start, ob User noch angemeldet ist
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(data.session?.user || null)
      } catch (err) {
        setError(err.message)
        console.error('Auth Fehler:', err)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Überwache Login/Logout-Änderungen
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  return { user, loading, error }
}
