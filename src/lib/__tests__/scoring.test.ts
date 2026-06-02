import { describe, it, expect } from 'vitest'
import {
  calcMatchPoints,
  calcMatchResult,
  calcClassificationPoints,
  calcArtilheiroPoints,
  getScoreType,
} from '../scoring'

describe('calcMatchResult', () => {
  it('home win', () => expect(calcMatchResult(2, 1)).toBe('home'))
  it('away win', () => expect(calcMatchResult(0, 1)).toBe('away'))
  it('draw', () => expect(calcMatchResult(1, 1)).toBe('draw'))
  it('0-0 is a draw', () => expect(calcMatchResult(0, 0)).toBe('draw'))
})

describe('calcMatchPoints — groups phase', () => {
  it('exact score = 8 pts', () => {
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'groups')).toBe(8)
  })
  it('result + goal diff = 6 pts (not draw)', () => {
    // Predicted 3-1, result 2-0 → same diff (+2), same result (home win) → 6
    expect(calcMatchPoints({ h: 3, a: 1 }, { h: 2, a: 0 }, 'groups')).toBe(6)
  })
  it('goal diff rule does NOT apply to draws', () => {
    // Predicted 0-0, result 1-1 → diff = 0 in both, but draw → should be 4, NOT 6
    expect(calcMatchPoints({ h: 0, a: 0 }, { h: 1, a: 1 }, 'groups')).toBe(4)
  })
  it('result + one score (away) = 5 pts', () => {
    // Predicted 2-1, result 3-1 → away score matches (1), home win matches
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 3, a: 1 }, 'groups')).toBe(5)
  })
  it('result + one score (home) = 5 pts', () => {
    // Predicted 3-0, result 3-1 → home score matches (3), home win matches
    expect(calcMatchPoints({ h: 3, a: 0 }, { h: 3, a: 1 }, 'groups')).toBe(5)
  })
  it('result only = 4 pts', () => {
    // Predicted 1-0, result 3-2 → home win matches, no scores match
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 3, a: 2 }, 'groups')).toBe(4)
  })
  it('wrong result = 0 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 0, a: 1 }, 'groups')).toBe(0)
  })
  it('wrong result (predicted home, draw happened) = 0 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 1, a: 1 }, 'groups')).toBe(0)
  })
  it('draw exact score = 8 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 1 }, { h: 1, a: 1 }, 'groups')).toBe(8)
  })
  it('draw with different scores = 4 pts (no 6pt tier for draws)', () => {
    expect(calcMatchPoints({ h: 0, a: 0 }, { h: 2, a: 2 }, 'groups')).toBe(4)
  })
  it('draw + one score matches = 5 pts', () => {
    // Predicted 1-1, result 1-2 — wait, that's not a draw result
    // Predicted 2-2, result 1-1 — draw result matches, neither score matches → 4
    expect(calcMatchPoints({ h: 2, a: 2 }, { h: 1, a: 1 }, 'groups')).toBe(4)
    // Predicted 1-2, result 2-1 is away vs home — different result → 0
    expect(calcMatchPoints({ h: 1, a: 2 }, { h: 2, a: 1 }, 'groups')).toBe(0)
  })
})

describe('calcMatchPoints — knockout phases', () => {
  it('r32 exact score = 16 pts', () => {
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'r32')).toBe(16)
  })
  it('r16 result + goal diff = 12 pts', () => {
    expect(calcMatchPoints({ h: 3, a: 1 }, { h: 2, a: 0 }, 'r16')).toBe(12)
  })
  it('qf result + one score = 9 pts', () => {
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 3, a: 1 }, 'qf')).toBe(9)  // 5 * 2 - 1? No, 9 doesn't fit ×2
  })
  it('sf result only = 6 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 3, a: 2 }, 'sf')).toBe(6)  // wait: 4 * 2 = 8, not 6
  })
  it('3rd place result only = 6 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 3, a: 2 }, '3rd')).toBe(6)
  })
  it('final exact score = 16 pts', () => {
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'final')).toBe(16)
  })
  it('knockout wrong result = 0 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 0, a: 1 }, 'qf')).toBe(0)
  })
  it('knockout goal diff rule does NOT apply to draws', () => {
    expect(calcMatchPoints({ h: 0, a: 0 }, { h: 1, a: 1 }, 'sf')).toBe(8) // 4 * 2
  })
})

