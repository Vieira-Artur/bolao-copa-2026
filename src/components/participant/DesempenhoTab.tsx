import type { Score } from '../../types'

interface Props {
  score: Score | null
}

export function DesempenhoTab({ score }: Props) {
  if (!score) {
    return (
      <div className="text-center py-8 text-gray-400">
        Pontuação ainda não calculada — aguarde o início dos jogos.
      </div>
    )
  }

  const tb = score.tiebreaker

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: score.total, color: 'bg-green-700' },
          { label: 'Jogos', value: score.matchPoints, color: 'bg-blue-600' },
          { label: 'Classificação', value: score.classificationPoints, color: 'bg-purple-600' },
          { label: 'Artilheiro', value: score.artilheiroPoints, color: 'bg-yellow-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} text-white rounded-lg p-3 text-center`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs opacity-80">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-800">{score.exactScores}</div>
          <div className="text-xs text-gray-500">Placares exatos</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{score.correctResults}</div>
          <div className="text-xs text-gray-500">Resultados certos</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Critérios de Desempate</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: '1º Campeão', ok: tb.champion },
            { label: '2º Artilheiro', ok: tb.artilheiro },
            { label: '3º Vice-Campeão', ok: tb.vice },
            { label: '4º 3º Lugar', ok: tb.third },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-600">{label}</span>
              <span className={ok ? 'text-green-600 font-medium text-xs' : 'text-gray-300 text-xs'}>
                {ok ? '✓ Acertou' : '✗'}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
            <span className="text-gray-600">5º Placares exatos</span>
            <span className="font-bold text-sm">{score.exactScores}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
