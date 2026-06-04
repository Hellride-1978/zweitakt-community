'use client'

import dynamic from 'next/dynamic'

const MemberMapSplit = dynamic(() => import('@/components/MemberMapSplit'), { ssr: false })

export default function MemberMapWrapper({ members }) {
  return <MemberMapSplit members={members} />
}
