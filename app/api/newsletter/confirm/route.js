import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { redirect } from 'next/navigation'
import { buildWelcomeEmail } from '@/lib/newsletter-emails'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) redirect('/newsletter/bestaetigt?error=missing')

  const admin = adminClient()

  const { data: subscriber } = await admin
    .from('newsletter_subscribers')
    .select('id, email, status, unsubscribe_token')
    .eq('confirmation_token', token)
    .single()

  if (!subscriber) redirect('/newsletter/bestaetigt?error=invalid')
  if (subscriber.status === 'confirmed') redirect('/newsletter/bestaetigt?already=1')

  const { error } = await admin
    .from('newsletter_subscribers')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmation_token: null,
    })
    .eq('id', subscriber.id)

  if (error) {
    console.error('Newsletter confirm error:', error)
    redirect('/newsletter/bestaetigt?error=server')
  }

  // Willkommensmail senden
  try {
    const transport = nodemailer.createTransport({
      host: process.env.NOTIFY_SMTP_HOST,
      port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.NOTIFY_SMTP_USER, pass: process.env.NOTIFY_SMTP_PASS },
    })
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zweitakthoden.de'
    const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`

    await transport.sendMail({
      from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
      to: subscriber.email,
      subject: 'Willkommen bei den Zweitakthoden!',
      html: buildWelcomeEmail({ unsubscribeUrl }),
    })
  } catch (err) {
    console.error('Welcome email failed:', err)
    // Bestätigung trotzdem als Erfolg werten
  }

  redirect('/newsletter/bestaetigt')
}