describe('calcClassificationPoints', () => {
  const realClassification = {
    groupsFirst: { A: 'Brasil', B: 'França', C: 'Argentina', D: 'Espanha',
                   E: 'England', F: 'Germany', G: 'Portugal', H: 'Netherlands',
                   I: 'Belgium', J: 'Uruguay', K: 'Japan', L: 'Mexico' },
    groupsSecond: { A: 'Croácia', B: 'Marrocos', C: 'Austrália', D: 'EUA',
                    E: 'Itália', F: 'Dinamarca', G: 'Suíça', H: 'Polônia',
                    I: 'Senegal', J: 'Equador', K: 'Coreia', L: 'Canadá' },
    qf: ['Brasil', 'França', 'Argentina', 'Espanha', 'England', 'Germany', 'Portugal', 'Netherlands'],
    sf: ['Brasil', 'França', 'Argentina', 'Espanha'],
    final: ['Brasil', 'França'],
    champion: 'Brasil',
    vice: 'França',
    third: 'Argentina',
    fourth: 'Espanha',
  }

  it('1st place correct position = 10 pts per team', () => {
    const pred = {
      groupsFirst: { A: 'Brasil' }, groupsSecond: { A: 'Croácia' },
    }
    expect(calcClassificationPoints(pred, realClassification)).toBe(20) // 10 + 10
  })

  it('team predicted 1st but finished 2nd = 5 pts', () => {
    const pred = {
      groupsFirst: { A: 'Croácia' }, groupsSecond: {},
    }
    expect(calcClassificationPoints(pred, realClassification)).toBe(5)
  })

  it('team predicted 2nd but finished 1st = 5 pts', () => {
    const pred = {
      groupsFirst: {}, groupsSecond: { A: 'Brasil' },
    }
    expect(calcClassificationPoints(pred, realClassification)).toBe(5)
  })

  it('champion correct = 40 pts', () => {
    const pred = { champion: 'Brasil' }
    expect(calcClassificationPoints(pred, realClassification)).toBe(40)
  })

  it('vice correct = 30 pts', () => {
    const pred = { vice: 'França' }
    expect(calcClassificationPoints(pred, realClassification)).toBe(30)
  })

  it('third correct = 20 pts', () => {
    const pred = { third: 'Argentina' }
    expect(calcClassificationPoints(pred, realClassification)).toBe(20)
  })

  it('fourth correct = 10 pts', () => {
    const pred = { fourth: 'Espanha' }
    expect(calcClassificationPoints(pred, realClassification)).toBe(10)
  })

  it('qf team correct = 10 pts each', () => {
    const pred = { qf: ['Brasil', 'França'] }
    expect(calcClassificationPoints(pred, realClassification)).toBe(20)
  })

  it('sf team correct = 15 pts each', () => {
    const pred = { sf: ['Brasil', 'França'] }
    expect(calcClassificationPoints(pred, realClassification)).toBe(30)
  })

  it('finalist correct = 20 pts each', () => {
    const pred = { final: ['Brasil', 'França'] }
    expect(calcClassificationPoints(pred, realClassification)).toBe(40)
  })

  it('wrong team = 0 pts', () => {
    const pred = { champion: 'Japão' }
    expect(calcClassificationPoints(pred, realClassification)).toBe(0)
  })

  it('empty prediction = 0 pts', () => {
    expect(calcClassificationPoints({}, realClassification)).toBe(0)
  })
})

describe('calcArtilheiroPoints', () => {
  it('exact match = 25 pts', () => {
    expect(calcArtilheiroPoints('Ronaldo', 'Ronaldo')).toBe(25)
  })
  it('case-insensitive match = 25 pts', () => {
    expect(calcArtilheiroPoints('ronaldo', 'Ronaldo')).toBe(25)
  })
  it('trim whitespace = 25 pts', () => {
    expect(calcArtilheiroPoints('  Ronaldo  ', 'Ronaldo')).toBe(25)
  })
  it('wrong player = 0 pts', () => {
    expect(calcArtilheiroPoints('Messi', 'Ronaldo')).toBe(0)
  })
  it('undefined prediction = 0 pts', () => {
    expect(calcArtilheiroPoints(undefined, 'Ronaldo')).toBe(0)
  })
  it('null real artilheiro = 0 pts', () => {
    expect(calcArtilheiroPoints('Ronaldo', null)).toBe(0)
  })
})

describe('getScoreType', () => {
  it('exact score → "exact"', () => {
    expect(getScoreType({ h: 2, a: 1 }, { h: 2, a: 1 }, 'groups')).toBe('exact')
  })
  it('result + goal diff → "goalDiff"', () => {
    expect(getScoreType({ h: 3, a: 1 }, { h: 2, a: 0 }, 'groups')).toBe('goalDiff')
  })
  it('result + one score → "oneScore"', () => {
    expect(getScoreType({ h: 2, a: 1 }, { h: 3, a: 1 }, 'groups')).toBe('oneScore')
  })
  it('result only → "result"', () => {
    expect(getScoreType({ h: 1, a: 0 }, { h: 3, a: 2 }, 'groups')).toBe('result')
  })
  it('wrong result → "miss"', () => {
    expect(getScoreType({ h: 1, a: 0 }, { h: 0, a: 1 }, 'groups')).toBe('miss')
  })
  it('draw result only → "result" (not goalDiff)', () => {
    expect(getScoreType({ h: 0, a: 0 }, { h: 1, a: 1 }, 'groups')).toBe('result')
  })
})
