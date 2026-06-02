import { describe, it, expect } from 'vitest'
import type { Match, Participant, Prediction, Score } from '../index'

describe('Types', () => {
  it('Match has required fields', () => {
    const match: Match = {
      id: 'm1',
      phase: 'groups',
      group: 'A',
      homeTeam: 'Brasil',
      awayTeam: 'Croácia',
      homeScore: null,
      awayScore: null,
      kickoff: new Date('2026-06-12T18:00:00-03:00'),
      status: 'scheduled',
      deadline: new Date('2026-06-11T23:59:00-03:00'),
      apiId: '12345',
    }
    expect(match.phase).toBe('groups')
  })
})
