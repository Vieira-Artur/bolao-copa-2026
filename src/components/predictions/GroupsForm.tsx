import { useState } from 'react'
import { ScoreInput } from './ScoreInput'
import { saveMatchPrediction } from '../../lib/firestore'
import type { Match, MatchPrediction } from '../../types'

interface Props {
  participantId: string
  matches: Match[]
  existing: Record<string, MatchPrediction>
  deadline: Date
}

export function GroupsForm({ participantId, matches, existing, deadline }: Props) {
  const locked = new Date() >= deadline

  const [localPreds, setLocalPreds] = useState<
    Record<string, { home?: number; away?: number }>
  >(() =>
    Object.fromEntries(
      Object.entries(existing).map(([id, p]) => [
        id,
        { home: p.homeScore, away: p.awayScore },
      ])
    )
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const groups = [...new Set(matches.map(m => m.group).filter(Boolean))].sort() as string[]

  async function handleSave(match: Match) {
    const pred = localPreds[match.id]
    if (pred?.home === undefined || pred?.away === undefined) return
    setSaving(match.id)
    await saveMatchPrediction(participantId, match.id, {
      homeScore: pred.home,
      awayScore: pred.away,
    })
    setSaving(null)
    setSaved(s => ({ ...s, [match.id]: true }))
  }

  return (
    <div className="space-y-6">
      {locked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          Prazo encerrado — palpites da fase de grupos bloqueados.
        </div>
      )}
      {groups.map(group => (
        <div key={group}>
          <h3 className="font-bold text-green-900 mb-3">Grupo {group}</h3>
          <div className="space-y-3">
            {matches
              .filter(m => m.group === group)
              .map(match => (
                <div
                  key={match.id}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                >
                  <ScoreInput
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                    homeScore={localPreds[match.id]?.home}
                    awayScore={localPreds[match.id]?.away}
                    locked={locked}
                    onChange={v => {
                      setLocalPreds(p => ({ ...p, [match.id]: v }))
                      setSaved(s => ({ ...s, [match.id]: false }))
                    }}
                  />
                  {!locked && (
                    <div className="mt-2 flex justify-end gap-2 items-center">
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
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
