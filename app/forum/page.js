import { createServerClient } from '@/lib/supabase'
import { Suspense } from 'react'
import PostCard from '@/components/forum/PostCard'
import TagFilter from '@/components/forum/TagFilter'
import NewPostButton from '@/components/forum/NewPostButton'

export const metadata = {
  title: 'Forum · Zweitakthoden',
  description: 'Fragen, Antworten und Diskussionen rund um Zweitakt-Motorräder und Mopeds.',
}

export const dynamic = 'force-dynamic'

async function fetchData(tagId) {
  const supabase = createServerClient()

  const { data: allTags } = await supabase
    .from('forum_tags').select('id, name, category').order('name')

  const brandTags = (allTags ?? []).filter(t => t.category === 'brand')
  const topicTags = (allTags ?? []).filter(t => t.category !== 'brand')

  let postIds = null
  if (tagId) {
    const { data: tagged } = await supabase
      .from('forum_post_tags').select('post_id').eq('tag_id', tagId)
    postIds = (tagged ?? []).map(t => t.post_id)
    if (postIds.length === 0) return { brandTags, topicTags, posts: [] }
  }

  let postsQuery = supabase
    .from('forum_posts')
    .select(`id, title, body, image_url, created_at, user_id, forum_replies(count), forum_post_tags(forum_tags(id, name))`)
    .order('created_at', { ascending: false })

  if (postIds) postsQuery = postsQuery.in('id', postIds)

  const { data: rawPosts } = await postsQuery
  const posts = rawPosts ?? []

  if (posts.length > 0) {
    const userIds = [...new Set(posts.map(p => p.user_id))]
    const { data: profileRows } = await supabase
      .from('profiles').select('id, name').in('id', userIds)
    const profileMap = Object.fromEntries((profileRows ?? []).map(p => [p.id, p]))
    posts.forEach(p => { p.profiles = profileMap[p.user_id] ?? null })
  }

  return { brandTags, topicTags, posts }
}

export default async function ForumPage({ searchParams }) {
  const params  = await searchParams
  const tagId   = params?.tag ?? null
  const { brandTags, topicTags, posts } = await fetchData(tagId)

  return (
    <div className="feed-col">
      <div className="feed-head">
        <div>
          <div className="zd-mono accent">Forum</div>
          <h1 className="zd-h1" style={{ marginTop: 6 }}>Die <em>Anlaufstelle</em></h1>
        </div>
        <NewPostButton />
      </div>

        <Suspense>
          <TagFilter brandTags={brandTags} topicTags={topicTags} activeTagId={tagId} />
        </Suspense>

        {posts.length === 0 ? (
          <div className="forum-empty">
            Noch keine Fragen — sei der Erste!
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
    </div>
  )
}
