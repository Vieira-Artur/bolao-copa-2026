import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ScoreInput } from '../ScoreInput'
import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

describe('ScoreInput', () => {
  it('renders home and away inputs with team name labels', () => {
    render(<ScoreInput homeTeam="Brasil" awayTeam="Croácia" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Brasil')).toBeInTheDocument()
    expect(screen.getByLabelText('Croácia')).toBeInTheDocument()
  })

  it('calls onChange with home value when home input changes', () => {
    const onChange = vi.fn()
    render(<ScoreInput homeTeam="Brasil" awayTeam="Croácia" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Brasil'), { target: { value: '2' } })
    expect(onChange).toHaveBeenCalledWith({ home: 2, away: undefined })
  })

  it('calls onChange with away value when away input changes', () => {
    const onChange = vi.fn()
    render(<ScoreInput homeTeam="Brasil" awayTeam="Croácia" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Croácia'), { target: { value: '1' } })
    expect(onChange).toHaveBeenCalledWith({ home: undefined, away: 1 })
  })

  it('disables both inputs when locked=true', () => {
    render(<ScoreInput homeTeam="Brasil" awayTeam="Croácia" onChange={vi.fn()} locked />)
    expect(screen.getByLabelText('Brasil')).toBeDisabled()
    expect(screen.getByLabelText('Croácia')).toBeDisabled()
  })

  it('shows existing scores as input values', () => {
    render(
      <ScoreInput homeTeam="Brasil" awayTeam="Croácia" homeScore={2} awayScore={1} onChange={vi.fn()} />
    )
    expect(screen.getByLabelText('Brasil')).toHaveValue(2)
    expect(screen.getByLabelText('Croácia')).toHaveValue(1)
  })

  it('clears value (undefined) when input is emptied', () => {
    const onChange = vi.fn()
    render(<ScoreInput homeTeam="Brasil" awayTeam="Croácia" homeScore={2} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Brasil'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith({ home: undefined, away: undefined })
  })
})
