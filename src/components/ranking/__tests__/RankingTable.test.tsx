import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RankingTable } from '../RankingTable'
import type { Score } from '../../../types'
import { describe, it, expect, afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

const mockScores: Score[] = [
  {
    participantId: 'p1',
    participantName: 'João',
    total: 120,
    matchPoints: 100,
    classificationPoints: 15,
    artilheiroPoints: 0,
    exactScores: 8,
    correctResults: 20,
    tiebreaker: { champion: true, artilheiro: false, vice: false, third: false, exactCount: 8 },
    matchBreakdown: {},
    lastUpdated: new Date(),
  },
  {
    participantId: 'p2',
    participantName: 'Maria',
    total: 95,
    matchPoints: 80,
    classificationPoints: 15,
    artilheiroPoints: 0,
    exactScores: 5,
    correctResults: 16,
    tiebreaker: { champion: false, artilheiro: false, vice: false, third: false, exactCount: 5 },
    matchBreakdown: {},
    lastUpdated: new Date(),
  },
]

describe('RankingTable', () => {
  it('renders participant names and totals', () => {
    render(<MemoryRouter><RankingTable scores={mockScores} /></MemoryRouter>)
    expect(screen.getByText('João')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Maria')).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()
  })

  it('shows position numbers', () => {
    render(<MemoryRouter><RankingTable scores={mockScores} /></MemoryRouter>)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders empty state when no scores', () => {
    render(<MemoryRouter><RankingTable scores={[]} /></MemoryRouter>)
    expect(screen.getByText(/nenhum participante/i)).toBeInTheDocument()
  })

  it('links participant names to their pages', () => {
    render(<MemoryRouter><RankingTable scores={mockScores} /></MemoryRouter>)
    const joaoLink = screen.getByRole('link', { name: 'João' })
    expect(joaoLink).toHaveAttribute('href', '/participante/Jo%C3%A3o')
  })
})
