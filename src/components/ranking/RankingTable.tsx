import { Link } from 'react-router-dom'
import type { Score } from '../../types'

interface Props { scores: Score[] }

const MEDAL: Record<number, { symbol: string; cls: string; glow?: string }> = {
  0: { symbol: '1', cls: 'medal-1', glow: 'rgba(255,184,0,0.2)' },
  1: { symbol: '2', cls: 'medal-2' },
  2: { symbol: '3', cls: 'medal-3' },
}

export function RankingTable({ scores }: Props) {
  if (scores.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        color: 'var(--text-faint)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.4 }}>⚽</div>
        Nenhum participante ainda
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.5rem 1fr 5rem 4rem 4rem',
        padding: '0.4rem 1rem',
        fontFamily: 'var(--font-display)',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
      }}>
        <span>#</span>
        <span>Participante</span>
        <span style={{ textAlign: 'right' }}>Pontos</span>
        <span style={{ textAlign: 'right' }}>Placares</span>
        <span style={{ textAlign: 'right' }}>Result.</span>
      </div>

      {scores.map((s, i) => {
        const medal = MEDAL[i]
        const isTop3 = i < 3

        return (
          <div
            key={s.participantId}
            className={`copa-card fade-up fade-up-${Math.min(i + 1, 5)}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5rem 1fr 5rem 4rem 4rem',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              boxShadow: isTop3 && medal?.glow
                ? `0 0 20px ${medal.glow}`
                : undefined,
              borderColor: i === 0 ? 'rgba(255,184,0,0.2)' : undefined,
            }}
          >
            {/* Position */}
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: i < 3 ? '1.15rem' : '0.9rem',
              fontWeight: 700,
              lineHeight: 1,
            }}>
              {medal ? (
                <span className={medal.cls}>{medal.symbol}</span>
              ) : (
                <span style={{ color: 'var(--text-faint)' }}>{i + 1}</span>
              )}
            </div>

            {/* Name */}
            <div>
              <Link
                to={`/participante/${encodeURIComponent(s.participantName)}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: i === 0 ? 'var(--gold)' : 'var(--text)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                onMouseLeave={e => (e.currentTarget.style.color = i === 0 ? 'var(--gold)' : 'var(--text)')}
              >
                {s.participantName}
              </Link>
            </div>

            {/* Points */}
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: i === 0 ? 'var(--gold)' : 'var(--green)',
                letterSpacing: '-0.01em',
              }}>
                {s.total}
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                color: 'var(--text-faint)',
                marginLeft: '2px',
              }}>pts</span>
            </div>

            {/* Exact scores */}
            <div style={{
              textAlign: 'right',
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: s.exactScores > 0 ? 'var(--text)' : 'var(--text-faint)',
            }}>
              {s.exactScores}
            </div>

            {/* Correct results */}
            <div style={{
              textAlign: 'right',
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}>
              {s.correctResults}
            </div>
          </div>
        )
      })}
    </div>
  )
}
