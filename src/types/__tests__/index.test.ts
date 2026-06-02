import { describe, it, expect } from 'vitest'
import { PHASE_LABELS, PHASES_KNOCKOUT, GROUP_DEADLINE, COPA_START_DATE } from '../copa2026'
import type { Phase } from '../index'

const ALL_PHASES: Phase[] = ['groups', 'r32', 'r16', 'qf', 'sf', '3rd', 'final']

describe('copa2026 constants', () => {
  it('PHASE_LABELS has an entry for every Phase', () => {
    for (const phase of ALL_PHASES) {
      expect(PHASE_LABELS[phase], `Missing label for phase: ${phase}`).toBeTruthy()
    }
  })

  it('PHASES_KNOCKOUT contains all non-group phases', () => {
    expect(PHASES_KNOCKOUT).toHaveLength(6)
    expect(PHASES_KNOCKOUT).not.toContain('groups')
  })

  it('GROUP_DEADLINE is before COPA_START_DATE', () => {
    expect(GROUP_DEADLINE.getTime()).toBeLessThan(COPA_START_DATE.getTime())
  })
})
