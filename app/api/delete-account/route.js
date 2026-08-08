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

const PAGE_SIZE = 100

// list() liefert per Default nur 100 Einträge – deshalb seitenweise durchgehen.
// Erst vollständig auflisten, dann löschen: würde man währenddessen löschen,
// verschieben sich die Offsets und es bliebe etwas stehen.
async function listAll(admin, bucket, prefix) {
  const all = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefix, { limit: PAGE_SIZE, offset })
    if (error) throw error
    if (!data?.length) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
  }
  return all
}

// Löscht rekursiv alle Dateien unterhalb eines Präfix. Fehler werden geloggt,
// brechen die Kontolöschung aber nicht ab – die DB-Löschung hat Vorrang.
// Ordner erkennt man daran, dass id null ist (so dokumentiert in storage-js).
async function removeFolder(admin, bucket, prefix) {
  try {
    const entries = await listAll(admin, bucket, prefix)
    if (!entries.length) return

    const files = entries.filter(e => e.id !== null).map(e => `${prefix}/${e.name}`)
    for (let i = 0; i < files.length; i += PAGE_SIZE) {
      const { error: rmError } = await admin.storage
        .from(bucket)
        .remove(files.slice(i, i + PAGE_SIZE))
      if (rmError) console.error(`delete-account: remove failed for ${bucket}/${prefix}`, rmError)
    }

    // Unterordner: aktuell legt kein Upload-Pfad welche an, aber falls sich das
    // Schema ändert, bleibt hier trotzdem nichts liegen.
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
    // profiles. Die folgenden Löschungen sind dadurch eigentlich redundant – sie
    // stehen bewusst hier, weil das reale FK-Verhalten der Produktions-DB nicht aus
    // ausführbaren Migrationen hervorgeht, sondern nur aus SUPABASE_SETUP.md.
    // Reihenfolge: erst eigene Teilnahmen, dann eigene Termine (das räumt auch die
    // Teilnahmen anderer an diesen Terminen ab), dann Fahrzeuge.
    await admin.from('ride_participants').delete().eq('user_id', user.id)
    await admin.from('rides').delete().eq('creator_id', user.id)
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
