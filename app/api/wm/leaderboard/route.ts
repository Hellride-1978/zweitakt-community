import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/wm-db'

export async function GET() {
  const board = await getLeaderboard()
  return NextResponse.json(board)
}
