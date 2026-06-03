import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import VehicleGallery from '@/components/VehicleGallery'
import { skillBadgeStyle } from '@/lib/garage'
import LikeButton from '@/components/LikeButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faArrowRight, faWrench } from '@fortawesome/free-solid-svg-icons'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('garage').select('profiles(name)').eq('id', id).single()
  const name = data?.profiles?.name
  return { title: name ? `Schrauberhalle von ${name}` : 'Schrauberhalle' }
}

export default async function GarageDetailPage({ params }) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: garage, error } = await supabase
    .from('garage')
    .select('*, profiles(id, name, avatar_url, location)')
    .eq('id', id)
    .single()

  if (error || !garage) {
    return (
      <DesktopLayout crumb="Nicht gefunden">
        <div className="zh-page"><div className="zh-page-inner">
          <p style={{ marginTop: 40, fontFamily: 'var(--display)', fontSize: 24 }}>
            Schrauberhalle nicht gefunden.
          </p>
          <Link href="/schrauberhalle" className="zd-btn outline" style={{ display: 'inline-flex', marginTop: 20 }}>
            ← Zur Übersicht
          </Link>
        </div></div>
      </DesktopLayout>
    )
  }

  const { data: skillsData } = await supabase
    .from('garage_skills')
    .select('skill')
    .eq('user_id', garage.user_id)

  const skills = (skillsData || []).map(s => s.skill)
  const owner  = garage.profiles
  const images = [garage.photo_1, garage.photo_2, garage.photo_3, garage.photo_4, garage.photo_5].filter(Boolean)

  return (
    <DesktopLayout crumb={owner?.name ? `Schrauberhalle · ${owner.name}` : 'Schrauberhalle'}>
      <div className="bike-detail-grid">

        {/* ── Links: Galerie + Besitzer ── */}
        <div style={{ minWidth: 0 }}>
          {images.length > 0 ? (
            <VehicleGallery
              images={images}
              make="Schrauberhalle"
              model={owner?.name || ''}
            />
          ) : (
            <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--accent-3)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--ink)' }}>
              <FontAwesomeIcon icon={faWrench} style={{ fontSize: 52, color: 'var(--accent-ink)', opacity: 0.35 }} />
            </div>
          )}

          {owner && (
            <Link href={`/profile/${owner.id}`} className="zd-card" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', marginTop: 14 }}>
              <div className="zh-avatar offline" style={{ width: 44, height: 44, fontSize: 18, flexShrink: 0 }}>
                {owner.avatar_url
                  ? <img src={owner.avatar_url} alt={owner.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (owner.name || '?').charAt(0).toUpperCase()
                }
              </div>
              <div>
                <div className="zd-mono accent">Schrauber</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 20, marginTop: 4, letterSpacing: 0.3 }}>{owner.name || 'Unbekannt'}</div>
                {owner.location && (
                  <div className="zd-mono" style={{ marginTop: 2 }}>
                    <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 5 }} /> {owner.location}
                  </div>
                )}
              </div>
              <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 'auto', color: 'var(--accent-ink)', fontSize: 16 }} />
            </Link>
          )}
        </div>

        {/* ── Rechts: Infos ── */}
        <div style={{ minWidth: 0, paddingRight: 4, paddingBottom: 4 }}>
          <h1 className="zd-h1" style={{ fontSize: 40, marginBottom: 8 }}>
            <FontAwesomeIcon icon={faWrench} style={{ fontSize: 28, marginRight: 12, color: 'var(--accent-ink)' }} />
            Schrauberhalle
          </h1>
          {owner?.name && (
            <div className="zd-mono accent" style={{ marginBottom: 28 }}>von {owner.name}</div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 10 }}>
                Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map(skill => (
                  <span key={skill} style={{ ...skillBadgeStyle(true), cursor: 'default' }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Beschreibung */}
          {garage.description && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 10 }}>
                Was ich anbiete
              </div>
              <div className="zd-card" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>
                {garage.description}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <LikeButton targetType="garage" targetId={garage.id} />
          </div>

          <Link href="/schrauberhalle" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            ← Alle Schrauberhallen
          </Link>
        </div>
      </div>
    </DesktopLayout>
  )
}
