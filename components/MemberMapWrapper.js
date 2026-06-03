'use client'

import dynamic from 'next/dynamic'

const MemberMap = dynamic(() => import('@/components/MemberMap'), { ssr: false })

export default function MemberMapWrapper({ members }) {
  return <MemberMap members={members} />
}
