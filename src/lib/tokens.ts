import { getParticipantByToken } from './firestore'
import type { Participant } from '../types'

export async function resolveToken(token: string): Promise<Participant | null> {
  return getParticipantByToken(token)
}

export function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(9)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 12)
}
