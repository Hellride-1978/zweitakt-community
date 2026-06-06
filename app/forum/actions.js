'use server'

import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function getVerifiedUser(accessToken) {
  if (!accessToken) return null
  const { data: { user }, error } = await adminClient().auth.getUser(accessToken)
  return error ? null : user
}

const postSchema = z.object({
  title:     z.string().min(5, 'Titel braucht mindestens 5 Zeichen').max(200, 'Titel ist zu lang'),
  body:      z.string().min(20, 'Frage braucht mindestens 20 Zeichen').max(10000, 'Text ist zu lang'),
  tags:      z.array(z.string().uuid()).max(5),
  image_url: z.string().url().optional().or(z.literal('')),
})

const replySchema = z.object({
  postId:    z.string().uuid('Ungültige Post-ID'),
  body:      z.string().min(5, 'Antwort braucht mindestens 5 Zeichen').max(5000, 'Text ist zu lang'),
  image_url: z.string().url().optional().or(z.literal('')),
})

export async function createPost(accessToken, prevState, formData) {
  const user = await getVerifiedUser(accessToken)
  if (!user) return { error: 'Du musst eingeloggt sein.' }

  const raw = {
    title:     formData.get('title'),
    body:      formData.get('body'),
    tags:      formData.getAll('tags'),
    image_url: formData.get('image_url') || '',
  }

  const result = postSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { title, body, tags, image_url } = result.data
  const admin = adminClient()

  const { data: post, error } = await admin
    .from('forum_posts')
    .insert({ user_id: user.id, title, body, image_url: image_url || null })
    .select('id')
    .single()

  if (error) return { error: 'Speichern fehlgeschlagen: ' + error.message }

  if (tags.length > 0) {
    await admin.from('forum_post_tags').insert(
      tags.map(tag_id => ({ post_id: post.id, tag_id }))
    )
  }

  revalidatePath('/forum')
  redirect(`/forum/${post.id}`)
}

export async function createReply(accessToken, prevState, formData) {
  const user = await getVerifiedUser(accessToken)
  if (!user) return { error: 'Du musst eingeloggt sein.' }

  const raw = {
    postId:    formData.get('postId'),
    body:      formData.get('body'),
    image_url: formData.get('image_url') || '',
  }

  const result = replySchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { postId, body, image_url } = result.data
  const admin = adminClient()

  const { data: reply, error } = await admin
    .from('forum_replies')
    .insert({ post_id: postId, user_id: user.id, body, image_url: image_url || null })
    .select('id')
    .single()

  if (error) return { error: 'Speichern fehlgeschlagen: ' + error.message }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zweitakthoden.de'
  fetch(`${baseUrl}/api/forum/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, replierId: user.id, replyBody: body }),
  }).catch(() => {})

  revalidatePath(`/forum/${postId}`)
  return { ok: true, id: reply.id }
}

export async function deletePost(accessToken, formData) {
  const user = await getVerifiedUser(accessToken)
  if (!user) return { error: 'Nicht eingeloggt' }

  const postId = formData.get('postId')
  if (!z.string().uuid().safeParse(postId).success) return { error: 'Ungültige ID' }

  const admin = adminClient()
  const { data: post } = await admin.from('forum_posts').select('user_id').eq('id', postId).single()
  if (!post || post.user_id !== user.id) return { error: 'Keine Berechtigung' }

  await admin.from('forum_posts').delete().eq('id', postId)

  revalidatePath('/forum')
  redirect('/forum')
}

export async function updatePost(accessToken, prevState, formData) {
  const user = await getVerifiedUser(accessToken)
  if (!user) return { error: 'Nicht eingeloggt' }

  const postId = formData.get('postId')
  if (!z.string().uuid().safeParse(postId).success) return { error: 'Ungültige ID' }

  const raw = {
    title: formData.get('title'),
    body:  formData.get('body'),
    tags:  formData.getAll('tags').filter(Boolean),
  }

  const result = postSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { title, body, tags } = result.data
  const admin = adminClient()

  const { data: post } = await admin.from('forum_posts').select('user_id').eq('id', postId).single()
  if (!post || post.user_id !== user.id) return { error: 'Keine Berechtigung' }

  await admin.from('forum_posts').update({ title, body }).eq('id', postId)

  await admin.from('forum_post_tags').delete().eq('post_id', postId)
  if (tags.length > 0) {
    await admin.from('forum_post_tags').insert(tags.map(tag_id => ({ post_id: postId, tag_id })))
  }

  revalidatePath(`/forum/${postId}`)
  redirect(`/forum/${postId}`)
}

export async function toggleVote(accessToken, formData) {
  const user = await getVerifiedUser(accessToken)
  if (!user) return { error: 'Du musst eingeloggt sein.' }

  const postId  = formData.get('postId')  || null
  const replyId = formData.get('replyId') || null
  const value   = parseInt(formData.get('value'), 10)

  if (!postId && !replyId) return { error: 'Kein Ziel angegeben.' }
  if (value !== 1 && value !== -1) return { error: 'Ungültiger Wert.' }

  const admin = adminClient()

  // Jeder Vote-Typ (👍/👎) ist unabhängig → suche nach exakt diesem value
  let query = admin.from('forum_votes').select('id').eq('user_id', user.id).eq('value', value)
  if (postId)  query = query.eq('post_id', postId).is('reply_id', null)
  if (replyId) query = query.eq('reply_id', replyId).is('post_id', null)

  const { data: existing } = await query.maybeSingle()

  if (existing) {
    await admin.from('forum_votes').delete().eq('id', existing.id)
  } else {
    const insert = { user_id: user.id, value }
    if (postId)  insert.post_id  = postId
    if (replyId) insert.reply_id = replyId
    await admin.from('forum_votes').insert(insert)
  }

  if (postId) {
    revalidatePath(`/forum/${postId}`)
  } else if (replyId) {
    const { data } = await admin.from('forum_replies').select('post_id').eq('id', replyId).single()
    if (data) revalidatePath(`/forum/${data.post_id}`)
  }

  return { ok: true }
}
