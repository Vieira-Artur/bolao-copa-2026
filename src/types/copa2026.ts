// Copa do Mundo 2026 — 12 groups, 48 teams
// Seed this from api-football.com or update manually after draw confirmation
export const COPA_2026_GROUPS: Record<string, string[]> = {
  A: [], B: [], C: [], D: [], E: [], F: [],
  G: [], H: [], I: [], J: [], K: [], L: [],
}

export const COPA_START_DATE = new Date('2026-06-11T17:00:00Z') // first match kickoff UTC
export const GROUP_DEADLINE = new Date('2026-06-11T16:00:00Z')  // 1h before first match

export const PHASES_KNOCKOUT: Array<import('./index').Phase> = ['r32', 'r16', 'qf', 'sf', '3rd', 'final']

export const PHASE_LABELS: Record<import('./index').Phase, string> = {
  groups: 'Fase de Grupos',
  r32: '16 Avos de Final',
  r16: 'Oitavas de Final',
  qf: 'Quartas de Final',
  sf: 'Semifinais',
  '3rd': 'Disputa 3º Lugar',
  final: 'Final',
}
