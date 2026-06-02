import { useState, useEffect } from 'react'
import { getAllMatches } from '../lib/firestore'
import type { Match, Phase } from '../types'

export function useMatches(phase?: Phase) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllMatches().then(all => {
      setMatches(phase ? all.filter(m => m.phase === phase) : all)
      setLoading(false)
    })
  }, [phase])

  return { matches, loading }
}
