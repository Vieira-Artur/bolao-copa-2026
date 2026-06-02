import { useState, useEffect } from 'react'
import { subscribeToScores } from '../lib/firestore'
import type { Score } from '../types'

export function useRanking() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToScores(data => {
      setScores(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { scores, loading }
}
