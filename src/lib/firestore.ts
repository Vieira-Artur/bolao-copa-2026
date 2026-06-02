import {
  collection, doc, getDoc, getDocs, query,
  where, orderBy, onSnapshot, setDoc, Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Match, Participant, Score, AppConfig, MatchPrediction } from '../types'

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  if (v instanceof Date) return v
  return new Date(v as string)
}

export function docToMatch(id: string, d: DocumentData): Match {
  return {
    id,
    phase: d.phase,
    group: d.group,
    homeTeam: d.homeTeam,
    awayTeam: d.awayTeam,
    homeScore: d.homeScore ?? null,
    awayScore: d.awayScore ?? null,
    kickoff: toDate(d.kickoff),
    status: d.status,
    deadline: toDate(d.deadline),
    apiId: d.apiId ?? '',
  }
}

export function docToParticipant(id: string, d: DocumentData): Participant {
  return { id, name: d.name, token: d.token, createdAt: toDate(d.createdAt) }
}

export function docToScore(id: string, d: DocumentData): Score {
  return {
    participantId: id,
    participantName: d.participantName ?? '',
    total: d.total ?? 0,
    matchPoints: d.matchPoints ?? 0,
    classificationPoints: d.classificationPoints ?? 0,
    artilheiroPoints: d.artilheiroPoints ?? 0,
    exactScores: d.exactScores ?? 0,
    correctResults: d.correctResults ?? 0,
    tiebreaker: d.tiebreaker ?? {
      champion: false,
      artilheiro: false,
      vice: false,
      third: false,
      exactCount: 0,
    },
    matchBreakdown: d.matchBreakdown ?? {},
    lastUpdated: toDate(d.lastUpdated ?? new Date()),
  }
}

export async function getParticipantByToken(token: string): Promise<Participant | null> {
  const q = query(collection(db, 'participants'), where('token', '==', token))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return docToParticipant(d.id, d.data())
}

export async function getParticipantByName(name: string): Promise<Participant | null> {
  const q = query(collection(db, 'participants'), where('name', '==', name))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return docToParticipant(d.id, d.data())
}

export async function getAllMatches(): Promise<Match[]> {
  const q = query(collection(db, 'matches'), orderBy('kickoff', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToMatch(d.id, d.data()))
}

export function subscribeToScores(
  callback: (scores: Score[]) => void
): () => void {
  const q = query(collection(db, 'scores'), orderBy('total', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => docToScore(d.id, d.data())))
  })
}

export async function getParticipantPredictions(
  participantId: string
): Promise<Record<string, MatchPrediction>> {
  const q = query(collection(db, 'predictions', participantId, 'matches'))
  const snap = await getDocs(q)
  const result: Record<string, MatchPrediction> = {}
  for (const d of snap.docs) {
    result[d.id] = {
      matchId: d.id,
      homeScore: d.data().homeScore,
      awayScore: d.data().awayScore,
      penaltyWinner: d.data().penaltyWinner,
      submittedAt: toDate(d.data().submittedAt),
    }
  }
  return result
}

export async function saveMatchPrediction(
  participantId: string,
  matchId: string,
  pred: Omit<MatchPrediction, 'matchId' | 'submittedAt'>
): Promise<void> {
  await setDoc(
    doc(db, 'predictions', participantId, 'matches', matchId),
    { ...pred, submittedAt: Timestamp.now() }
  )
}

export async function getConfig(): Promise<AppConfig | null> {
  const snap = await getDoc(doc(db, 'config', 'settings'))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    artilheiro: d.artilheiro ?? null,
    lastSync: d.lastSync ? toDate(d.lastSync) : null,
    copaStartDate: toDate(d.copaStartDate),
    groupDeadline: toDate(d.groupDeadline),
  }
}
