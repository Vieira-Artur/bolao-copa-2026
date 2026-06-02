export type Phase = 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'
export type MatchStatus = 'scheduled' | 'live' | 'finished'
export type ScoreType = 'exact' | 'goalDiff' | 'oneScore' | 'result' | 'miss'

export interface Match {
  id: string
  phase: Phase
  group?: string          // "A"–"L", only for groups phase
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  kickoff: Date
  status: MatchStatus
  deadline: Date
  apiId: string
}

export interface Participant {
  id: string
  name: string
  token: string
  createdAt: Date
}

export interface MatchPrediction {
  matchId: string
  homeScore: number
  awayScore: number
  penaltyWinner?: string  // required for r32 and beyond
  submittedAt: Date
}

export interface ArtilheiroPrediction {
  player: string
  team: string
}

export interface ClassificationPrediction {
  groupsFirst: Record<string, string>   // { A: "Brasil", B: "França", ... }
  groupsSecond: Record<string, string>
  qf: string[]    // 8 teams reaching quarterfinals
  sf: string[]    // 4 teams reaching semifinals
  final: string[] // 2 finalists
  champion: string
  vice: string
  third: string
  fourth: string
}

export interface Prediction {
  participantId: string
  matches: Record<string, MatchPrediction>
  artilheiro?: ArtilheiroPrediction
  classificacao?: ClassificationPrediction
}

export interface MatchBreakdown {
  points: number
  type: ScoreType
}

export interface TiebreakerStatus {
  champion: boolean
  artilheiro: boolean
  vice: boolean
  third: boolean
  exactCount: number
}

export interface Score {
  participantId: string
  participantName: string
  total: number
  matchPoints: number
  classificationPoints: number
  artilheiroPoints: number
  exactScores: number
  correctResults: number
  tiebreaker: TiebreakerStatus
  matchBreakdown: Record<string, MatchBreakdown>
  lastUpdated: Date
}

export interface AppConfig {
  artilheiro: string | null
  lastSync: Date | null
  copaStartDate: Date
  groupDeadline: Date
}
