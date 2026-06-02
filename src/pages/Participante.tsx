import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useParticipantByName } from '../hooks/useParticipant'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useRanking } from '../hooks/useRanking'
import { PalpitesTab } from '../components/participant/PalpitesTab'
import { DesempenhoTab } from '../components/participant/DesempenhoTab'

export function Participante() {
  const { nome } = useParams<{ nome: string }>()
  const { participant, loading } = useParticipantByName(nome)
  const { matches } = useMatches()
  const { predictions } = usePredictions(participant?.id)
  const { scores } = useRanking()
  const [tab, setTab] = useState<'palpites' | 'desempenho'>('palpites')

  const score = scores.find(s => s.participantId === participant?.id) ?? null
  const rank = scores.findIndex(s => s.participantId === participant?.id)
  const rankDisplay = rank >= 0 ? rank + 1 : null

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Carregando...</div>
  }

  if (!participant) {
    return (
      <div className="text-center py-12 text-red-400">
        Participante não encontrado.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-green-900">{participant.name}</h1>
          {rankDisplay && (
            <p className="text-sm text-gray-500">
              {rankDisplay}º lugar · {score?.total ?? 0} pontos
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-0 border-b border-gray-200 mb-4">
        {(['palpites', 'desempenho'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${
              tab === t
                ? 'border-green-700 text-green-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'palpites' && (
        <PalpitesTab matches={matches} predictions={predictions} />
      )}
      {tab === 'desempenho' && <DesempenhoTab score={score} />}
    </div>
  )
}
