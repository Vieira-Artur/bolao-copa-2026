import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { calcMatchPoints, getScoreType } from './scoring'

const db = admin.firestore()

export const onMatchFinished = functions.firestore
  .document('matches/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()

    if (before.status === after.status) return null
    if (after.status !== 'finished') return null
    if (after.homeScore === null || after.awayScore === null) return null

    const matchId = context.params.matchId
    const real = { h: after.homeScore as number, a: after.awayScore as number }
    const phase = after.phase as string

    const participantsSnap = await db.collection('participants').get()

    await Promise.all(
      participantsSnap.docs.map(async pDoc => {
        const participantId = pDoc.id
        const participantName = pDoc.data().name as string

        const predSnap = await db
          .collection('predictions')
          .doc(participantId)
          .collection('matches')
          .doc(matchId)
          .get()

        if (!predSnap.exists) return

        const pred = predSnap.data()!
        const prediction = { h: pred.homeScore as number, a: pred.awayScore as number }
        const points = calcMatchPoints(prediction, real, phase as any)
        const type = getScoreType(prediction, real, phase as any)

        const scoreRef = db.collection('scores').doc(participantId)

        await db.runTransaction(async tx => {
          const scoreSnap = await tx.get(scoreRef)
          const existing = scoreSnap.exists
            ? scoreSnap.data()!
            : {
                participantId,
                participantName,
                total: 0,
                matchPoints: 0,
                classificationPoints: 0,
                artilheiroPoints: 0,
                exactScores: 0,
                correctResults: 0,
                tiebreaker: { champion: false, artilheiro: false, vice: false, third: false, exactCount: 0 },
                matchBreakdown: {},
              }

          const prevBreakdown = existing.matchBreakdown?.[matchId] as { points: number; type: string } | undefined
          const prevPoints = prevBreakdown?.points ?? 0

          const exactDelta = (type === 'exact' ? 1 : 0) - (prevBreakdown?.type === 'exact' ? 1 : 0)
          const resultDelta =
            (type !== 'miss' ? 1 : 0) - (prevBreakdown && prevBreakdown.type !== 'miss' ? 1 : 0)

          tx.set(scoreRef, {
            ...existing,
            participantName,
            matchPoints: (existing.matchPoints ?? 0) + points - prevPoints,
            total: (existing.total ?? 0) + points - prevPoints,
            exactScores: (existing.exactScores ?? 0) + exactDelta,
            correctResults: (existing.correctResults ?? 0) + resultDelta,
            matchBreakdown: {
              ...(existing.matchBreakdown ?? {}),
              [matchId]: { points, type },
            },
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          })
        })
      })
    )

    console.log(`Scores recalculated for match ${matchId}`)
    return null
  })
