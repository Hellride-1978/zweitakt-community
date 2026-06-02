import { skillBadgeStyle } from '@/lib/garage'
import Link from 'next/link'

// Server-renderable Darstellung einer Schrauberhalle im Profil
export default function GarageView({ garage, skills, profileId }) {
  if (!garage) return null

  const photos = [1, 2, 3, 4, 5]
    .map(n => garage[`photo_${n}`])
    .filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Skills */}
      {skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map(skill => (
            <span key={skill} style={{ ...skillBadgeStyle(true), cursor: 'default' }}>
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Beschreibung */}
      {garage.description && (
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--ink-muted)', whiteSpace: 'pre-wrap' }}>
          {garage.description}
        </p>
      )}

      {/* Fotos */}
      {photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: photos.length === 1 ? '1fr' : photos.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: 8,
        }}>
          {photos.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--hairline)' }}>
              <img src={url} alt={`Schrauberhallen-Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
