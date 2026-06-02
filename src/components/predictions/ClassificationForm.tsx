import { useState } from 'react'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'

interface Props {
  participantId: string
  locked: boolean
}

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

interface ClassifData {
  groupsFirst: Record<string, string>
  groupsSecond: Record<string, string>
  qf: string[]
  sf: string[]
  final: string[]
  champion: string
  vice: string
  third: string
  fourth: string
  artilheiroPlayer: string
  artilheiroTeam: string
}

const EMPTY: ClassifData = {
  groupsFirst: {}, groupsSecond: {},
  qf: [], sf: [], final: [],
  champion: '', vice: '', third: '', fourth: '',
  artilheiroPlayer: '', artilheiroTeam: '',
}

export function ClassificationForm({ participantId, locked }: Props) {
  const [data, setData] = useState<ClassifData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const inputClass = `border rounded px-2 py-1 text-sm w-full ${
    locked
      ? 'bg-gray-100 text-gray-400 border-gray-200'
      : 'border-green-300 focus:outline-none focus:border-green-500'
  }`

  function setGroupFirst(g: string, v: string) {
    setData(d => ({ ...d, groupsFirst: { ...d.groupsFirst, [g]: v } }))
    setSaved(false)
  }
  function setGroupSecond(g: string, v: string) {
    setData(d => ({ ...d, groupsSecond: { ...d.groupsSecond, [g]: v } }))
    setSaved(false)
  }
  function setField<K extends keyof ClassifData>(key: K, value: ClassifData[K]) {
    setData(d => ({ ...d, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await setDoc(doc(db, 'predictions', participantId, 'extras', 'classificacao'), {
      groupsFirst: data.groupsFirst,
      groupsSecond: data.groupsSecond,
      qf: data.qf.filter(Boolean),
      sf: data.sf.filter(Boolean),
      final: data.final.filter(Boolean),
      champion: data.champion,
      vice: data.vice,
      third: data.third,
      fourth: data.fourth,
      artilheiro: { player: data.artilheiroPlayer, team: data.artilheiroTeam },
      updatedAt: Timestamp.now(),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="space-y-6">
      {locked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-sm text-yellow-800">
          Prazo encerrado — classificação bloqueada.
        </div>
      )}

      {/* Groups */}
      <div>
        <h3 className="font-bold text-green-900 mb-3">Classificados por Grupo (1º e 2º)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GROUPS.map(g => (
            <div key={g} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="font-semibold text-sm mb-2 text-gray-700">Grupo {g}</div>
              <input
                disabled={locked}
                className={inputClass}
                placeholder="1º lugar"
                value={data.groupsFirst[g] ?? ''}
                onChange={e => setGroupFirst(g, e.target.value)}
              />
              <input
                disabled={locked}
                className={`${inputClass} mt-1`}
                placeholder="2º lugar"
                value={data.groupsSecond[g] ?? ''}
                onChange={e => setGroupSecond(g, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Final positions */}
      <div>
        <h3 className="font-bold text-green-900 mb-3">Posições Finais</h3>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { label: 'Campeão', key: 'champion' },
              { label: 'Vice-Campeão', key: 'vice' },
              { label: '3º Lugar', key: 'third' },
              { label: '4º Lugar', key: 'fourth' },
            ] as const
          ).map(({ label, key }) => (
            <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
              <input
                disabled={locked}
                className={inputClass}
                placeholder={label}
                value={data[key]}
                onChange={e => setField(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Artilheiro */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="text-sm font-semibold text-gray-700 mb-2">Artilheiro da Copa</div>
        <input
          disabled={locked}
          className={inputClass}
          placeholder="Nome do jogador"
          value={data.artilheiroPlayer}
          onChange={e => setField('artilheiroPlayer', e.target.value)}
        />
        <input
          disabled={locked}
          className={`${inputClass} mt-1`}
          placeholder="Seleção"
          value={data.artilheiroTeam}
          onChange={e => setField('artilheiroTeam', e.target.value)}
        />
      </div>

      {!locked && (
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Salvo!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Classificação'}
          </button>
        </div>
      )}
    </div>
  )
}
