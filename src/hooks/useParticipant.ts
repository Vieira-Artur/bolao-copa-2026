import { useState, useEffect } from 'react'
import { getParticipantByToken, getParticipantByName } from '../lib/firestore'
import type { Participant } from '../types'

export function useParticipantByToken(token: string | undefined) {
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setNotFound(true)
      return
    }
    getParticipantByToken(token).then(p => {
      setParticipant(p)
      setNotFound(p === null)
      setLoading(false)
    })
  }, [token])

  return { participant, loading, notFound }
}

export function useParticipantByName(name: string | undefined) {
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name) {
      setLoading(false)
      return
    }
    getParticipantByName(decodeURIComponent(name)).then(p => {
      setParticipant(p)
      setLoading(false)
    })
  }, [name])

  return { participant, loading }
}
