interface Props {
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  locked?: boolean
  onChange: (value: { home?: number; away?: number }) => void
}

export function ScoreInput({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  locked,
  onChange,
}: Props) {
  const inputClass = `w-12 h-10 text-center text-lg font-bold border-2 rounded-lg ${
    locked
      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
      : 'border-green-300 focus:border-green-500 focus:outline-none'
  }`

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-right flex-1 truncate">{homeTeam}</span>
      <label htmlFor={`score-home-${homeTeam}`} className="sr-only">
        {homeTeam}
      </label>
      <input
        id={`score-home-${homeTeam}`}
        type="number"
        min={0}
        max={20}
        value={homeScore ?? ''}
        disabled={locked}
        className={inputClass}
        onChange={e => {
          const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
          onChange({ home: v, away: awayScore })
        }}
      />
      <span className="text-gray-400 font-bold">×</span>
      <label htmlFor={`score-away-${awayTeam}`} className="sr-only">
        {awayTeam}
      </label>
      <input
        id={`score-away-${awayTeam}`}
        type="number"
        min={0}
        max={20}
        value={awayScore ?? ''}
        disabled={locked}
        className={inputClass}
        onChange={e => {
          const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
          onChange({ home: homeScore, away: v })
        }}
      />
      <span className="text-sm font-medium text-left flex-1 truncate">{awayTeam}</span>
    </div>
  )
}
