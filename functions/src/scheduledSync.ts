import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore()

const API_KEY = functions.config().apisports?.key ?? ''
const API_HOST = 'v3.football.api-sports.io'
const LEAGUE_ID = 1
const SEASON = 2026

async function fetchFinishedMatches(): Promise<any[]> {
  const url = `https://${API_HOST}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&status=FT`
  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  })
  if (!res.ok) {
    console.error(`API error ${res.status}`)
    return []
  }
  const data = await res.json()
  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error('API errors:', JSON.stringify(data.errors))
    return []
  }
  return data.response ?? []
}

async function fetchLiveMatches(): Promise<any[]> {
  const url = `https://${API_HOST}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&status=1H-2H-HT-ET-P`
  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.response ?? []
}

export async function syncResults(): Promise<{ finished: number; live: number }> {
  // Match Firestore docs by apiId field
  const matchesSnap = await db.collection('matches').get()
  const apiIdToDocId: Record<string, string> = {}
  matchesSnap.docs.forEach(d => {
    if (d.data().apiId) apiIdToDocId[d.data().apiId] = d.id
  })

  const [finished, live] = await Promise.all([fetchFinishedMatches(), fetchLiveMatches()])

  const batch = db.batch()

  for (const f of finished) {
    const apiId = String(f.fixture.id)
    const docId = apiIdToDocId[apiId]
    if (!docId) continue
    batch.update(db.collection('matches').doc(docId), {
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      status: 'finished',
    })
  }

  for (const f of live) {
    const apiId = String(f.fixture.id)
    const docId = apiIdToDocId[apiId]
    if (!docId) continue
    batch.update(db.collection('matches').doc(docId), {
      homeScore: f.goals.home ?? null,
      awayScore: f.goals.away ?? null,
      status: 'live',
    })
  }

  await batch.commit()
  await db.collection('config').doc('settings').set(
    { lastSync: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )

  return { finished: finished.length, live: live.length }
}

// Runs every hour — only active during Copa (June 11 – July 19, 2026)
export const scheduledSync = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async () => {
    const result = await syncResults()
    console.log(`Sync complete: ${result.finished} finished, ${result.live} live`)
    return null
  })
