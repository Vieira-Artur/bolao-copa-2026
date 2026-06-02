import { Link } from 'react-router-dom'
import type { Score } from '../../types'

interface Props {
  scores: Score[]
}

export function RankingTable({ scores }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-green-800 text-white">
          <tr>
            <th className="px-3 py-2 text-left w-8">#</th>
            <th className="px-3 py-2 text-left">Participante</th>
            <th className="px-3 py-2 text-right">Pts</th>
            <th className="px-3 py-2 text-right hidden sm:table-cell">Placares</th>
            <th className="px-3 py-2 text-right hidden sm:table-cell">Resultados</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr
              key={s.participantId}
              className={`border-t border-gray-100 ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-green-50 transition-colors`}
            >
              <td className="px-3 py-2 font-semibold text-gray-500">{i + 1}</td>
              <td className="px-3 py-2">
                <Link
                  to={`/participante/${encodeURIComponent(s.participantName)}`}
                  className="font-medium text-green-800 hover:underline"
                >
                  {s.participantName}
                </Link>
              </td>
              <td className="px-3 py-2 text-right font-bold text-green-800">{s.total}</td>
              <td className="px-3 py-2 text-right text-gray-500 hidden sm:table-cell">
                {s.exactScores}
              </td>
              <td className="px-3 py-2 text-right text-gray-500 hidden sm:table-cell">
                {s.correctResults}
              </td>
            </tr>
          ))}
          {scores.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                Nenhum participante ainda
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
