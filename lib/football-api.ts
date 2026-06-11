const BASE_URL = 'https://api.football-data.org/v4'

function headers() {
  return { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY ?? '' }
}

export interface ApiMatch {
  id: number
  utcDate: string
  status: string
  matchday: number | null
  stage: string
  minute: number | null | undefined
  homeTeam: { id: number; name: string; shortName: string; tla: string | null; crest: string | null }
  awayTeam: { id: number; name: string; shortName: string; tla: string | null; crest: string | null }
  score: {
    winner: string | null
    fullTime: { home: number | null; away: number | null }
  }
  bookings?: Array<{ minute: number; team: { id: number }; card: string }>
}

export async function fetchWcMatches(): Promise<ApiMatch[]> {
  const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: headers(),
    cache: 'no-store',
  } as RequestInit)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`football-data.org error ${res.status}: ${text}`)
  }
  const json = await res.json()
  return json.matches as ApiMatch[]
}

// FIFA flag emoji lookup by TLA (three-letter code)
const FLAG_MAP: Record<string, string> = {
  ARG: '🇦🇷', AUS: '🇦🇺', BEL: '🇧🇪', BRA: '🇧🇷', CAN: '🇨🇦', CHI: '🇨🇱',
  COL: '🇨🇴', CRC: '🇨🇷', CRO: '🇭🇷', DEN: '🇩🇰', ECU: '🇪🇨', EGY: '🇪🇬',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ESP: '🇪🇸', FRA: '🇫🇷', GER: '🇩🇪', GHA: '🇬🇭', GRE: '🇬🇷',
  HON: '🇭🇳', HUN: '🇭🇺', IRN: '🇮🇷', IRQ: '🇮🇶', ITA: '🇮🇹', JAM: '🇯🇲',
  JPN: '🇯🇵', KOR: '🇰🇷', MAR: '🇲🇦', MEX: '🇲🇽', NED: '🇳🇱', NGA: '🇳🇬',
  NZL: '🇳🇿', PAN: '🇵🇦', PER: '🇵🇪', POL: '🇵🇱', POR: '🇵🇹', QAT: '🇶🇦',
  ROU: '🇷🇴', RUS: '🇷🇺', SAU: '🇸🇦', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', SEN: '🇸🇳', SER: '🇷🇸',
  SLO: '🇸🇮', SVK: '🇸🇰', SUI: '🇨🇭', TUN: '🇹🇳', TUR: '🇹🇷', UAE: '🇦🇪',
  URU: '🇺🇾', USA: '🇺🇸', VEN: '🇻🇪', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
}

export function flagForTla(tla: string | null | undefined): string {
  if (!tla) return '🏳'
  return FLAG_MAP[tla.toUpperCase()] ?? '🏳'
}
