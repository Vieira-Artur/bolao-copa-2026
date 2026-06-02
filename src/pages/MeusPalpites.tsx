import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useParticipantByToken } from '../hooks/useParticipant'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { GroupsForm } from '../components/predictions/GroupsForm'
import { ClassificationForm } from '../components/predictions/ClassificationForm'
import { KnockoutForm } from '../components/predictions/KnockoutForm'
import { GROUP_DEADLINE } from '../types/copa2026'

const TABS = [
  { value: 'jogos', label: 'Fase de Grupos' },
  { value: 'classificacao', label: 'Classificação' },
  { value: 'matamata', label: 'Mata-Matas' },
] as const

type Tab = typeof TABS[number]['value']

export function MeusPalpites() {
  const { token } = useParams<{ token: string }>()
  const { participant, loading, notFound } = useParticipantByToken(token)
  const { matches: groupMatches, loading: loadingMatches } = useMatches('groups')
  const { matches: allMatches } = useMatches()
  const { predictions, loading: loadingPreds } = usePredictions(participant?.id)
  const [tab, setTab] = useState<Tab>('jogos')

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
      }}>
        Verificando link...
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: '#FC8181',
        fontFamily: 'var(--font-body)', textAlign: 'center', padding: '2rem',
      }}>
        Link inválido. Verifique o link enviado pelo admin.
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{
        background: 'linear-gradient(180deg, #081625 0%, #0C1B2E 100%)',
        borderBottom: '1px solid rgba(0,209,102,0.15)',
        padding: '0 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '42rem',
          margin: '0 auto',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚽</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text)',
            }}>
              Bolão dos Corneteiros
            </span>
          </div>
          <Link
            to={`/participante/${encodeURIComponent(participant!.name)}`}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'var(--green)',
              textDecoration: 'none',
              opacity: 0.8,
              transition: 'opacity 0.2s',
            }}
          >
            Ver ranking →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1,
          }}>
            Olá, {participant!.name}
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '0.35rem',
          }}>
            Seus palpites · Copa do Mundo FIFA 2026
          </p>
        </div>

        {/* Tabs */}
        <div className="copa-tabs">
          {TABS.map(t => (
            <button
              key={t.value}
              className={`copa-tab ${tab === t.value ? 'active' : ''}`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'jogos' && (
          loadingMatches || loadingPreds ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-faint)' }}>
              Carregando jogos...
            </div>
          ) : (
            <GroupsForm
              participantId={participant!.id}
              matches={groupMatches}
              existing={predictions}
              deadline={GROUP_DEADLINE}
            />
          )
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
