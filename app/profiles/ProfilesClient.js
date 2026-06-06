'use client'

import { useState } from 'react'
import MembersGrid from './MembersGrid'
import MemberMapWrapper from '@/components/MemberMapWrapper'

export default function ProfilesClient({ members, mapMembers }) {
  const [view, setView] = useState('grid')

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          {members.length} Schrauber · {mapMembers.length} auf der Karte
        </div>
        <div className="tab-pills" style={{ margin: 0 }}>
          <button
            type="button"
            className={`tab-pill${view === 'grid' ? ' on' : ''}`}
            onClick={() => setView('grid')}
          >
            Übersicht
          </button>
          <button
            type="button"
            className={`tab-pill${view === 'map' ? ' on' : ''}`}
            onClick={() => setView('map')}
          >
            Karte
          </button>
        </div>
      </div>

      {view === 'grid' && <MembersGrid members={members} />}
      {view === 'map'  && <MemberMapWrapper members={mapMembers} />}
    </>
  )
}
