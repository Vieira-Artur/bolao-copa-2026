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

  const [localPreds, setLocalPreds] = useState<Record<string, { home?: number; away?: number }>>(
    () => Object.fromEntries(
      Object.entries(existing).map(([id, p]) => [id, { home: p.homeScore, away: p.awayScore }])
    )
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const groups = [...new Set(matches.map(m => m.group).filter(Boolean))].sort() as string[]

  async function handleSave(match: Match) {
    const pred = localPreds[match.id]
    if (pred?.home === undefined || pred?.away === undefined) return
    setSaving(match.id)
    await saveMatchPrediction(participantId, match.id, { homeScore: pred.home, awayScore: pred.away })
    setSaving(null)
    setSaved(s => ({ ...s, [match.id]: true }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {locked && (
        <div style={{
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.83rem',
          color: '#FBBF24',
        }}>
          Prazo encerrado — palpites da fase de grupos bloqueados.
        </div>
      )}

      {groups.map(group => (
        <div key={group}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--green)',
            marginBottom: '0.6rem',
          }}>
            Grupo {group}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {matches.filter(m => m.group === group).map(match => (
              <div key={match.id} className="copa-card" style={{ padding: '0.75rem 1rem' }}>
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
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    {saved[match.id] && (
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.72rem',
                        color: 'var(--green)',
                      }}>
                        ✓ Salvo
                      </span>
                    )}
                    <button
                      className="copa-btn"
                      onClick={() => handleSave(match)}
                      disabled={saving === match.id}
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.7rem' }}
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
