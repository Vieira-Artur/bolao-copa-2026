import { useState, useEffect } from 'react'
import { getParticipantPredictions } from '../lib/firestore'
import type { MatchPrediction } from '../types'

export function usePredictions(participantId: string | undefined) {
  const [predictions, setPredictions] = useState<Record<string, MatchPrediction>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!participantId) {
      setLoading(false)
      return
    }
    getParticipantPredictions(participantId).then(p => {
      setPredictions(p)
      setLoading(false)
    })
  }, [participantId])

  return { predictions, loading, setPredictions }
}
