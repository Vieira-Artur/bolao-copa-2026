import { useState } from 'react'
import { ScoreInput } from './ScoreInput'
import { saveMatchPrediction } from '../../lib/firestore'
import type { Match, MatchPrediction } from '../../types'
import { PHASE_LABELS } from '../../types/copa2026'

interface Props {
  participantId: string
  matches: Match[]
  existing: Record<string, MatchPrediction>
}

export function KnockoutForm({ participantId, matches, existing }: Props) {
  const [localPreds, setLocalPreds] = useState<
    Record<string, { home?: number; away?: number; penalty?: string }>
  >(() =>
    Object.fromEntries(
      Object.entries(existing).map(([id, p]) => [
        id,
        { home: p.homeScore, away: p.awayScore, penalty: p.penaltyWinner },
      ])
    )
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const phases = ['r32', 'r16', 'qf', 'sf', '3rd', 'final'] as const

  async function handleSave(match: Match) {
    const pred = localPreds[match.id]
    if (pred?.home === undefined || pred?.away === undefined) return
    setSaving(match.id)
    await saveMatchPrediction(participantId, match.id, {
      homeScore: pred.home,
      awayScore: pred.away,
      penaltyWinner: pred.penalty,
    })
    setSaving(null)
    setSaved(s => ({ ...s, [match.id]: true }))
  }

  const knockoutMatches = matches.filter(m => phases.includes(m.phase as any))

  if (knockoutMatches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Os jogos do mata-mata serão liberados conforme os times forem classificados.
        <br />
        <span className="text-sm">Volte após o encerramento da fase de grupos (27/06).</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {phases.map(phase => {
        const phaseMatches = knockoutMatches.filter(m => m.phase === phase)
        if (phaseMatches.length === 0) return null

        return (
          <div key={phase}>
            <h3 className="font-bold text-green-900 mb-3">{PHASE_LABELS[phase]}</h3>
            <div className="space-y-3">
              {phaseMatches.map(match => {
                const locked = new Date() >= match.deadline
                const pred = localPreds[match.id] ?? {}
                const tbd = !match.homeTeam || !match.awayTeam

                if (tbd) {
                  return (
                    <div
                      key={match.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-400"
                    >
                      Jogo ainda não definido — aguarde a classificação
                    </div>
                  )
                }

                return (
                  <div key={match.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                    <ScoreInput
                      homeTeam={match.homeTeam}
                      awayTeam={match.awayTeam}
                      homeScore={pred.home}
                      awayScore={pred.away}
                      locked={locked}
                      onChange={v => {
                        setLocalPreds(p => ({ ...p, [match.id]: { ...pred, ...v } }))
                        setSaved(s => ({ ...s, [match.id]: false }))
                      }}
                    />

                    {/* Penalty winner field — mandatory for knockout */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Pênaltis — quem passa (obrigatório):
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {[match.homeTeam, match.awayTeam, 'Sem prorrogação'].map(opt => (
                          <button
                            key={opt}
                            disabled={locked}
                            onClick={() => {
                              setLocalPreds(p => ({
                                ...p,
                                [match.id]: { ...pred, penalty: opt },
                              }))
                              setSaved(s => ({ ...s, [match.id]: false }))
                            }}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                              pred.penalty === opt
                                ? 'bg-green-700 text-white border-green-700'
                                : 'border-gray-300 text-gray-600 hover:border-green-400'
                            } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!locked && (
                      <div className="mt-2 flex justify-end items-center gap-2">
                        {saved[match.id] && (
                          <span className="text-xs text-green-600">Salvo!</span>
                        )}
                        <button
                          onClick={() => handleSave(match)}
                          disabled={saving === match.id}
                          className="text-xs bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 disabled:opacity-50"
                        >
                          {saving === match.id ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
