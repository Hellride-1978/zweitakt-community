'use client'

import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMotorcycle, faArrowRight, faImage, faWrench, faPlus } from '@fortawesome/free-solid-svg-icons'
import { skillBadgeStyle } from '@/lib/garage'

export default function ProfileGarageSection({ profileId, vehicles, vehicleLikeCounts, garage, garageSkills }) {
  const { user } = useAuth()
  const isOwner = user?.id === profileId

  const firstGaragePhoto = garage
    ? [garage.photo_1, garage.photo_2, garage.photo_3, garage.photo_4, garage.photo_5].find(Boolean)
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>

      {/* ── Bikes ── */}
      <div>
        <div className="zd-mono accent" style={{ marginBottom: 4 }}>Schrauberhalle</div>
        <h2 className="zd-h2" style={{ marginTop: 6, marginBottom: 16 }}>meine <em>bikes.</em></h2>

        {!vehicles || vehicles.length === 0 ? (
          // Leerer Zustand
          <div className="zd-card" style={{ textAlign: 'center', padding: '36px 24px', border: '2px dashed var(--hairline)' }}>
            <FontAwesomeIcon icon={faMotorcycle} style={{ fontSize: 32, opacity: 0.25, color: 'var(--ink-muted)', display: 'block', margin: '0 auto 10px' }} />
            <p style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--ink-muted)', margin: '0 0 14px' }}>
              Noch keine Bikes eingetragen.
            </p>
            {isOwner && (
              <Link href="/vehicles/new" className="zd-btn accent" style={{ display: 'inline-flex', gap: 8, fontSize: 14 }}>
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} /> Bike eintragen
              </Link>
            )}
          </div>
        ) : (
          <div className="garage-grid">
            {vehicles.map((v, idx) => {
              const vLikes = vehicleLikeCounts?.[v.id] ?? 0
              return (
                <>
                  <Link key={v.id} href={`/vehicles/${v.id}`} className="zd-bike" style={{ textDecoration: 'none' }}>
                    <div className="img" style={{ position: 'relative' }}>
                      {v.image_url
                        ? <img src={v.image_url} alt={`${v.make} ${v.model}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <FontAwesomeIcon icon={faMotorcycle} style={{ fontSize: 40, opacity: 0.3, color: 'var(--ink-muted)' }} />
                      }
                      {[v.image_url_2, v.image_url_3, v.image_url_4].filter(Boolean).length > 0 && (
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(26,17,8,0.75)', backdropFilter: 'blur(4px)', color: '#fff', borderRadius: 6, padding: '3px 7px', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.2px' }}>
                          <FontAwesomeIcon icon={faImage} style={{ fontSize: 11 }} />
                          {1 + [v.image_url_2, v.image_url_3, v.image_url_4].filter(Boolean).length}
                        </div>
                      )}
                      {vLikes > 0 && (
                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(26,17,8,0.75)', backdropFilter: 'blur(4px)', color: '#fff', borderRadius: 6, padding: '3px 7px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.2px' }}>
                          ♥ {vLikes}
                        </div>
                      )}
                    </div>
                    <div className="info">
                      <div className="model">{v.make} <span style={{ color: 'var(--accent-ink)' }}>{v.model}</span></div>
                      {v.title && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-ink)', marginTop: 4 }}>{v.title}</div>}
                      <div className="yr">{[v.year, v.displacement_cc ? `${v.displacement_cc} ccm` : null].filter(Boolean).join(' · ') || '—'}</div>
                      <div className="specs">
                        {v.year && <div className="s"><div className="lbl">BJ</div><div className="v">{v.year}</div></div>}
                        {v.displacement_cc && <div className="s"><div className="lbl">Hubraum</div><div className="v">{v.displacement_cc} cc</div></div>}
                      </div>
                    </div>
                  </Link>

                  {/* +Bike nach dem ersten Bike (nur für Besitzer) */}
                  {isOwner && idx === 0 && (
                    <Link key="add-bike" href="/vehicles/new" className="zd-bike" style={{ textDecoration: 'none', border: '2px dashed var(--hairline)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 160 }}>
                      <FontAwesomeIcon icon={faPlus} style={{ fontSize: 22, color: 'var(--ink-muted)', opacity: 0.5 }} />
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>+ Bike</span>
                    </Link>
                  )}
                </>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Garage ── */}
      <div>
        <div className="zd-mono accent" style={{ marginBottom: 4 }}>
          <FontAwesomeIcon icon={faWrench} style={{ marginRight: 6 }} />
          Garage
        </div>
        <h2 className="zd-h2" style={{ marginTop: 6, marginBottom: 16 }}>kann ich <em>helfen.</em></h2>

        {garage ? (
          // Garage vorhanden → Vorschau
          <div className="zd-card" style={{ padding: 0, overflow: 'hidden' }}>
            {firstGaragePhoto && (
              <div style={{ width: '100%', height: 160, overflow: 'hidden' }}>
                <img src={firstGaragePhoto} alt="Schrauberhalle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {garageSkills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {garageSkills.map(skill => (
                    <span key={skill} style={{ ...skillBadgeStyle(true), cursor: 'default', fontSize: 9, padding: '3px 8px' }}>{skill}</span>
                  ))}
                </div>
              )}
              {garage.description && (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {garage.description}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                <Link href={`/schrauberhalle/${garage.id}`} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-ink)', textDecoration: 'none' }}>
                  Schrauberhalle ansehen →
                </Link>
                {isOwner && (
                  <Link href={`/schrauberhalle/new`} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', textDecoration: 'none' }}>
                    Bearbeiten →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : isOwner ? (
          // Keine Garage, eigenes Profil → Anlegen-CTA
          <div className="zd-card" style={{ textAlign: 'center', padding: '36px 24px', border: '2px dashed var(--hairline)' }}>
            <FontAwesomeIcon icon={faWrench} style={{ fontSize: 32, opacity: 0.25, color: 'var(--ink-muted)', display: 'block', margin: '0 auto 10px' }} />
            <p style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'var(--ink-muted)', margin: '0 0 14px' }}>
              Noch keine Schrauberhalle eingetragen.
            </p>
            <Link href={`/schrauberhalle/new`} className="zd-btn accent" style={{ display: 'inline-flex', gap: 8, fontSize: 14 }}>
              <FontAwesomeIcon icon={faWrench} style={{ fontSize: 12 }} /> Schrauberhalle anlegen
            </Link>
          </div>
        ) : null}
      </div>

    </div>
  )
}
