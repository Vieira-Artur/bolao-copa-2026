import { useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import { PHASE_LABELS } from '../types/copa2026'
import type { Phase } from '../types'

const PHASES: Phase[] = ['groups', 'r32', 'r16', 'qf', 'sf', '3rd', 'final']

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
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.2rem',
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1,
        }}>
          Jogos
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Copa do Mundo FIFA 2026 · {phaseMatches.length} jogos
        </p>
      </div>

      {/* Phase filter */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
        {PHASES.map(p => {
          const active = selectedPhase === p
          return (
            <button
              key={p}
              onClick={() => { setSelectedPhase(p); setSelectedGroup('todos') }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: '99px',
                border: active ? 'none' : '1px solid var(--border-light)',
                background: active ? 'var(--green)' : 'transparent',
                color: active ? '#07111D' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {PHASE_LABELS[p]}
            </button>
          )
        })}
      </div>

      {/* Group filter */}
      {groups.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '1rem' }}>
          {['todos', ...groups.map(g => g)].map(g => {
            const active = selectedGroup === g
            return (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  padding: '4px 12px',
                  borderRadius: '99px',
                  border: active ? 'none' : '1px solid var(--border)',
                  background: active ? 'rgba(232,239,255,0.12)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-faint)',
                  cursor: 'pointer',
                }}
              >
                {g === 'todos' ? 'Todos' : `Grupo ${g}`}
              </button>
            )
          })}
        </div>
      )}

      {/* Match list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-faint)', fontFamily: 'var(--font-body)' }}>
          Carregando jogos...
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-faint)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          {selectedPhase === 'groups'
            ? 'Nenhum jogo encontrado.'
            : 'Jogos desta fase ainda não definidos — aguarde o encerramento da fase anterior.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
              <div key={m.id} className="copa-card" style={{ padding: '0.85rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  {/* Home team */}
                  <span style={{
                    flex: 1,
                    textAlign: 'right',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {m.homeTeam}
                  </span>

                  {/* Score */}
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: hasResult ? '1.3rem' : '1rem',
                    color: hasResult ? 'var(--text)' : 'var(--text-faint)',
                    width: '5rem',
                    textAlign: 'center',
                    flexShrink: 0,
                    letterSpacing: hasResult ? '0.05em' : '0',
                  }}>
                    {hasResult ? `${m.homeScore} – ${m.awayScore}` : '– –'}
                  </span>

                  {/* Away team */}
                  <span style={{
                    flex: 1,
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {m.awayTeam}
                  </span>

                  {/* Status + time */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: '3px' }}>
                    <span className={
                      m.status === 'live' ? 'badge-live'
                      : m.status === 'finished' ? 'badge-finished'
                      : 'badge-scheduled'
                    }>
                      {m.status === 'live' ? '● Ao Vivo' : m.status === 'finished' ? 'Encerrado' : 'Agendado'}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.68rem',
                      color: 'var(--text-faint)',
                    }}>
                      {kickoffBR}
                    </span>
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
