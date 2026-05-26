import { Resend } from 'resend'

export async function POST(request) {
  try {
    const { name, email } = await request.json()
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Zweitakthoden <info@zweitakthoden.de>',
      to: 'info@zweitakthoden.de',
      subject: `Neues Mitglied: ${name || email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #faf7f2; border-radius: 12px;">
          <h2 style="font-size: 22px; margin: 0 0 16px; color: #1a1108;">Neues Mitglied 🏍</h2>
          <p style="margin: 0 0 8px; color: #3a3028;"><strong>Name:</strong> ${name || '—'}</p>
          <p style="margin: 0 0 24px; color: #3a3028;"><strong>E-Mail:</strong> ${email}</p>
          <a href="https://zweitakthoden.de/profiles" style="display: inline-block; padding: 10px 20px; background: #1a1108; color: #faf7f2; border-radius: 8px; text-decoration: none; font-size: 14px;">
            Profil ansehen →
          </a>
        </div>
      `,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Notification email failed:', err)
    return Response.json({ ok: false }, { status: 500 })
  }
}
