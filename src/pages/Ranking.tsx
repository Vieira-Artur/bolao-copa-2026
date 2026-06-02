import { useRanking } from '../hooks/useRanking'
import { RankingTable } from '../components/ranking/RankingTable'

export function Ranking() {
  const { scores, loading } = useRanking()

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            lineHeight: 1,
            margin: 0,
          }}>
            Ranking
          </h1>
          <span style={{
            display: 'inline-block',
            background: 'var(--green-dim)',
            color: 'var(--green)',
            border: '1px solid rgba(0,209,102,0.25)',
            borderRadius: '99px',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '3px 10px',
          }}>
            Ao vivo
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          margin: 0,
        }}>
          Copa do Mundo FIFA 2026 · {scores.length} participante{scores.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
        }}>
          Carregando ranking...
        </div>
      ) : (
        <RankingTable scores={scores} />
      )}
    </div>
  )
}
