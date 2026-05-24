'use server'

import { createClient } from '@supabase/supabase-js'

export async function inviteByEmail(clubId, email, role = 'member') {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return { error: 'Service-Key nicht konfiguriert. Bitte SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.' }
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const redirectTo = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/clubs/${clubId}`
    : `/clubs/${clubId}`

  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, { redirectTo })
  if (error) return { error: error.message }
  return { ok: true }
}
