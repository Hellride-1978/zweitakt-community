'use client'

import dynamic from 'next/dynamic'

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false })

export default function EventMapView({ lat, lng, locationName, hero = false }) {
  const heroStyle = { height: '100%', width: '100%', borderRadius: 0, border: 'none' }
  return (
    <EventMap
      lat={lat}
      lng={lng}
      readOnly
      markerLabel={locationName || 'Treffpunkt'}
      style={hero ? heroStyle : undefined}
      zoomControl={!hero}
      attributionControl={!hero}
      interactive={!hero}
    />
  )
}
