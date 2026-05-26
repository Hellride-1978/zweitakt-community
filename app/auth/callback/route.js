import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/'
  // Nur relative Pfade erlauben — keine externen Redirects
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    if (data?.user) {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', data.user.id).single()
      if (!profile?.name) {
        return NextResponse.redirect(`${origin}/profile/edit?welcome=1`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
