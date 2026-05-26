import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DesktopLayout from '@/components/DesktopLayout'
import VehicleGallery from '@/components/VehicleGallery'
import VehicleOwnerActions from '@/components/VehicleOwnerActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default async function VehiclePage({ params }) {
  const { id } = await params

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*, profiles(id, name, avatar_url, location)')
    .eq('id', id)
    .single()

  if (error || !vehicle) {
    return (
      <DesktopLayout crumb="Nicht gefunden">
        <div style={{ padding: '40px 0' }}>
          <div className="zd-card">
            <h1 className="zh-page-title" style={{ fontSize: 36 }}>Fahrzeug nicht gefunden.</h1>
            <Link href="/profiles" className="zd-btn outline" style={{ display: 'inline-flex', marginTop: 20 }}>← Community</Link>
          </div>
        </div>
      </DesktopLayout>
    )
  }

  const owner = vehicle.profiles

  return (
    <DesktopLayout crumb={`${vehicle.make} ${vehicle.model}`}>
      <div className="bike-detail-grid">
        {/* ── Left: hero + thumbs ── */}
        <div style={{ minWidth: 0 }}>
          <VehicleGallery
            images={[vehicle.image_url, vehicle.image_url_2, vehicle.image_url_3, vehicle.image_url_4]}
            make={vehicle.make}
            model={vehicle.model}
          />

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
                {owner.location && <div className="zd-mono" style={{ marginTop: 2 }}><FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 5 }} /> {owner.location}</div>}
              </div>
              <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 16 }} />
            </Link>
          )}
        </div>

        {/* ── Right: specs + info ── */}
        <div style={{ minWidth: 0, paddingRight: 4, paddingBottom: 4 }}>
          <div style={{ marginBottom: 8 }}>
            <h1 className="zd-h1" style={{ fontSize: 44 }}>
              {vehicle.make} <em>{vehicle.model}</em>
            </h1>
          </div>

          {vehicle.title && (
            <div className="zd-mono accent" style={{ marginBottom: 24 }}>· {vehicle.title}</div>
          )}

          {/* Spec grid — nur rendern wenn mind. ein Wert vorhanden */}
          {(vehicle.year || vehicle.displacement_cc) && (
            <div className="spec-grid-d" style={{ marginBottom: 28 }}>
              {vehicle.year && (
                <div className="s"><div className="lbl">Baujahr</div><div className="v">{vehicle.year}</div></div>
              )}
              {vehicle.displacement_cc && (
                <div className="s"><div className="lbl">Hubraum</div><div className="v">{vehicle.displacement_cc} cc</div></div>
              )}
            </div>
          )}

          {/* Description / notes */}
          {vehicle.description && (
            <>
              <div className="zd-mono accent" style={{ marginBottom: 12 }}>Beschreibung</div>
              <div className="zd-card" style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {vehicle.description}
                </p>
              </div>
            </>
          )}

          {/* Actions — nur für Besitzer */}
          <VehicleOwnerActions vehicleId={vehicle.id} ownerId={vehicle.user_id} />
        </div>
      </div>
    </DesktopLayout>
  )
}
