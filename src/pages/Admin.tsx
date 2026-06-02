import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { generateToken } from '../lib/tokens'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'corneteiros2026'

export function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [name, setName] = useState('')
  const [lastLink, setLastLink] = useState('')
  const [adding, setAdding] = useState(false)

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 w-80">
          <h1 className="font-bold text-lg mb-4 text-green-900">
            Admin — Bolão dos Corneteiros
          </h1>
          <input
            type="password"
            placeholder="Senha"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                pw === ADMIN_PASSWORD ? setAuthed(true) : setPwError('Senha incorreta')
              }
            }}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm mb-3"
          />
          <button
            onClick={() =>
              pw === ADMIN_PASSWORD ? setAuthed(true) : setPwError('Senha incorreta')
            }
            className="bg-green-700 text-white w-full py-2 rounded text-sm font-medium hover:bg-green-800"
          >
            Entrar
          </button>
          {pwError && <p className="text-red-500 text-sm mt-2">{pwError}</p>}
        </div>
      </div>
    )
  }

  async function handleAddParticipant() {
    if (!name.trim()) return
    setAdding(true)
    const token = generateToken()
    await addDoc(collection(db, 'participants'), {
      name: name.trim(),
      token,
      createdAt: Timestamp.now(),
    })
    const link = `${window.location.origin}/p/${token}`
    setLastLink(link)
    setName('')
    setAdding(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-900">Painel Admin</h1>
          <button
            onClick={() => setAuthed(false)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Sair
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Adicionar Participante</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nome do participante"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddParticipant()}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
            <button
              onClick={handleAddParticipant}
              disabled={adding || !name.trim()}
              className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-800 disabled:opacity-50"
            >
              {adding ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>

          {lastLink && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
              <p className="text-xs text-green-700 mb-1 font-medium">Link gerado:</p>
              <div className="flex gap-2 items-center">
                <code className="text-xs flex-1 break-all">{lastLink}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(lastLink)}
                  className="text-xs bg-green-700 text-white px-2 py-1 rounded whitespace-nowrap hover:bg-green-800"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
