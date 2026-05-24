import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL oder Key fehlt. Bitte überprüfe .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Für Server Components: umgeht Next.js fetch-Cache komplett
export function createServerClient() {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
    },
  })
}
