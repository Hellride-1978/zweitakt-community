import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import DesktopLayout from '@/components/DesktopLayout'

export default async function ProfilesPage() {
  const { data, error } = await supabase.from('profiles').select('*')

  return (
    <DesktopLayout crumb="Community">
    <div className="zh-page">
      <div className="zh-page-inner">

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)' }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: '18px', paddingRight: '12px', borderRight: '1px solid var(--hairline)', color: 'var(--ink)' }}>06</span>
              Frisch aus der Garage
            </div>
            <h1 className="zh-page-title">Alle <em>Schrauber.</em></h1>
            <p className="zh-page-lead">Entdecke andere Zweitakt-Fans und Klubs.</p>
          </div>
          <Link href="/dashboard" className="zh-btn zh-btn-outline" style={{ fontSize: '14px', padding: '10px 20px' }}>
            Dashboard →
          </Link>
        </div>

        {error ? (
          <div className="zh-error">{error.message}</div>
        ) : !data || data.length === 0 ? (
          <div className="zh-card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink-muted)' }}>Noch keine Profile angelegt.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {data.map((profile) => (
              <Link key={profile.id} href={`/profile/${profile.id}`} className="zh-profile-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="zh-profile-avatar" style={{ width: '56px', height: '56px', fontSize: '22px' }}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt={profile.name || 'Avatar'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : (profile.name || '?').charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '24px', lineHeight: 1, color: 'var(--ink)', WebkitTextStroke: '0.4px var(--ink)', paintOrder: 'stroke fill' }}>
                      {profile.name || 'Unbekannt'}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: '4px' }}>
                      {profile.location ? `📍 ${profile.location}` : (profile.user_type === 'club' ? 'Klub' : 'Schrauber')}
                    </div>
                  </div>
                </div>
                {profile.description && (
                  <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {profile.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px dashed var(--hairline)', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  <span>Dabei seit {new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}</span>
                  <span style={{ color: 'var(--accent)' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
    </DesktopLayout>
  )
}
