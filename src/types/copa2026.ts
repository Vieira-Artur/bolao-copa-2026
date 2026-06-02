// Copa do Mundo 2026 — 12 grupos, 48 seleções
export const COPA_2026_GROUPS: Record<string, string[]> = {
  A: ['México', 'África do Sul', 'Coreia do Sul', 'Rep. Tcheca'],
  B: ['Canadá', 'Bósnia e Herzegovina', 'Qatar', 'Suíça'],
  C: ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
  D: ['EUA', 'Paraguai', 'Austrália', 'Turquia'],
  E: ['Alemanha', 'Curaçao', 'Costa do Marfim', 'Equador'],
  F: ['Holanda', 'Japão', 'Suécia', 'Tunísia'],
  G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  H: ['Espanha', 'Cabo Verde', 'Arábia Saudita', 'Uruguai'],
  I: ['França', 'Senegal', 'Iraque', 'Noruega'],
  J: ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
  K: ['Portugal', 'Congo RD', 'Uzbequistão', 'Colômbia'],
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá'],
}

// Primeiro jogo: 11/06 às 16h BRT = 19:00 UTC
export const COPA_START_DATE = new Date('2026-06-11T19:00:00Z')
export const GROUP_DEADLINE = new Date('2026-06-11T18:00:00Z') // 1h antes do primeiro jogo

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
