type Phase = 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'
type MatchResult = 'home' | 'away' | 'draw'

interface ScoreInput { h: number; a: number }

function calcMatchResult(home: number, away: number): MatchResult {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

const GROUP_POINTS = [8, 6, 5, 4]
const DECISIVE_POINTS: Record<string, number[]> = {
  r32: [16, 12, 10, 8], r16: [16, 12, 10, 8], final: [16, 12, 10, 8],
  qf: [16, 12, 9, 6], sf: [16, 12, 9, 6], '3rd': [16, 12, 9, 6],
}
const DRAW_BASE = [8, 0, 5, 4]

export function calcMatchPoints(prediction: ScoreInput, real: ScoreInput, phase: Phase): number {
  const predResult = calcMatchResult(prediction.h, prediction.a)
  const realResult = calcMatchResult(real.h, real.a)
  if (predResult !== realResult) return 0

  if (prediction.h === real.h && prediction.a === real.a) {
    return phase === 'groups' ? GROUP_POINTS[0] : (DECISIVE_POINTS[phase]?.[0] ?? 16)
  }

  if (realResult === 'draw') {
    if (prediction.h === real.h || prediction.a === real.a) {
      return phase === 'groups' ? DRAW_BASE[2] : (DECISIVE_POINTS[phase]?.[2] ?? 10)
    }
    return phase === 'groups' ? DRAW_BASE[3] : (DECISIVE_POINTS[phase]?.[3] ?? 8)
  }

  const predDiff = prediction.h - prediction.a
  const realDiff = real.h - real.a
  if (predDiff === realDiff) {
    return phase === 'groups' ? GROUP_POINTS[1] : (DECISIVE_POINTS[phase]?.[1] ?? 12)
  }
  if (prediction.h === real.h || prediction.a === real.a) {
    return phase === 'groups' ? GROUP_POINTS[2] : (DECISIVE_POINTS[phase]?.[2] ?? 9)
  }
  return phase === 'groups' ? GROUP_POINTS[3] : (DECISIVE_POINTS[phase]?.[3] ?? 6)
}

export function getScoreType(prediction: ScoreInput, real: ScoreInput, phase: Phase): string {
  const predResult = calcMatchResult(prediction.h, prediction.a)
  const realResult = calcMatchResult(real.h, real.a)
  if (predResult !== realResult) return 'miss'
  if (prediction.h === real.h && prediction.a === real.a) return 'exact'
  if (realResult !== 'draw' && real.h - real.a === prediction.h - prediction.a) return 'goalDiff'
  if (prediction.h === real.h || prediction.a === real.a) return 'oneScore'
  return 'result'
}

export function calcClassificationPoints(pred: Record<string, unknown>, real: Record<string, unknown>): number {
  let pts = 0
  const groupsFirst = (real.groupsFirst ?? {}) as Record<string, string>
  const groupsSecond = (real.groupsSecond ?? {}) as Record<string, string>
  const predFirst = (pred.groupsFirst ?? {}) as Record<string, string>
  const predSecond = (pred.groupsSecond ?? {}) as Record<string, string>

  for (const g of Object.keys(groupsFirst)) {
    const rF = groupsFirst[g], rS = groupsSecond[g]
    const pF = predFirst[g], pS = predSecond[g]
    if (pF === rF) pts += 10; else if (pF === rS) pts += 5
    if (pS === rS) pts += 10; else if (pS === rF) pts += 5
  }

  for (const t of ((pred.qf ?? []) as string[])) if (((real.qf ?? []) as string[]).includes(t)) pts += 10
  for (const t of ((pred.sf ?? []) as string[])) if (((real.sf ?? []) as string[]).includes(t)) pts += 15
  for (const t of ((pred.final ?? []) as string[])) if (((real.final ?? []) as string[]).includes(t)) pts += 20

  if (pred.fourth && pred.fourth === real.fourth) pts += 10
  if (pred.third && pred.third === real.third) pts += 20
  if (pred.vice && pred.vice === real.vice) pts += 30
  if (pred.champion && pred.champion === real.champion) pts += 40
  return pts
}
