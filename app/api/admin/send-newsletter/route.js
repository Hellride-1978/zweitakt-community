import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'martin@delavega.de'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function requireAdmin(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: { user }, error } = await adminClient().auth.getUser(token)
  if (error || !user) return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (user.email !== ADMIN_EMAIL) return { error: Response.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user }
}

function mailer() {
  return nodemailer.createTransport({
    host: process.env.NOTIFY_SMTP_HOST,
    port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.NOTIFY_SMTP_USER, pass: process.env.NOTIFY_SMTP_PASS },
  })
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function resolvePlaceholders(text, profileName) {
  if (!text.includes('{{')) return text
  const firstName = profileName?.split(' ')[0] || null
  return text
    .replace(/\{\{anrede\}\}/g, firstName ? `Hallo ${firstName},` : 'Hallo Schrauber,')
    .replace(/\{\{name\}\}/g,    firstName || 'Schrauber')
    .replace(/\{\{vorname\}\}/g, firstName || 'Schrauber')
}

// Rendert blocks-Array zu HTML-Tabellenzeilen
function renderBlocks(blocks, profileName) {
  return blocks.map((block, i) => {
    if (block.type === 'image') {
      const safeUrl = block.content?.startsWith('https://') ? block.content : null
      if (!safeUrl) return ''
      return `
        <tr>
          <td style="padding:0;">
            <img src="${safeUrl}" alt="" width="560"
              style="width:100%;max-width:560px;display:block;border:0;" />
          </td>
        </tr>`
    }
    // text block
    const resolved = resolvePlaceholders(block.content || '', profileName)
    const bodyHtml = resolved
      .split('\n\n')
      .filter(Boolean)
      .map(p => `<p style="margin:0 0 14px;font-family:Arial,system-ui,sans-serif;font-size:16px;color:#1a1108;line-height:1.7;">${escHtml(p).replace(/\n/g, '<br>')}</p>`)
      .join('')
    const topPad = i === 0 ? '36px' : '8px'
    return `
        <tr>
          <td style="padding:${topPad} 32px 0;">
            ${bodyHtml}
          </td>
        </tr>`
  }).join('')
}

function buildHtml({ headline, blocks, ctaLabel, ctaUrl, unsubscribeUrl, profileName }) {
  const safeCtaUrl = ctaUrl?.startsWith('https://') ? ctaUrl : null

  const cta = ctaLabel && safeCtaUrl ? `
        <tr>
          <td style="padding:8px 32px 32px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#1a1108;border-radius:100px;">
                <a href="${safeCtaUrl}" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escHtml(ctaLabel)} →</a>
              </td>
            </tr></table>
          </td>
        </tr>` : `<tr><td style="height:32px;"></td></tr>`

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        <tr>
          <td style="background:#1a1108;padding:24px 32px;">
            <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;color:#ffffff;line-height:1.15;font-weight:800;">${escHtml(headline)}</p>
          </td>
        </tr>
        ${renderBlocks(blocks, profileName)}
        ${cta}
        <tr><td style="padding:0 32px;"><div style="height:1px;background:rgba(26,17,8,0.15);"></div></td></tr>
        <tr>
          <td style="padding:18px 32px 24px;">
            <p style="margin:0 0 6px;font-size:11px;color:#5e5248;letter-spacing:1.5px;text-transform:uppercase;font-family:ui-monospace,'Courier New',monospace;">zweitakthoden.de — Die Community für Zweitakt-Schrauber</p>
            <p style="margin:0;font-size:11px;color:#8a7a6e;font-family:ui-monospace,'Courier New',monospace;">
              <a href="${unsubscribeUrl}" style="color:#1a6080;text-decoration:underline;">Newsletter abmelden</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { subject, headline, blocks, ctaLabel, ctaUrl, preview } = await request.json()

    if (!subject?.trim() || !headline?.trim() || !Array.isArray(blocks)) {
      return Response.json({ error: 'Betreff, Headline und Inhalt sind erforderlich.' }, { status: 400 })
    }
    const hasText = blocks.some(b => b.type === 'text' && b.content?.trim())
    if (!hasText) return Response.json({ error: 'Mindestens ein Text-Block ist erforderlich.' }, { status: 400 })

    const admin    = adminClient()
    const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zweitakthoden.de'
    const transport = mailer()

    // Preview: an Admin mit eigenem Namen
    if (preview) {
      const { data: adminProfile } = await admin.from('profiles').select('name').eq('id', auth.user.id).single()
      const html = buildHtml({ headline, blocks, ctaLabel, ctaUrl, profileName: adminProfile?.name, unsubscribeUrl: `${baseUrl}/newsletter/abgemeldet` })
      await transport.sendMail({
        from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `[VORSCHAU] ${subject}`,
        html,
      })
      return Response.json({ ok: true, sent: 1, preview: true })
    }

    // Alle bestätigten Abonnenten
    const { data: subscribers, error } = await admin
      .from('newsletter_subscribers')
      .select('email, unsubscribe_token, user_id')
      .eq('status', 'confirmed')

    if (error) return Response.json({ error: 'Fehler beim Laden der Abonnenten.' }, { status: 500 })
    if (!subscribers?.length) return Response.json({ ok: true, sent: 0 })

    // Profil-Namen laden wenn Platzhalter vorhanden
    const needsNames = blocks.some(b => b.type === 'text' && b.content?.includes('{{'))
    let profileMap = {}
    if (needsNames) {
      const userIds = subscribers.filter(s => s.user_id).map(s => s.user_id)
      if (userIds.length > 0) {
        const { data: profiles } = await admin.from('profiles').select('id, name').in('id', userIds)
        profileMap = Object.fromEntries(profiles?.map(p => [p.id, p.name]) ?? [])
      }
    }

    let sent = 0, failed = 0

    for (const sub of subscribers) {
      try {
        const profileName    = sub.user_id ? profileMap[sub.user_id] : null
        const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`
        const html = buildHtml({ headline, blocks, ctaLabel, ctaUrl, profileName, unsubscribeUrl })
        await transport.sendMail({
          from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
          to: sub.email,
          subject,
          html,
        })
        sent++
      } catch {
        failed++
      }
    }

    return Response.json({ ok: true, sent, failed })
  } catch (err) {
    console.error('Newsletter send error:', err)
    return Response.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
