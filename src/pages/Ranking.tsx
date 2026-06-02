import { useRanking } from '../hooks/useRanking'
import { RankingTable } from '../components/ranking/RankingTable'

export function Ranking() {
  const { scores, loading } = useRanking()

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-1">Ranking</h1>
      <p className="text-sm text-gray-500 mb-4">
        Copa do Mundo FIFA 2026 · Atualizado em tempo real
      </p>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando ranking...</div>
      ) : (
        <RankingTable scores={scores} />
      )}
    </div>
  )
}
