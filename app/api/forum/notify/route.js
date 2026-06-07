import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function buildHtml({ postTitle, postUrl, replierName, replyPreview }) {
  const preview = replyPreview ? `
            <div style="margin:0 0 24px;padding:16px 20px;background:#f5f5f5;border-left:3px solid #1a1108;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-family:Arial,system-ui,sans-serif;font-size:14px;color:#3a3028;line-height:1.5;font-style:italic;">&ldquo;${replyPreview}&rdquo;</p>
            </div>` : ''

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        <tr>
          <td style="background:#1a1108;padding:24px 32px;">
            <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;color:#ffffff;line-height:1.15;font-weight:800;">Neue <em>Antwort.</em></p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 32px;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#5e5248;font-family:ui-monospace,'Courier New',monospace;">Forum</p>
            <p style="margin:0 0 20px;font-family:Arial,system-ui,sans-serif;font-size:20px;color:#1a1108;line-height:1.4;">
              <strong>${replierName}</strong> hat auf deine Frage<br><strong><em>&ldquo;${postTitle}&rdquo;</em></strong><br>geantwortet.
            </p>
            ${preview}
            <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 24px;"></div>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#1a1108;border-radius:100px;">
                <a href="${postUrl}" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                  Antwort ansehen →
                </a>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:0 32px;"><div style="height:1px;background:rgba(26,17,8,0.15);"></div></td></tr>
        <tr>
          <td style="padding:18px 32px 24px;">
            <p style="margin:0 0 6px;font-size:11px;color:#5e5248;letter-spacing:1.5px;text-transform:uppercase;font-family:ui-monospace,'Courier New',monospace;">zweitakthoden.de — Die Community für Zweitakt-Schrauber</p>
            <p style="margin:0;font-size:11px;color:#8a7a6e;font-family:ui-monospace,'Courier New',monospace;">
              <a href="https://zweitakthoden.de/profile/${'{userId}'}/edit?settings=1" style="color:#1a6080;text-decoration:underline;">Benachrichtigungen verwalten</a>
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
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { postId, replierId, replyBody } = await request.json()
    if (!postId || !replierId) {
      return Response.json({ ok: false, error: 'Fehlende Felder' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Post + Autor-Einstellungen in einem Query laden
    const { data: post } = await admin
      .from('forum_posts')
      .select('id, title, user_id, profiles!forum_posts_user_id_fkey(notify_forum_replies)')
      .eq('id', postId)
      .single()

    if (!post) return Response.json({ ok: true, skipped: true })

    // Kein Mail wenn Autor selbst antwortet
    if (post.user_id === replierId) return Response.json({ ok: true, skipped: true })

    // Kein Mail wenn Benachrichtigungen deaktiviert
    if (post.profiles?.notify_forum_replies === false) return Response.json({ ok: true, skipped: true })

    // Replier-Name laden
    const { data: replierProfile } = await admin
      .from('profiles')
      .select('name')
      .eq('id', replierId)
      .single()
    const replierName = replierProfile?.name || 'Jemand'

    const { data: authorData } = await admin.auth.admin.getUserById(post.user_id)
    const email = authorData?.user?.email
    if (!email) return Response.json({ ok: true, skipped: true })

    const postUrl = `https://zweitakthoden.de/forum/${post.id}`
    const replyPreview = replyBody
      ? replyBody.slice(0, 200) + (replyBody.length > 200 ? '…' : '')
      : null

    const html = buildHtml({ postTitle: post.title, postUrl, replierName, replyPreview })
      .replace('{userId}', post.user_id)

    await resend.emails.send({
      from: 'Zweitakthoden <noreply@send.zweitakthoden.de>',
      to: email,
      subject: `${replierName} hat geantwortet: „${post.title}"`,
      html,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Forum notification failed:', err)
    return Response.json({ ok: false, error: err.message }, { status: 500 })
  }
}
