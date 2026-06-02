import type { Phase, ScoreType } from '../types'

type Score = { h: number; a: number }
type MatchResult = 'home' | 'away' | 'draw'

export function calcMatchResult(homeScore: number, awayScore: number): MatchResult {
  if (homeScore > awayScore) return 'home'
  if (awayScore > homeScore) return 'away'
  return 'draw'
}

/**
 * Points table for decisive (home/away) results per phase.
 * [exact, goalDiff, oneScore, result]
 *
 * Draws in knockout phases always use ×2 multiplier (groups base × 2),
 * because there is only one draw outcome and goal-diff never applies to draws.
 */
const DECISIVE_POINTS: Record<Phase, readonly [number, number, number, number]> = {
  groups: [8,  6,  5, 4],
  r32:    [16, 12, 10, 8],
  r16:    [16, 12, 10, 8],
  qf:     [16, 12,  9, 6],
  sf:     [16, 12,  9, 6],
  '3rd':  [16, 12,  9, 6],
  final:  [16, 12, 10, 8],
}

/** Base groups points for draws (always ×2 in knockout phases). */
const DRAW_BASE: readonly [number, number, number, number] = [8, 0, 5, 4]
// goalDiff (index 1) is 0 because it never applies to draws

function isKnockout(phase: Phase): boolean {
  return phase !== 'groups'
}

export function calcMatchPoints(
  prediction: Score,
  real: Score,
  phase: Phase
): number {
  const predResult = calcMatchResult(prediction.h, prediction.a)
  const realResult = calcMatchResult(real.h, real.a)

  if (predResult !== realResult) return 0

  const isDraw = realResult === 'draw'
  const multiplier = isDraw && isKnockout(phase) ? 2 : 1

  if (isDraw) {
    // Goal-diff tier never applies to draws
    if (prediction.h === real.h && prediction.a === real.a) return DRAW_BASE[0] * multiplier
    if (prediction.h === real.h || prediction.a === real.a) return DRAW_BASE[2] * multiplier
    return DRAW_BASE[3] * multiplier
  }

  // Decisive result
  const [exact, goalDiff, oneScore, result] = DECISIVE_POINTS[phase]

  if (prediction.h === real.h && prediction.a === real.a) return exact

  // Goal-diff tier only applies when the margin is strictly greater than 1
  const realDiff = Math.abs(real.h - real.a)
  const predDiff = real.h - real.a === prediction.h - prediction.a
  if (predDiff && realDiff > 1) return goalDiff

  if (prediction.h === real.h || prediction.a === real.a) return oneScore
  return result
}

export interface ClassificationReal {
  groupsFirst?: Record<string, string>
  groupsSecond?: Record<string, string>
  qf?: string[]
  sf?: string[]
  final?: string[]
  champion?: string
  vice?: string
  third?: string
  fourth?: string
}

export function calcClassificationPoints(
  pred: ClassificationReal,
  real: ClassificationReal
): number {
  let pts = 0

  const groups = Object.keys(real.groupsFirst ?? {})
  for (const g of groups) {
    const realFirst = real.groupsFirst![g]
    const realSecond = real.groupsSecond![g]
    const predFirst = pred.groupsFirst?.[g]
    const predSecond = pred.groupsSecond?.[g]

    if (predFirst === realFirst) pts += 10
    else if (predFirst === realSecond) pts += 5

    if (predSecond === realSecond) pts += 10
    else if (predSecond === realFirst) pts += 5
  }

  for (const team of (pred.qf ?? [])) {
    if ((real.qf ?? []).includes(team)) pts += 10
  }
  for (const team of (pred.sf ?? [])) {
    if ((real.sf ?? []).includes(team)) pts += 15
  }
  for (const team of (pred.final ?? [])) {
    if ((real.final ?? []).includes(team)) pts += 20
  }

  if (pred.fourth && pred.fourth === real.fourth) pts += 10
  if (pred.third && pred.third === real.third) pts += 20
  if (pred.vice && pred.vice === real.vice) pts += 30
  if (pred.champion && pred.champion === real.champion) pts += 40

  return pts
}

export function calcArtilheiroPoints(
  predPlayer: string | undefined,
  realPlayer: string | null | undefined
): number {
  if (!predPlayer || !realPlayer) return 0
  return predPlayer.trim().toLowerCase() === realPlayer.trim().toLowerCase() ? 25 : 0
}

export function getScoreType(
  prediction: Score,
  real: Score,
  phase: Phase
): ScoreType {
  const predResult = calcMatchResult(prediction.h, prediction.a)
  const realResult = calcMatchResult(real.h, real.a)

  if (predResult !== realResult) return 'miss'
  if (prediction.h === real.h && prediction.a === real.a) return 'exact'

  // Goal-diff tier never applies to draws, and only when margin > 1
  if (
    realResult !== 'draw' &&
    real.h - real.a === prediction.h - prediction.a &&
    Math.abs(real.h - real.a) > 1
  ) return 'goalDiff'

  if (prediction.h === real.h || prediction.a === real.a) return 'oneScore'
  return 'result'
}
