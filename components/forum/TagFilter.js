'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function TagFilter({ brandTags, topicTags, activeTagId }) {
  const router = useRouter()
  const params = useSearchParams()

  const select = (tagId) => {
    const next = new URLSearchParams(params)
    if (!tagId || tagId === activeTagId) {
      next.delete('tag')
    } else {
      next.set('tag', tagId)
    }
    router.push(`/forum?${next.toString()}`)
  }

  const activeBrand = brandTags.find(t => t.id === activeTagId)

  return (
    <div className="forum-tag-bar" style={{ alignItems: 'center' }}>

      {/* Marken-Dropdown */}
      <div style={{ position: 'relative' }}>
        <select
          className={`forum-select${activeBrand ? ' active' : ''}`}
          value={activeTagId && activeBrand ? activeTagId : ''}
          onChange={e => select(e.target.value || null)}
        >
          <option value="">Alle Marken</option>
          {brandTags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>

      {/* Themen-Pills */}
      <button
        className={`forum-tag-btn${!activeTagId ? ' active' : ''}`}
        onClick={() => select(null)}
      >
        Alle
      </button>
      {topicTags.map(tag => (
        <button
          key={tag.id}
          className={`forum-tag-btn${activeTagId === tag.id ? ' active' : ''}`}
          onClick={() => select(tag.id)}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
