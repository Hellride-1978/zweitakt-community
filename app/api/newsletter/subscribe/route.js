import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { buildConfirmationEmail } from '@/lib/newsletter-emails'
import { rateLimit, getClientIp } from '@/lib/internalApiAuth'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function mailer() {
  return nodemailer.createTransport({
    host: process.env.NOTIFY_SMTP_HOST,
    port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.NOTIFY_SMTP_USER, pass: process.env.NOTIFY_SMTP_PASS },
  })
}

function getIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request) {
  try {
    const ip = getClientIp(request)
    const rateLimitError = rateLimit(`subscribe:${ip}`, 3, 300_000) // 3 Versuche pro 5 Min
    if (rateLimitError) return rateLimitError

    const { email, userId } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 })
    }

    const admin = adminClient()
    const transport = mailer()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zweitakthoden.de'
    const ip = getIp(request)

    const { data: existing } = await admin
      .from('newsletter_subscribers')
      .select('id, status, confirmation_token')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.status === 'confirmed') {
        return Response.json({ ok: true, message: 'Du bist bereits angemeldet.' })
      }

      // pending oder unsubscribed → neuen Token generieren und Mail erneut senden
      const { data: updated } = await admin
        .from('newsletter_subscribers')
        .update({
          status: 'pending',
          confirmation_token: crypto.randomUUID(),
          unsubscribe_token: crypto.randomUUID(),
          opt_in_ip: ip,
          opt_in_at: new Date().toISOString(),
          unsubscribed_at: null,
          confirmed_at: null,
          ...(userId ? { user_id: userId } : {}),
        })
        .eq('id', existing.id)
        .select('confirmation_token')
        .single()

      const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${updated.confirmation_token}`
      await transport.sendMail({
        from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
        to: email,
        subject: 'Bitte bestätige deine Newsletter-Anmeldung',
        html: buildConfirmationEmail({ confirmUrl }),
      })
      return Response.json({ ok: true })
    }

    // Neu eintragen
    const newToken = crypto.randomUUID()
    const { error } = await admin
      .from('newsletter_subscribers')
      .insert({
        email,
        status: 'pending',
        confirmation_token: newToken,
        unsubscribe_token: crypto.randomUUID(),
        opt_in_ip: ip,
        opt_in_at: new Date().toISOString(),
        ...(userId ? { user_id: userId } : {}),
      })

    if (error) {
      console.error('Newsletter insert error:', error)
      return Response.json({ error: 'Anmeldung fehlgeschlagen.' }, { status: 500 })
    }

    const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${newToken}`
    await transport.sendMail({
      from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
      to: email,
      subject: 'Bitte bestätige deine Newsletter-Anmeldung',
      html: buildConfirmationEmail({ confirmUrl }),
    })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Newsletter subscribe error:', err)
    return Response.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
