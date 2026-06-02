import { useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import { PHASE_LABELS } from '../types/copa2026'
import type { Phase } from '../types'

const PHASES: Phase[] = ['groups', 'r32', 'r16', 'qf', 'sf', '3rd', 'final']

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Agendado',
  live: 'Ao Vivo',
  finished: 'Encerrado',
}

export function Jogos() {
  const { matches, loading } = useMatches()
  const [selectedPhase, setSelectedPhase] = useState<Phase>('groups')
  const [selectedGroup, setSelectedGroup] = useState<string>('todos')

  const phaseMatches = matches.filter(m => m.phase === selectedPhase)
  const groups = selectedPhase === 'groups'
    ? [...new Set(phaseMatches.map(m => m.group).filter(Boolean))].sort() as string[]
    : []

  const displayed = selectedGroup === 'todos'
    ? phaseMatches
    : phaseMatches.filter(m => m.group === selectedGroup)

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-4">Jogos</h1>

      {/* Phase tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {PHASES.map(p => (
          <button
            key={p}
            onClick={() => { setSelectedPhase(p); setSelectedGroup('todos') }}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap shrink-0 ${
              selectedPhase === p
                ? 'bg-green-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'
            }`}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Group filter (only for groups phase) */}
      {groups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setSelectedGroup('todos')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap shrink-0 ${
              selectedGroup === 'todos'
                ? 'bg-gray-700 text-white'
                : 'bg-white border border-gray-200 text-gray-500'
            }`}
          >
            Todos
          </button>
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap shrink-0 ${
                selectedGroup === g
                  ? 'bg-gray-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-500'
              }`}
            >
              Grupo {g}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando jogos...</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {selectedPhase === 'groups'
            ? 'Nenhum jogo encontrado.'
            : 'Jogos desta fase ainda não definidos — aguarde o término da fase anterior.'}
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(m => {
            const kickoffBR = m.kickoff.toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
            const hasResult = m.homeScore !== null && m.awayScore !== null

            return (
              <div
                key={m.id}
                className="bg-white border border-gray-200 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-right flex-1 truncate">{m.homeTeam}</span>
                  <span className="text-sm font-bold text-gray-700 w-16 text-center shrink-0">
                    {hasResult ? `${m.homeScore} – ${m.awayScore}` : '– –'}
                  </span>
                  <span className="text-sm font-medium text-left flex-1 truncate">{m.awayTeam}</span>
                  <div className="flex flex-col items-end shrink-0 ml-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        m.status === 'live'
                          ? 'bg-red-100 text-red-700 font-bold'
                          : m.status === 'finished'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {STATUS_LABEL[m.status]}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">{kickoffBR}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
