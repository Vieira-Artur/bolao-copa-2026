// Run: npx tsx scripts/seed-matches.ts
import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, '../serviceAccount.json'), 'utf-8')
)

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

// Horários em UTC (BRT + 3h). Copa do Mundo 2026.
// Fonte: FIFA.com / Exame — calendário oficial fase de grupos.
// Jogos do mata-mata serão adicionados via Cloud Function quando os times forem definidos.

const GROUP_DEADLINE = admin.firestore.Timestamp.fromDate(
  new Date('2026-06-11T18:00:00Z') // 1h antes do primeiro jogo (16h BRT = 19:00 UTC)
)

interface MatchInput {
  group: string
  homeTeam: string
  awayTeam: string
  kickoff: string // ISO UTC
}

const GROUP_MATCHES: MatchInput[] = [
  // ── RODADA 1 ─────────────────────────────────────────────────────────────
  // Grupo A
  { group: 'A', homeTeam: 'México',          awayTeam: 'África do Sul',       kickoff: '2026-06-11T19:00:00Z' },
  { group: 'A', homeTeam: 'Coreia do Sul',   awayTeam: 'Rep. Tcheca',         kickoff: '2026-06-12T02:00:00Z' },
  // Grupo B
  { group: 'B', homeTeam: 'Canadá',          awayTeam: 'Bósnia e Herzegovina', kickoff: '2026-06-12T19:00:00Z' },
  { group: 'B', homeTeam: 'Qatar',           awayTeam: 'Suíça',               kickoff: '2026-06-13T19:00:00Z' },
  // Grupo C
  { group: 'C', homeTeam: 'Brasil',          awayTeam: 'Marrocos',            kickoff: '2026-06-13T22:00:00Z' },
  { group: 'C', homeTeam: 'Haiti',           awayTeam: 'Escócia',             kickoff: '2026-06-14T01:00:00Z' },
  // Grupo D
  { group: 'D', homeTeam: 'EUA',             awayTeam: 'Paraguai',            kickoff: '2026-06-13T01:00:00Z' },
  { group: 'D', homeTeam: 'Austrália',       awayTeam: 'Turquia',             kickoff: '2026-06-13T04:00:00Z' },
  // Grupo E
  { group: 'E', homeTeam: 'Alemanha',        awayTeam: 'Curaçao',             kickoff: '2026-06-14T17:00:00Z' },
  { group: 'E', homeTeam: 'Costa do Marfim', awayTeam: 'Equador',             kickoff: '2026-06-14T23:00:00Z' },
  // Grupo F
  { group: 'F', homeTeam: 'Holanda',         awayTeam: 'Japão',               kickoff: '2026-06-14T20:00:00Z' },
  { group: 'F', homeTeam: 'Suécia',          awayTeam: 'Tunísia',             kickoff: '2026-06-15T02:00:00Z' },
  // Grupo G
  { group: 'G', homeTeam: 'Bélgica',         awayTeam: 'Egito',               kickoff: '2026-06-15T19:00:00Z' },
  { group: 'G', homeTeam: 'Irã',             awayTeam: 'Nova Zelândia',       kickoff: '2026-06-16T01:00:00Z' },
  // Grupo H
  { group: 'H', homeTeam: 'Espanha',         awayTeam: 'Cabo Verde',          kickoff: '2026-06-15T16:00:00Z' },
  { group: 'H', homeTeam: 'Arábia Saudita',  awayTeam: 'Uruguai',             kickoff: '2026-06-15T22:00:00Z' },
  // Grupo I
  { group: 'I', homeTeam: 'França',          awayTeam: 'Senegal',             kickoff: '2026-06-16T19:00:00Z' },
  { group: 'I', homeTeam: 'Iraque',          awayTeam: 'Noruega',             kickoff: '2026-06-16T22:00:00Z' },
  // Grupo J
  { group: 'J', homeTeam: 'Argentina',       awayTeam: 'Argélia',             kickoff: '2026-06-17T01:00:00Z' },
  { group: 'J', homeTeam: 'Áustria',         awayTeam: 'Jordânia',            kickoff: '2026-06-17T04:00:00Z' },
  // Grupo K
  { group: 'K', homeTeam: 'Portugal',        awayTeam: 'Congo RD',            kickoff: '2026-06-17T17:00:00Z' },
  { group: 'K', homeTeam: 'Uzbequistão',     awayTeam: 'Colômbia',            kickoff: '2026-06-18T02:00:00Z' },
  // Grupo L
  { group: 'L', homeTeam: 'Inglaterra',      awayTeam: 'Croácia',             kickoff: '2026-06-17T20:00:00Z' },
  { group: 'L', homeTeam: 'Gana',            awayTeam: 'Panamá',              kickoff: '2026-06-17T23:00:00Z' },

  // ── RODADA 2 ─────────────────────────────────────────────────────────────
  // Grupo A
  { group: 'A', homeTeam: 'Rep. Tcheca',     awayTeam: 'África do Sul',       kickoff: '2026-06-18T16:00:00Z' },
  { group: 'A', homeTeam: 'México',          awayTeam: 'Coreia do Sul',       kickoff: '2026-06-19T01:00:00Z' },
  // Grupo B
  { group: 'B', homeTeam: 'Suíça',           awayTeam: 'Bósnia e Herzegovina', kickoff: '2026-06-18T19:00:00Z' },
  { group: 'B', homeTeam: 'Canadá',          awayTeam: 'Qatar',               kickoff: '2026-06-18T22:00:00Z' },
  // Grupo C
  { group: 'C', homeTeam: 'Escócia',         awayTeam: 'Marrocos',            kickoff: '2026-06-19T22:00:00Z' },
  { group: 'C', homeTeam: 'Brasil',          awayTeam: 'Haiti',               kickoff: '2026-06-20T01:00:00Z' },
  // Grupo D
  { group: 'D', homeTeam: 'Turquia',         awayTeam: 'Paraguai',            kickoff: '2026-06-19T04:00:00Z' },
  { group: 'D', homeTeam: 'EUA',             awayTeam: 'Austrália',           kickoff: '2026-06-19T19:00:00Z' },
  // Grupo E
  { group: 'E', homeTeam: 'Alemanha',        awayTeam: 'Costa do Marfim',     kickoff: '2026-06-20T20:00:00Z' },
  { group: 'E', homeTeam: 'Equador',         awayTeam: 'Curaçao',             kickoff: '2026-06-21T00:00:00Z' },
  // Grupo F
  { group: 'F', homeTeam: 'Holanda',         awayTeam: 'Suécia',              kickoff: '2026-06-20T17:00:00Z' },
  { group: 'F', homeTeam: 'Tunísia',         awayTeam: 'Japão',               kickoff: '2026-06-21T04:00:00Z' },
  // Grupo G
  { group: 'G', homeTeam: 'Bélgica',         awayTeam: 'Irã',                 kickoff: '2026-06-21T19:00:00Z' },
  { group: 'G', homeTeam: 'Nova Zelândia',   awayTeam: 'Egito',               kickoff: '2026-06-22T01:00:00Z' },
  // Grupo H
  { group: 'H', homeTeam: 'Espanha',         awayTeam: 'Arábia Saudita',      kickoff: '2026-06-21T16:00:00Z' },
  { group: 'H', homeTeam: 'Uruguai',         awayTeam: 'Cabo Verde',          kickoff: '2026-06-21T22:00:00Z' },
  // Grupo I
  { group: 'I', homeTeam: 'França',          awayTeam: 'Iraque',              kickoff: '2026-06-22T21:00:00Z' },
  { group: 'I', homeTeam: 'Noruega',         awayTeam: 'Senegal',             kickoff: '2026-06-23T00:00:00Z' },
  // Grupo J
  { group: 'J', homeTeam: 'Argentina',       awayTeam: 'Áustria',             kickoff: '2026-06-22T17:00:00Z' },
  { group: 'J', homeTeam: 'Jordânia',        awayTeam: 'Argélia',             kickoff: '2026-06-23T03:00:00Z' },
  // Grupo K
  { group: 'K', homeTeam: 'Portugal',        awayTeam: 'Uzbequistão',         kickoff: '2026-06-23T17:00:00Z' },
  { group: 'K', homeTeam: 'Colômbia',        awayTeam: 'Congo RD',            kickoff: '2026-06-24T02:00:00Z' },
  // Grupo L
  { group: 'L', homeTeam: 'Inglaterra',      awayTeam: 'Gana',                kickoff: '2026-06-23T20:00:00Z' },
  { group: 'L', homeTeam: 'Panamá',          awayTeam: 'Croácia',             kickoff: '2026-06-23T23:00:00Z' },

  // ── RODADA 3 (simultâneos por grupo) ─────────────────────────────────────
  // Grupo A
  { group: 'A', homeTeam: 'Rep. Tcheca',     awayTeam: 'México',              kickoff: '2026-06-25T01:00:00Z' },
  { group: 'A', homeTeam: 'África do Sul',   awayTeam: 'Coreia do Sul',       kickoff: '2026-06-25T01:00:00Z' },
  // Grupo B
  { group: 'B', homeTeam: 'Suíça',           awayTeam: 'Canadá',              kickoff: '2026-06-24T19:00:00Z' },
  { group: 'B', homeTeam: 'Bósnia e Herzegovina', awayTeam: 'Qatar',          kickoff: '2026-06-24T19:00:00Z' },
  // Grupo C
  { group: 'C', homeTeam: 'Escócia',         awayTeam: 'Brasil',              kickoff: '2026-06-24T22:00:00Z' },
  { group: 'C', homeTeam: 'Marrocos',        awayTeam: 'Haiti',               kickoff: '2026-06-24T22:00:00Z' },
  // Grupo D
  { group: 'D', homeTeam: 'Turquia',         awayTeam: 'EUA',                 kickoff: '2026-06-26T02:00:00Z' },
  { group: 'D', homeTeam: 'Paraguai',        awayTeam: 'Austrália',           kickoff: '2026-06-26T02:00:00Z' },
  // Grupo E
  { group: 'E', homeTeam: 'Equador',         awayTeam: 'Alemanha',            kickoff: '2026-06-25T20:00:00Z' },
  { group: 'E', homeTeam: 'Curaçao',         awayTeam: 'Costa do Marfim',     kickoff: '2026-06-25T20:00:00Z' },
  // Grupo F
  { group: 'F', homeTeam: 'Tunísia',         awayTeam: 'Holanda',             kickoff: '2026-06-25T23:00:00Z' },
  { group: 'F', homeTeam: 'Japão',           awayTeam: 'Suécia',              kickoff: '2026-06-25T23:00:00Z' },
  // Grupo G
  { group: 'G', homeTeam: 'Egito',           awayTeam: 'Irã',                 kickoff: '2026-06-27T03:00:00Z' },
  { group: 'G', homeTeam: 'Nova Zelândia',   awayTeam: 'Bélgica',             kickoff: '2026-06-27T03:00:00Z' },
  // Grupo H
  { group: 'H', homeTeam: 'Uruguai',         awayTeam: 'Espanha',             kickoff: '2026-06-27T00:00:00Z' },
  { group: 'H', homeTeam: 'Cabo Verde',      awayTeam: 'Arábia Saudita',      kickoff: '2026-06-27T00:00:00Z' },
  // Grupo I
  { group: 'I', homeTeam: 'Noruega',         awayTeam: 'França',              kickoff: '2026-06-26T19:00:00Z' },
  { group: 'I', homeTeam: 'Senegal',         awayTeam: 'Iraque',              kickoff: '2026-06-26T19:00:00Z' },
  // Grupo J
  { group: 'J', homeTeam: 'Jordânia',        awayTeam: 'Argentina',           kickoff: '2026-06-28T02:00:00Z' },
  { group: 'J', homeTeam: 'Argélia',         awayTeam: 'Áustria',             kickoff: '2026-06-28T02:00:00Z' },
  // Grupo K
  { group: 'K', homeTeam: 'Colômbia',        awayTeam: 'Portugal',            kickoff: '2026-06-27T23:30:00Z' },
  { group: 'K', homeTeam: 'Congo RD',        awayTeam: 'Uzbequistão',         kickoff: '2026-06-27T23:30:00Z' },
  // Grupo L
  { group: 'L', homeTeam: 'Panamá',          awayTeam: 'Inglaterra',          kickoff: '2026-06-27T21:00:00Z' },
  { group: 'L', homeTeam: 'Croácia',         awayTeam: 'Gana',                kickoff: '2026-06-27T21:00:00Z' },
]

async function seed() {
  console.log(`Seeding ${GROUP_MATCHES.length} group stage matches...`)

  const batch = db.batch()

  GROUP_MATCHES.forEach((m, i) => {
    const ref = db.collection('matches').doc(`group_${i + 1}`)
    batch.set(ref, {
      phase: 'groups',
      group: m.group,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeScore: null,
      awayScore: null,
      kickoff: admin.firestore.Timestamp.fromDate(new Date(m.kickoff)),
      status: 'scheduled',
      deadline: GROUP_DEADLINE,
      apiId: '',
    })
  })

  await batch.commit()
  console.log(`✓ ${GROUP_MATCHES.length} matches seeded successfully!`)
  console.log('  Knockout matches will be added when teams qualify.')
}

seed().catch(e => {
  console.error('Error:', e.message)
  process.exit(1)
})
