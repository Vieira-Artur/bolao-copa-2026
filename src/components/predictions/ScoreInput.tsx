interface Props {
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  locked?: boolean
  onChange: (value: { home?: number; away?: number }) => void
}

export function ScoreInput({ homeTeam, awayTeam, homeScore, awayScore, locked, onChange }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label htmlFor={`score-home-${homeTeam}`} className="sr-only">{homeTeam}</label>
      <span style={{
        flex: 1,
        textAlign: 'right',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '0.88rem',
        color: 'var(--text)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {homeTeam}
      </span>

      <input
        id={`score-home-${homeTeam}`}
        aria-label={homeTeam}
        type="number"
        min={0}
        max={20}
        value={homeScore ?? ''}
        disabled={locked}
        className="score-input"
        onChange={e => {
          const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
          onChange({ home: v, away: awayScore })
        }}
      />

      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '1rem',
        color: 'var(--text-faint)',
      }}>×</span>

      <input
        id={`score-away-${awayTeam}`}
        aria-label={awayTeam}
        type="number"
        min={0}
        max={20}
        value={awayScore ?? ''}
        disabled={locked}
        className="score-input"
        onChange={e => {
          const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
          onChange({ home: homeScore, away: v })
        }}
      />

      <label htmlFor={`score-away-${awayTeam}`} className="sr-only">{awayTeam}</label>
      <span style={{
        flex: 1,
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '0.88rem',
        color: 'var(--text)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {awayTeam}
      </span>
    </div>
  )
}
