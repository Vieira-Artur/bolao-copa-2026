import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useParticipantByToken } from '../hooks/useParticipant'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { GroupsForm } from '../components/predictions/GroupsForm'
import { ClassificationForm } from '../components/predictions/ClassificationForm'
import { KnockoutForm } from '../components/predictions/KnockoutForm'
import { GROUP_DEADLINE } from '../types/copa2026'

export function MeusPalpites() {
  const { token } = useParams<{ token: string }>()
  const { participant, loading, notFound } = useParticipantByToken(token)
  const { matches: groupMatches, loading: loadingMatches } = useMatches('groups')
  const { matches: allMatches } = useMatches()
  const { predictions, loading: loadingPreds } = usePredictions(participant?.id)
  const [tab, setTab] = useState<'jogos' | 'classificacao' | 'matamata'>('jogos')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Verificando link...
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Link inválido. Verifique o link enviado pelo admin.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold">Bolão dos Corneteiros ⚽</span>
        <Link
          to={`/participante/${encodeURIComponent(participant!.name)}`}
          className="text-sm text-green-200 hover:text-white"
        >
          Ver minha página pública →
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-green-900 mb-1">
          Olá, {participant!.name}!
        </h1>
        <p className="text-sm text-gray-500 mb-4">Seus palpites — Copa do Mundo 2026</p>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(
            [
              { value: 'jogos', label: 'Fase de Grupos' },
              { value: 'classificacao', label: 'Classificação & Artilheiro' },
              { value: 'matamata', label: 'Mata-Matas' },
            ] as const
          ).map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === t.value
                  ? 'border-green-700 text-green-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'jogos' && (
          <>
            {loadingMatches || loadingPreds ? (
              <div className="text-center py-8 text-gray-400">Carregando jogos...</div>
            ) : (
              <GroupsForm
                participantId={participant!.id}
                matches={groupMatches}
                existing={predictions}
                deadline={GROUP_DEADLINE}
              />
            )}
          </>
        )}

        {tab === 'classificacao' && (
          <ClassificationForm
            participantId={participant!.id}
            locked={new Date() >= GROUP_DEADLINE}
          />
        )}

        {tab === 'matamata' && (
          <KnockoutForm
            participantId={participant!.id}
            matches={allMatches}
            existing={predictions}
          />
        )}
      </div>
    </div>
  )
}
