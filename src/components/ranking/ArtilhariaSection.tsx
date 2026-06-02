interface ParticipantPick {
  participantName: string
  player: string
  team: string
}

interface Props {
  picks: ParticipantPick[]
  officialArtilheiro: string | null
}

export function ArtilhariaSection({ picks, officialArtilheiro }: Props) {
  if (picks.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-700 mb-3">Artilharia</h2>
      {officialArtilheiro && (
        <p className="mb-3 text-sm bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
          Artilheiro oficial: <strong>{officialArtilheiro}</strong>
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {picks.map(p => (
          <div
            key={p.participantName}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <div className="text-gray-500 text-xs">{p.participantName}</div>
            <div className="font-medium">{p.player}</div>
            <div className="text-gray-400 text-xs">{p.team}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
