import type { Match, MatchPrediction } from '../../types'
import { PHASE_LABELS } from '../../types/copa2026'
import { calcMatchPoints, getScoreType } from '../../lib/scoring'

interface Props {
  matches: Match[]
  predictions: Record<string, MatchPrediction>
}

const TYPE_LABELS: Record<string, string> = {
  exact: 'Placar exato',
  goalDiff: 'Diferença certa',
  oneScore: 'Um escore certo',
  result: 'Resultado certo',
  miss: 'Errou',
}

export function PalpitesTab({ matches, predictions }: Props) {
  const phases = [...new Set(matches.map(m => m.phase))]

  function renderMatch(m: Match) {
    const pred = predictions[m.id]
    const hasPred = pred !== undefined
    const hasResult = m.homeScore !== null && m.awayScore !== null

    let pts: number | null = null
    let typeLabel: string | null = null

    if (hasPred && hasResult) {
      pts = calcMatchPoints(
        { h: pred.homeScore, a: pred.awayScore },
        { h: m.homeScore!, a: m.awayScore! },
        m.phase
      )
      const type = getScoreType(
        { h: pred.homeScore, a: pred.awayScore },
        { h: m.homeScore!, a: m.awayScore! },
        m.phase
      )
      typeLabel = TYPE_LABELS[type]
    }

    return (
      <div
        key={m.id}
        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm gap-2"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-right flex-1 truncate font-medium text-xs sm:text-sm">{m.homeTeam}</span>
          <span className="text-center w-14 shrink-0 text-gray-400 text-xs">
            {hasResult ? (
              <span className="font-bold text-gray-800">{m.homeScore}–{m.awayScore}</span>
            ) : '–'}
          </span>
          <span className="text-left flex-1 truncate font-medium text-xs sm:text-sm">{m.awayTeam}</span>
        </div>
        <div className="text-right shrink-0 w-24">
          {hasPred ? (
            <div>
              <span className="text-gray-500 text-xs">{pred.homeScore}–{pred.awayScore}</span>
              {pts !== null && (
                <span className={`ml-1 font-bold text-xs ${pts > 0 ? 'text-green-700' : 'text-red-400'}`}>
                  {pts > 0 ? `+${pts}` : '0'}
                </span>
              )}
              {typeLabel && pts !== null && pts > 0 && (
                <div className="text-xs text-gray-400 leading-tight">{typeLabel}</div>
              )}
            </div>
          ) : (
            <span className="text-gray-300 text-xs">Sem palpite</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {phases.map(phase => {
        const phaseMatches = matches.filter(m => m.phase === phase)
        // For groups phase, organize by group
        if (phase === 'groups') {
          const groups = [...new Set(phaseMatches.map(m => m.group).filter(Boolean))].sort() as string[]
          return (
            <div key={phase}>
              {groups.map(g => (
                <div key={g} className="mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Grupo {g}</h4>
                  <div className="bg-white border border-gray-200 rounded-lg px-3">
                    {phaseMatches.filter(m => m.group === g).map(renderMatch)}
                  </div>
                </div>
              ))}
            </div>
          )
        }
        return (
          <div key={phase}>
            <h3 className="font-bold text-green-900 mb-2">{PHASE_LABELS[phase]}</h3>
            <div className="bg-white border border-gray-200 rounded-lg px-3">
              {phaseMatches.map(renderMatch)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
