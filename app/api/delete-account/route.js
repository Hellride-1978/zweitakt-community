import { createClient } from '@supabase/supabase-js'

// Buckets, in denen der User Dateien ablegen kann, mit dem jeweiligen Ordner-Präfix.
// Die DB-Zeilen verschwinden per ON DELETE CASCADE über profiles – die Dateien im
// Storage nicht, die müssen hier explizit weg (alle Buckets sind öffentlich lesbar).
const USER_BUCKETS = [
  { bucket: 'vehicles',     prefix: (uid) => `vehicles/${uid}` },
  { bucket: 'garage',       prefix: (uid) => uid },
  { bucket: 'forum-images', prefix: (uid) => uid },
  { bucket: 'event-images', prefix: (uid) => uid },
]

// Löscht rekursiv alle Dateien unterhalb eines Präfix. Fehler werden geloggt,
// brechen die Kontolöschung aber nicht ab – die DB-Löschung hat Vorrang.
async function removeFolder(admin, bucket, prefix) {
  try {
    const { data: entries, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000 })
    if (error || !entries?.length) return

    const files = entries.filter(e => e.id !== null).map(e => `${prefix}/${e.name}`)
    if (files.length) {
      const { error: rmError } = await admin.storage.from(bucket).remove(files)
      if (rmError) console.error(`delete-account: remove failed for ${bucket}/${prefix}`, rmError)
    }

    // Unterordner (z.B. vehicles/<uid>/ hat keine, garage/<uid>/ ebenfalls nicht –
    // aber falls sich das Pfadschema ändert, bleibt hier nichts liegen)
    for (const dir of entries.filter(e => e.id === null)) {
      await removeFolder(admin, bucket, `${prefix}/${dir.name}`)
    }
  } catch (err) {
    console.error(`delete-account: storage cleanup failed for ${bucket}/${prefix}`, err)
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })

    // Feedback bleibt zu Auswertungszwecken erhalten, wird aber echt anonymisiert:
    // user_id läuft über ON DELETE SET NULL, die freiwillige E-Mail-Adresse nicht.
    const { error: feedbackError } = await admin
      .from('feedbacks')
      .update({ email: null })
      .eq('user_id', user.id)
    if (feedbackError) console.error('delete-account: feedback anonymisation failed', feedbackError)

    // Storage vor der DB-Löschung aufräumen – danach ist die User-ID noch bekannt.
    await Promise.all(USER_BUCKETS.map(b => removeFolder(admin, b.bucket, b.prefix(user.id))))

    const { error: avatarError } = await admin.storage.from('avatars').remove([`avatars/${user.id}.jpg`])
    if (avatarError) console.error('delete-account: avatar removal failed', avatarError)

    // comments, likes, messages, forum_*, garage* hängen per ON DELETE CASCADE an
    // profiles. Die beiden folgenden Löschungen sind dadurch eigentlich redundant –
    // sie bleiben bewusst stehen, weil das reale FK-Verhalten der Produktions-DB
    // nicht aus den Migrationen im Repo hervorgeht (siehe SUPABASE_SETUP.md).
    await admin.from('ride_participants').delete().eq('user_id', user.id)
    await admin.from('vehicles').delete().eq('user_id', user.id)

    const { error: profileError } = await admin.from('profiles').delete().eq('id', user.id)
    if (profileError) {
      console.error('delete-account: profile deletion failed', profileError)
      return Response.json({ error: 'Account konnte nicht gelöscht werden.' }, { status: 500 })
    }

    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) {
      console.error('delete-account: deleteUser failed', error)
      return Response.json({ error: 'Account konnte nicht gelöscht werden.' }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('delete-account error:', err)
    return Response.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
