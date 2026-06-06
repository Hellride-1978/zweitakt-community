import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) redirect('/newsletter/abgemeldet?error=missing')

  const admin = adminClient()

  const { data: subscriber } = await admin
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('unsubscribe_token', token)
    .single()

  if (!subscriber) redirect('/newsletter/abgemeldet?error=invalid')
  if (subscriber.status === 'unsubscribed') redirect('/newsletter/abgemeldet?already=1')

  const { error } = await admin
    .from('newsletter_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('id', subscriber.id)

  if (error) {
    console.error('Newsletter unsubscribe error:', error)
    redirect('/newsletter/abgemeldet?error=server')
  }

  redirect('/newsletter/abgemeldet')
}
