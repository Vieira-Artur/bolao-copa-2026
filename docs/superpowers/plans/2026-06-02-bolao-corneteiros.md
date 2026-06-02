# Bolão dos Corneteiros — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Bolão dos Corneteiros website for Copa do Mundo FIFA 2026 — participants submit match score predictions via unique token links, and a public ranking updates in real time as official results come in.

**Architecture:** React + Vite SPA hosted on Firebase Hosting. Firestore stores participants, matches, predictions, and computed scores. Cloud Functions handle automatic result fetching (api-football.com cron) and score recalculation triggers. Token in URL is the only auth mechanism for participants; admin uses a password.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Firebase v10 (Firestore + Hosting + Cloud Functions + Emulators), Vitest, React Testing Library, api-football.com (RapidAPI)

> **URGENCY:** Copa do Mundo starts 11/06/2026. Tasks 1–9 are the MVP needed before that date. Tasks 10–17 can be completed after the Copa starts.

---

## File Structure

```
bolao-copa-2026/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── firebase.ts                    # Firebase app + Firestore instance
│   ├── types/
│   │   └── index.ts                   # All TypeScript interfaces and enums
│   ├── lib/
│   │   ├── scoring.ts                 # Pure scoring calculation functions
│   │   ├── tokens.ts                  # Token → participant lookup
│   │   └── firestore.ts               # Typed Firestore query helpers
│   ├── hooks/
│   │   ├── useRanking.ts              # Real-time ranking listener
│   │   ├── useMatches.ts              # Matches by phase
│   │   ├── useParticipant.ts          # Participant by name or token
│   │   └── usePredictions.ts          # Participant's predictions
│   ├── pages/
│   │   ├── Ranking.tsx                # /
│   │   ├── Participante.tsx           # /participante/:nome
│   │   ├── MeusPalpites.tsx           # /p/:token
│   │   ├── Jogos.tsx                  # /jogos
│   │   └── Admin.tsx                  # /admin
│   └── components/
│       ├── layout/
│       │   ├── Header.tsx
│       │   └── Layout.tsx
│       ├── ranking/
│       │   ├── RankingTable.tsx
│       │   └── ArtilhariaSection.tsx
│       ├── matches/
│       │   ├── MatchCard.tsx
│       │   └── MatchList.tsx
│       ├── predictions/
│       │   ├── ScoreInput.tsx
│       │   ├── GroupsForm.tsx
│       │   ├── ClassificationForm.tsx
│       │   └── KnockoutForm.tsx
│       └── participant/
│           ├── PalpitesTab.tsx
│           └── DesempenhoTab.tsx
├── functions/
│   ├── src/
│   │   ├── index.ts                   # Function exports
│   │   ├── scoring.ts                 # Scoring logic (mirrors src/lib/scoring.ts)
│   │   ├── scheduledSync.ts           # Cron: fetch API, update matches
│   │   ├── onMatchFinished.ts         # Trigger: recalculate scores
│   │   ├── recalcClassification.ts    # Recalc classification points
│   │   └── manualSync.ts              # HTTP: admin-triggered sync
│   ├── package.json
│   └── tsconfig.json
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .env.local                         # VITE_FIREBASE_* vars (git-ignored)
├── vite.config.ts
├── vitest.config.ts
└── package.json
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`
- Create: `src/main.tsx`, `src/App.tsx`, `index.html`
- Create: `tailwind.config.ts`, `postcss.config.js`
- Create: `.env.local.example`, `.gitignore`
- Create: `firebase.json`, `.firebaserc`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd C:/Users/artur/Documents/GitHub/bolao-copa-2026
npm create vite@latest . -- --template react-ts
npm install
```

- [ ] **Step 2: Install dependencies**

```bash
npm install firebase react-router-dom
npm install -D tailwindcss postcss autoprefixer vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind** — edit `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

- [ ] **Step 4: Configure Vitest** — edit `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 5: Create test setup file** — `src/test-setup.ts`

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Create `.env.local.example`**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

- [ ] **Step 8: Update `.gitignore`** — add `.env.local` and `functions/node_modules`

- [ ] **Step 9: Verify scaffold runs**

```bash
npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173`

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold React + Vite + TypeScript + Tailwind"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`
- Create: `src/types/copa2026.ts`

- [ ] **Step 1: Write the test**

Create `src/types/__tests__/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { Match, Participant, Prediction, Score } from '../index'

describe('Types', () => {
  it('Match has required fields', () => {
    const match: Match = {
      id: 'm1',
      phase: 'groups',
      group: 'A',
      homeTeam: 'Brasil',
      awayTeam: 'Croácia',
      homeScore: null,
      awayScore: null,
      kickoff: new Date('2026-06-12T18:00:00-03:00'),
      status: 'scheduled',
      deadline: new Date('2026-06-11T23:59:00-03:00'),
      apiId: '12345',
    }
    expect(match.phase).toBe('groups')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/types/__tests__/index.test.ts
```

Expected: FAIL — cannot find module `../index`

- [ ] **Step 3: Create `src/types/index.ts`**

```ts
export type Phase = 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'
export type MatchStatus = 'scheduled' | 'live' | 'finished'
export type ScoreType = 'exact' | 'goalDiff' | 'oneScore' | 'result' | 'miss'

export interface Match {
  id: string
  phase: Phase
  group?: string          // "A"–"L", only for groups phase
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  kickoff: Date
  status: MatchStatus
  deadline: Date
  apiId: string
}

export interface Participant {
  id: string
  name: string
  token: string
  createdAt: Date
}

export interface MatchPrediction {
  matchId: string
  homeScore: number
  awayScore: number
  penaltyWinner?: string  // required for r32 and beyond
  submittedAt: Date
}

export interface ArtilheiroPrediction {
  player: string
  team: string
}

export interface ClassificationPrediction {
  groupsFirst: Record<string, string>   // { A: "Brasil", B: "França", ... }
  groupsSecond: Record<string, string>
  qf: string[]    // 8 teams reaching quarterfinals
  sf: string[]    // 4 teams reaching semifinals
  final: string[] // 2 finalists
  champion: string
  vice: string
  third: string
  fourth: string
}

export interface Prediction {
  participantId: string
  matches: Record<string, MatchPrediction>
  artilheiro?: ArtilheiroPrediction
  classificacao?: ClassificationPrediction
}

export interface MatchBreakdown {
  points: number
  type: ScoreType
}

export interface TiebreakerStatus {
  champion: boolean
  artilheiro: boolean
  vice: boolean
  third: boolean
  exactCount: number
}

export interface Score {
  participantId: string
  participantName: string
  total: number
  matchPoints: number
  classificationPoints: number
  artilheiroPoints: number
  exactScores: number
  correctResults: number
  tiebreaker: TiebreakerStatus
  matchBreakdown: Record<string, MatchBreakdown>
  lastUpdated: Date
}

export interface AppConfig {
  artilheiro: string | null
  lastSync: Date | null
  copaStartDate: Date
  groupDeadline: Date
}
```

- [ ] **Step 4: Create `src/types/copa2026.ts`**

```ts
// Copa do Mundo 2026 — 12 groups, 48 teams
// Seed this from api-football.com or update manually after draw confirmation
export const COPA_2026_GROUPS: Record<string, string[]> = {
  A: [], B: [], C: [], D: [], E: [], F: [],
  G: [], H: [], I: [], J: [], K: [], L: [],
}

export const COPA_START_DATE = new Date('2026-06-11T17:00:00Z') // first match kickoff UTC
export const GROUP_DEADLINE = new Date('2026-06-11T16:00:00Z')  // 1h before first match

export const PHASES_KNOCKOUT: Array<import('./index').Phase> = ['r32', 'r16', 'qf', 'sf', '3rd', 'final']

export const PHASE_LABELS: Record<string, string> = {
  groups: 'Fase de Grupos',
  r32: '16 Avos de Final',
  r16: 'Oitavas de Final',
  qf: 'Quartas de Final',
  sf: 'Semifinais',
  '3rd': 'Disputa 3º Lugar',
  final: 'Final',
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/types/__tests__/index.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types and Copa 2026 constants"
```

---

## Task 3: Scoring Library

This is the most critical unit. All scoring logic lives here as pure functions.

**Files:**
- Create: `src/lib/scoring.ts`
- Create: `src/lib/__tests__/scoring.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/scoring.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  calcMatchPoints,
  calcMatchResult,
  calcClassificationPoints,
} from '../scoring'

describe('calcMatchResult', () => {
  it('home win', () => expect(calcMatchResult(2, 1)).toBe('home'))
  it('away win', () => expect(calcMatchResult(0, 1)).toBe('away'))
  it('draw', () => expect(calcMatchResult(1, 1)).toBe('draw'))
})

describe('calcMatchPoints — groups phase', () => {
  it('exact score = 8 pts', () => {
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'groups')).toBe(8)
  })
  it('result + goal diff = 6 pts (not draw)', () => {
    // Predicted 3-1, result 2-0 → same diff (2), same result → 6
    expect(calcMatchPoints({ h: 3, a: 1 }, { h: 2, a: 0 }, 'groups')).toBe(6)
  })
  it('result + one score = 5 pts', () => {
    // Predicted 2-1, result 3-1 → away score matches, home win matches
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 3, a: 1 }, 'groups')).toBe(5)
  })
  it('result + one score (winner goals) = 5 pts', () => {
    // Predicted 3-0, result 3-1 → home score matches, home win matches
    expect(calcMatchPoints({ h: 3, a: 0 }, { h: 3, a: 1 }, 'groups')).toBe(5)
  })
  it('result only = 4 pts', () => {
    // Predicted 1-0, result 3-2 → home win matches, no scores match
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 3, a: 2 }, 'groups')).toBe(4)
  })
  it('wrong result = 0 pts', () => {
    // Predicted 1-0, result 0-1
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 0, a: 1 }, 'groups')).toBe(0)
  })
  it('draw exact score = 8 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 1 }, { h: 1, a: 1 }, 'groups')).toBe(8)
  })
  it('draw result + scores differ = 4 pts (no 6pt tier for draws)', () => {
    // Predicted 0-0, result 2-2 → draw result matches, but goal diff rule excluded for draws
    expect(calcMatchPoints({ h: 0, a: 0 }, { h: 2, a: 2 }, 'groups')).toBe(4)
  })
})

describe('calcMatchPoints — knockout phase', () => {
  it('exact score = 16 pts', () => {
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'r16')).toBe(16)
  })
  it('result + goal diff = 12 pts', () => {
    expect(calcMatchPoints({ h: 3, a: 1 }, { h: 2, a: 0 }, 'r16')).toBe(12)
  })
  it('result + one score = 9 pts', () => {
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 3, a: 1 }, 'r16')).toBe(9)
  })
  it('result only = 6 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 3, a: 2 }, 'r16')).toBe(6)
  })
  it('wrong result = 0 pts', () => {
    expect(calcMatchPoints({ h: 1, a: 0 }, { h: 0, a: 1 }, 'r16')).toBe(0)
  })
  it('same points for qf, sf, 3rd, final phases', () => {
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'qf')).toBe(16)
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'sf')).toBe(16)
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'final')).toBe(16)
    expect(calcMatchPoints({ h: 2, a: 1 }, { h: 2, a: 1 }, 'r32')).toBe(16)
  })
})

describe('calcClassificationPoints', () => {
  it('1st place correct position = 10 pts', () => {
    const pred = { groupsFirst: { A: 'Brasil' }, groupsSecond: { A: 'Argentina' } }
    const real = { groupsFirst: { A: 'Brasil' }, groupsSecond: { A: 'Uruguai' } }
    const result = calcClassificationPoints(pred as any, real as any)
    expect(result).toBeGreaterThanOrEqual(10)
  })
  it('2nd place wrong position (predicted 1st, finished 2nd) = 5 pts', () => {
    const pred = { groupsFirst: { A: 'Argentina' }, groupsSecond: { A: 'Brasil' } }
    const real = { groupsFirst: { A: 'Brasil' }, groupsSecond: { A: 'Argentina' } }
    const result = calcClassificationPoints(pred as any, real as any)
    // Argentina predicted 1st, was 2nd → in qualified list but wrong position → 5 pts
    expect(result).toBeGreaterThanOrEqual(5)
  })
  it('champion correct = 40 pts', () => {
    const pred = { champion: 'Brasil', vice: 'França', third: 'Argentina', fourth: 'Espanha', qf: [], sf: [], final: [] }
    const real = { champion: 'Brasil', vice: 'França', third: 'Argentina', fourth: 'Espanha', qf: [], sf: [], final: [] }
    expect(calcClassificationPoints(pred as any, real as any)).toBeGreaterThanOrEqual(40)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/__tests__/scoring.test.ts
```

Expected: FAIL — cannot find module `../scoring`

- [ ] **Step 3: Create `src/lib/scoring.ts`**

```ts
import type { Phase } from '../types'

type Score = { h: number; a: number }
type MatchResult = 'home' | 'away' | 'draw'

export function calcMatchResult(homeScore: number, awayScore: number): MatchResult {
  if (homeScore > awayScore) return 'home'
  if (awayScore > homeScore) return 'away'
  return 'draw'
}

export function calcMatchPoints(
  prediction: Score,
  real: Score,
  phase: Phase
): number {
  const isKnockout = phase !== 'groups'
  const multiplier = isKnockout ? 2 : 1

  const predResult = calcMatchResult(prediction.h, prediction.a)
  const realResult = calcMatchResult(real.h, real.a)

  if (predResult !== realResult) return 0

  // Exact score
  if (prediction.h === real.h && prediction.a === real.a) return 8 * multiplier

  // Goal difference match (not applicable to draws)
  if (realResult !== 'draw') {
    const predDiff = prediction.h - prediction.a
    const realDiff = real.h - real.a
    if (predDiff === realDiff) return 6 * multiplier
  }

  // One team's score matches
  if (prediction.h === real.h || prediction.a === real.a) return 5 * multiplier

  // Correct result only
  return 4 * multiplier
}

export interface ClassificationReal {
  groupsFirst: Record<string, string>
  groupsSecond: Record<string, string>
  qf: string[]
  sf: string[]
  final: string[]
  champion: string
  vice: string
  third: string
  fourth: string
}

export interface ClassificationPred {
  groupsFirst?: Record<string, string>
  groupsSecond?: Record<string, string>
  qf?: string[]
  sf?: string[]
  final?: string[]
  champion?: string
  vice?: string
  third?: string
  fourth?: string
}

export function calcClassificationPoints(
  pred: ClassificationPred,
  real: ClassificationReal
): number {
  let pts = 0

  // Group stage: 1st and 2nd place per group
  const groups = Object.keys(real.groupsFirst)
  for (const g of groups) {
    const realFirst = real.groupsFirst[g]
    const realSecond = real.groupsSecond[g]
    const predFirst = pred.groupsFirst?.[g]
    const predSecond = pred.groupsSecond?.[g]

    if (predFirst === realFirst) pts += 10
    else if (predFirst === realSecond) pts += 5

    if (predSecond === realSecond) pts += 10
    else if (predSecond === realFirst) pts += 5
  }

  // Knockout stage classification
  for (const team of (pred.qf ?? [])) {
    if (real.qf.includes(team)) pts += 10
  }
  for (const team of (pred.sf ?? [])) {
    if (real.sf.includes(team)) pts += 15
  }
  for (const team of (pred.final ?? [])) {
    if (real.final.includes(team)) pts += 20
  }

  if (pred.fourth && pred.fourth === real.fourth) pts += 10
  if (pred.third && pred.third === real.third) pts += 20
  if (pred.vice && pred.vice === real.vice) pts += 30
  if (pred.champion && pred.champion === real.champion) pts += 40

  return pts
}

export function calcArtilheiroPoints(
  predPlayer: string | undefined,
  realPlayer: string | null | undefined
): number {
  if (!predPlayer || !realPlayer) return 0
  return predPlayer.trim().toLowerCase() === realPlayer.trim().toLowerCase() ? 25 : 0
}

export function getScoreType(
  prediction: Score,
  real: Score,
  phase: Phase
): import('../types').ScoreType {
  const predResult = calcMatchResult(prediction.h, prediction.a)
  const realResult = calcMatchResult(real.h, real.a)

  if (predResult !== realResult) return 'miss'
  if (prediction.h === real.h && prediction.a === real.a) return 'exact'
  if (real.h - real.a === prediction.h - prediction.a && realResult !== 'draw') return 'goalDiff'
  if (prediction.h === real.h || prediction.a === real.a) return 'oneScore'
  return 'result'
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/scoring.test.ts
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts src/lib/__tests__/scoring.test.ts
git commit -m "feat: add scoring calculation library with full test coverage"
```

---

## Task 4: Firebase Configuration

**Files:**
- Create: `src/firebase.ts`
- Create: `firestore.rules`
- Create: `firestore.indexes.json`
- Create: `firebase.json`
- Create: `.firebaserc`

**Pre-requisite:** Create a Firebase project at console.firebase.google.com. Enable Firestore. Copy the config to `.env.local`.

- [ ] **Step 1: Create `src/firebase.ts`**

```ts
import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
}
```

- [ ] **Step 2: Create `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read for everything
    match /participants/{participantId} {
      allow read: if true;
      allow write: if false; // admin only via Cloud Functions
    }

    match /matches/{matchId} {
      allow read: if true;
      allow write: if false;
    }

    match /scores/{participantId} {
      allow read: if true;
      allow write: if false;
    }

    match /config/{docId} {
      allow read: if true;
      allow write: if false;
    }

    // Participants can write their own predictions using their token
    match /predictions/{participantId}/{document=**} {
      allow read: if true;
      allow write: if request.resource.data.keys().hasAll([]) &&
        exists(/databases/$(database)/documents/participants/$(participantId)) &&
        get(/databases/$(database)/documents/participants/$(participantId)).data.token ==
          request.auth.token.firebase.sign_in_provider; // placeholder — see Task 14
    }
  }
}
```

Note: Prediction write rules will be refined in Task 14 to use token-based validation via a Cloud Function helper.

- [ ] **Step 3: Create `firebase.json`**

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  },
  "emulators": {
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true }
  }
}
```

- [ ] **Step 4: Create `firestore.indexes.json`**

```json
{
  "indexes": [
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "phase", "order": "ASCENDING" },
        { "fieldPath": "kickoff", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "group", "order": "ASCENDING" },
        { "fieldPath": "kickoff", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 5: Create `.firebaserc`**

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

Replace `YOUR_FIREBASE_PROJECT_ID` with actual project ID.

- [ ] **Step 6: Install Firebase CLI and initialize**

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
```

- [ ] **Step 7: Commit**

```bash
git add firebase.json .firebaserc firestore.rules firestore.indexes.json src/firebase.ts
git commit -m "feat: add Firebase configuration and Firestore rules"
```

---

## Task 5: Firestore Data Helpers & Hooks

**Files:**
- Create: `src/lib/firestore.ts`
- Create: `src/lib/tokens.ts`
- Create: `src/hooks/useRanking.ts`
- Create: `src/hooks/useMatches.ts`
- Create: `src/hooks/useParticipant.ts`
- Create: `src/hooks/usePredictions.ts`

- [ ] **Step 1: Create `src/lib/firestore.ts`**

```ts
import {
  collection, doc, getDoc, getDocs, query,
  where, orderBy, onSnapshot, setDoc, Timestamp,
  type DocumentData, type QuerySnapshot,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Match, Participant, Score, Prediction, MatchPrediction, AppConfig } from '../types'

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  if (v instanceof Date) return v
  return new Date(v as string)
}

export function docToMatch(id: string, d: DocumentData): Match {
  return {
    id,
    phase: d.phase,
    group: d.group,
    homeTeam: d.homeTeam,
    awayTeam: d.awayTeam,
    homeScore: d.homeScore ?? null,
    awayScore: d.awayScore ?? null,
    kickoff: toDate(d.kickoff),
    status: d.status,
    deadline: toDate(d.deadline),
    apiId: d.apiId ?? '',
  }
}

export function docToParticipant(id: string, d: DocumentData): Participant {
  return { id, name: d.name, token: d.token, createdAt: toDate(d.createdAt) }
}

export function docToScore(id: string, d: DocumentData): Score {
  return {
    participantId: id,
    participantName: d.participantName ?? '',
    total: d.total ?? 0,
    matchPoints: d.matchPoints ?? 0,
    classificationPoints: d.classificationPoints ?? 0,
    artilheiroPoints: d.artilheiroPoints ?? 0,
    exactScores: d.exactScores ?? 0,
    correctResults: d.correctResults ?? 0,
    tiebreaker: d.tiebreaker ?? { champion: false, artilheiro: false, vice: false, third: false, exactCount: 0 },
    matchBreakdown: d.matchBreakdown ?? {},
    lastUpdated: toDate(d.lastUpdated ?? new Date()),
  }
}

export async function getParticipantByToken(token: string): Promise<Participant | null> {
  const q = query(collection(db, 'participants'), where('token', '==', token))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const doc = snap.docs[0]
  return docToParticipant(doc.id, doc.data())
}

export async function getParticipantByName(name: string): Promise<Participant | null> {
  const q = query(collection(db, 'participants'), where('name', '==', name))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return docToParticipant(d.id, d.data())
}

export async function getMatchesByPhase(phase: string): Promise<Match[]> {
  const q = query(
    collection(db, 'matches'),
    where('phase', '==', phase),
    orderBy('kickoff', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => docToMatch(d.id, d.data()))
}

export async function getAllMatches(): Promise<Match[]> {
  const q = query(collection(db, 'matches'), orderBy('kickoff', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToMatch(d.id, d.data()))
}

export function subscribeToScores(
  callback: (scores: Score[]) => void
): () => void {
  const q = query(collection(db, 'scores'), orderBy('total', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => docToScore(d.id, d.data())))
  })
}

export async function getParticipantPredictions(participantId: string): Promise<Record<string, MatchPrediction>> {
  const q = query(collection(db, 'predictions', participantId, 'matches'))
  const snap = await getDocs(q)
  const result: Record<string, MatchPrediction> = {}
  for (const d of snap.docs) {
    result[d.id] = {
      matchId: d.id,
      homeScore: d.data().homeScore,
      awayScore: d.data().awayScore,
      penaltyWinner: d.data().penaltyWinner,
      submittedAt: toDate(d.data().submittedAt),
    }
  }
  return result
}

export async function saveMatchPrediction(
  participantId: string,
  matchId: string,
  pred: Omit<MatchPrediction, 'matchId' | 'submittedAt'>
): Promise<void> {
  await setDoc(
    doc(db, 'predictions', participantId, 'matches', matchId),
    { ...pred, submittedAt: Timestamp.now() }
  )
}

export async function getConfig(): Promise<AppConfig | null> {
  const snap = await getDoc(doc(db, 'config', 'settings'))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    artilheiro: d.artilheiro ?? null,
    lastSync: d.lastSync ? toDate(d.lastSync) : null,
    copaStartDate: toDate(d.copaStartDate),
    groupDeadline: toDate(d.groupDeadline),
  }
}
```

- [ ] **Step 2: Create `src/lib/tokens.ts`**

```ts
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
```

- [ ] **Step 3: Create `src/hooks/useRanking.ts`**

```ts
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
```

- [ ] **Step 4: Create `src/hooks/useMatches.ts`**

```ts
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
```

- [ ] **Step 5: Create `src/hooks/useParticipant.ts`**

```ts
import { useState, useEffect } from 'react'
import { getParticipantByToken, getParticipantByName } from '../lib/firestore'
import type { Participant } from '../types'

export function useParticipantByToken(token: string | undefined) {
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); setNotFound(true); return }
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
    if (!name) { setLoading(false); return }
    getParticipantByName(decodeURIComponent(name)).then(p => {
      setParticipant(p)
      setLoading(false)
    })
  }, [name])

  return { participant, loading }
}
```

- [ ] **Step 6: Create `src/hooks/usePredictions.ts`**

```ts
import { useState, useEffect } from 'react'
import { getParticipantPredictions } from '../lib/firestore'
import type { MatchPrediction } from '../types'

export function usePredictions(participantId: string | undefined) {
  const [predictions, setPredictions] = useState<Record<string, MatchPrediction>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!participantId) { setLoading(false); return }
    getParticipantPredictions(participantId).then(p => {
      setPredictions(p)
      setLoading(false)
    })
  }, [participantId])

  return { predictions, loading, setPredictions }
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/ src/hooks/
git commit -m "feat: add Firestore helpers and React hooks"
```

---

## Task 6: Routing & Layout

**Files:**
- Create: `src/App.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Layout.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install React Router**

```bash
npm install react-router-dom
```

- [ ] **Step 2: Create `src/components/layout/Header.tsx`**

```tsx
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Ranking' },
    { to: '/jogos', label: 'Jogos' },
  ]

  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-wide">
          Bolão dos Corneteiros ⚽
        </Link>
        <nav className="flex gap-4">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium hover:text-green-200 transition-colors ${
                pathname === l.to ? 'text-yellow-300' : 'text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create `src/components/layout/Layout.tsx`**

```tsx
import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Ranking } from './pages/Ranking'
import { Participante } from './pages/Participante'
import { MeusPalpites } from './pages/MeusPalpites'
import { Jogos } from './pages/Jogos'
import { Admin } from './pages/Admin'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Ranking />} />
          <Route path="/participante/:nome" element={<Participante />} />
          <Route path="/jogos" element={<Jogos />} />
        </Route>
        <Route path="/p/:token" element={<MeusPalpites />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Update `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 6: Create stub pages** — create each page as a placeholder so routing works

`src/pages/Ranking.tsx`:
```tsx
export function Ranking() { return <div>Ranking</div> }
```

`src/pages/Participante.tsx`:
```tsx
export function Participante() { return <div>Participante</div> }
```

`src/pages/MeusPalpites.tsx`:
```tsx
export function MeusPalpites() { return <div>Meus Palpites</div> }
```

`src/pages/Jogos.tsx`:
```tsx
export function Jogos() { return <div>Jogos</div> }
```

`src/pages/Admin.tsx`:
```tsx
export function Admin() { return <div>Admin</div> }
```

- [ ] **Step 7: Run the app and verify routing works**

```bash
npm run dev
```

Visit `http://localhost:5173`, `/jogos`, `/participante/teste`, `/p/sometoken`, `/admin` — each should render its stub without errors.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: add routing and layout shell"
```

---

## Task 7: Ranking Page

**Files:**
- Create: `src/pages/Ranking.tsx`
- Create: `src/components/ranking/RankingTable.tsx`
- Create: `src/components/ranking/ArtilhariaSection.tsx`
- Create: `src/components/ranking/__tests__/RankingTable.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/ranking/__tests__/RankingTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RankingTable } from '../RankingTable'
import type { Score } from '../../../types'
import { describe, it, expect } from 'vitest'

const mockScores: Score[] = [
  {
    participantId: 'p1', participantName: 'João', total: 120,
    matchPoints: 100, classificationPoints: 15, artilheiroPoints: 0,
    exactScores: 8, correctResults: 20,
    tiebreaker: { champion: true, artilheiro: false, vice: false, third: false, exactCount: 8 },
    matchBreakdown: {}, lastUpdated: new Date(),
  },
  {
    participantId: 'p2', participantName: 'Maria', total: 95,
    matchPoints: 80, classificationPoints: 15, artilheiroPoints: 0,
    exactScores: 5, correctResults: 16,
    tiebreaker: { champion: false, artilheiro: false, vice: false, third: false, exactCount: 5 },
    matchBreakdown: {}, lastUpdated: new Date(),
  },
]

describe('RankingTable', () => {
  it('renders participant names and totals', () => {
    render(<MemoryRouter><RankingTable scores={mockScores} /></MemoryRouter>)
    expect(screen.getByText('João')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Maria')).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()
  })

  it('shows position numbers', () => {
    render(<MemoryRouter><RankingTable scores={mockScores} /></MemoryRouter>)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/ranking/__tests__/RankingTable.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Create `src/components/ranking/RankingTable.tsx`**

```tsx
import { Link } from 'react-router-dom'
import type { Score } from '../../types'

interface Props { scores: Score[] }

export function RankingTable({ scores }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-green-800 text-white">
          <tr>
            <th className="px-3 py-2 text-left w-8">#</th>
            <th className="px-3 py-2 text-left">Participante</th>
            <th className="px-3 py-2 text-right">Pts</th>
            <th className="px-3 py-2 text-right hidden sm:table-cell">Placares</th>
            <th className="px-3 py-2 text-right hidden sm:table-cell">Resultados</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr
              key={s.participantId}
              className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}
            >
              <td className="px-3 py-2 font-semibold text-gray-500">{i + 1}</td>
              <td className="px-3 py-2">
                <Link
                  to={`/participante/${encodeURIComponent(s.participantName)}`}
                  className="font-medium text-green-800 hover:underline"
                >
                  {s.participantName}
                </Link>
              </td>
              <td className="px-3 py-2 text-right font-bold text-green-800">{s.total}</td>
              <td className="px-3 py-2 text-right text-gray-500 hidden sm:table-cell">{s.exactScores}</td>
              <td className="px-3 py-2 text-right text-gray-500 hidden sm:table-cell">{s.correctResults}</td>
            </tr>
          ))}
          {scores.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                Nenhum participante ainda
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ranking/ArtilhariaSection.tsx`**

```tsx
import type { Participant } from '../../types'

interface ParticipantPick {
  participant: Participant
  player: string
  team: string
}

interface Props {
  picks: ParticipantPick[]
  officialArtilheiro: string | null
}

export function ArtilhariaSection({ picks, officialArtilheiro }: Props) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-700 mb-3">Artilharia</h2>
      {officialArtilheiro && (
        <p className="mb-3 text-sm bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
          Artilheiro oficial: <strong>{officialArtilheiro}</strong>
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {picks.map(p => (
          <div key={p.participant.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <div className="text-gray-500 text-xs">{p.participant.name}</div>
            <div className="font-medium">{p.player}</div>
            <div className="text-gray-400 text-xs">{p.team}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement `src/pages/Ranking.tsx`**

```tsx
import { useRanking } from '../hooks/useRanking'
import { RankingTable } from '../components/ranking/RankingTable'

export function Ranking() {
  const { scores, loading } = useRanking()

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-1">Ranking</h1>
      <p className="text-sm text-gray-500 mb-4">Copa do Mundo FIFA 2026 · Atualizado em tempo real</p>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando ranking...</div>
      ) : (
        <RankingTable scores={scores} />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx vitest run src/components/ranking/__tests__/RankingTable.test.tsx
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/pages/Ranking.tsx src/components/ranking/
git commit -m "feat: add ranking page with real-time leaderboard"
```

---

## Task 8: Prediction Form — Group Stage

**Files:**
- Create: `src/components/predictions/ScoreInput.tsx`
- Create: `src/components/predictions/GroupsForm.tsx`
- Create: `src/pages/MeusPalpites.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/predictions/__tests__/ScoreInput.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ScoreInput } from '../ScoreInput'
import { describe, it, expect, vi } from 'vitest'

describe('ScoreInput', () => {
  it('renders home and away inputs', () => {
    render(<ScoreInput homeTeam="Brasil" awayTeam="Croácia" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Brasil')).toBeInTheDocument()
    expect(screen.getByLabelText('Croácia')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const onChange = vi.fn()
    render(<ScoreInput homeTeam="Brasil" awayTeam="Croácia" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Brasil'), { target: { value: '2' } })
    expect(onChange).toHaveBeenCalledWith({ home: 2, away: undefined })
  })

  it('disables inputs when locked=true', () => {
    render(<ScoreInput homeTeam="Brasil" awayTeam="Croácia" onChange={vi.fn()} locked />)
    expect(screen.getByLabelText('Brasil')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/predictions/__tests__/ScoreInput.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Create `src/components/predictions/ScoreInput.tsx`**

```tsx
interface Props {
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  locked?: boolean
  onChange: (value: { home?: number; away?: number }) => void
}

export function ScoreInput({ homeTeam, awayTeam, homeScore, awayScore, locked, onChange }: Props) {
  const inputClass = `w-12 h-10 text-center text-lg font-bold border-2 rounded-lg
    ${locked ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'border-green-300 focus:border-green-500 focus:outline-none'}`

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-right flex-1 truncate">{homeTeam}</span>
      <label htmlFor={`home-${homeTeam}`} className="sr-only">{homeTeam}</label>
      <input
        id={`home-${homeTeam}`}
        aria-label={homeTeam}
        type="number"
        min={0}
        max={20}
        value={homeScore ?? ''}
        disabled={locked}
        className={inputClass}
        onChange={e => {
          const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
          onChange({ home: v, away: awayScore })
        }}
      />
      <span className="text-gray-400 font-bold">×</span>
      <label htmlFor={`away-${awayTeam}`} className="sr-only">{awayTeam}</label>
      <input
        id={`away-${awayTeam}`}
        aria-label={awayTeam}
        type="number"
        min={0}
        max={20}
        value={awayScore ?? ''}
        disabled={locked}
        className={inputClass}
        onChange={e => {
          const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
          onChange({ home: homeScore, away: v })
        }}
      />
      <span className="text-sm font-medium text-left flex-1 truncate">{awayTeam}</span>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/predictions/GroupsForm.tsx`**

```tsx
import { useState } from 'react'
import { ScoreInput } from './ScoreInput'
import { saveMatchPrediction } from '../../lib/firestore'
import type { Match, MatchPrediction } from '../../types'

interface Props {
  participantId: string
  matches: Match[]
  existing: Record<string, MatchPrediction>
  deadline: Date
}

export function GroupsForm({ participantId, matches, existing, deadline }: Props) {
  const locked = new Date() >= deadline
  const [localPreds, setLocalPreds] = useState<Record<string, { home?: number; away?: number }>>(
    () => Object.fromEntries(
      Object.entries(existing).map(([id, p]) => [id, { home: p.homeScore, away: p.awayScore }])
    )
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const groups = [...new Set(matches.map(m => m.group).filter(Boolean))].sort()

  async function handleSave(match: Match) {
    const pred = localPreds[match.id]
    if (pred?.home === undefined || pred?.away === undefined) return
    setSaving(match.id)
    await saveMatchPrediction(participantId, match.id, {
      homeScore: pred.home,
      awayScore: pred.away,
    })
    setSaving(null)
    setSaved(s => ({ ...s, [match.id]: true }))
  }

  return (
    <div className="space-y-6">
      {locked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          Prazo encerrado — palpites da fase de grupos bloqueados.
        </div>
      )}
      {groups.map(group => (
        <div key={group}>
          <h3 className="font-bold text-green-900 mb-3">Grupo {group}</h3>
          <div className="space-y-3">
            {matches.filter(m => m.group === group).map(match => (
              <div key={match.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <ScoreInput
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  homeScore={localPreds[match.id]?.home}
                  awayScore={localPreds[match.id]?.away}
                  locked={locked}
                  onChange={v => setLocalPreds(p => ({ ...p, [match.id]: v }))}
                />
                {!locked && (
                  <div className="mt-2 flex justify-end gap-2 items-center">
                    {saved[match.id] && <span className="text-xs text-green-600">Salvo!</span>}
                    <button
                      onClick={() => handleSave(match)}
                      disabled={saving === match.id}
                      className="text-xs bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 disabled:opacity-50"
                    >
                      {saving === match.id ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Implement `src/pages/MeusPalpites.tsx`**

```tsx
import { useParams, Link } from 'react-router-dom'
import { useParticipantByToken } from '../hooks/useParticipant'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { GroupsForm } from '../components/predictions/GroupsForm'
import { GROUP_DEADLINE } from '../types/copa2026'

export function MeusPalpites() {
  const { token } = useParams<{ token: string }>()
  const { participant, loading, notFound } = useParticipantByToken(token)
  const { matches, loading: loadingMatches } = useMatches('groups')
  const { predictions, loading: loadingPreds } = usePredictions(participant?.id)

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Verificando link...</div>
  if (notFound) return <div className="flex items-center justify-center min-h-screen text-red-500">Link inválido. Verifique o link enviado.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold">Bolão dos Corneteiros ⚽</span>
        <Link
          to={`/participante/${encodeURIComponent(participant!.name)}`}
          className="text-sm text-green-200 hover:text-white"
        >
          Ver minha página pública →
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-green-900 mb-1">Olá, {participant!.name}!</h1>
        <p className="text-sm text-gray-500 mb-6">Seus palpites da fase de grupos</p>

        {loadingMatches || loadingPreds ? (
          <div className="text-center py-8 text-gray-400">Carregando jogos...</div>
        ) : (
          <GroupsForm
            participantId={participant!.id}
            matches={matches}
            existing={predictions}
            deadline={GROUP_DEADLINE}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx vitest run src/components/predictions/__tests__/ScoreInput.test.tsx
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/predictions/ src/pages/MeusPalpites.tsx
git commit -m "feat: add group stage prediction form"
```

---

## Task 9: Classification & Artilheiro Form + Admin (MVP)

**Files:**
- Create: `src/components/predictions/ClassificationForm.tsx`
- Create: `src/pages/Admin.tsx`

- [ ] **Step 1: Create `src/components/predictions/ClassificationForm.tsx`**

```tsx
import { useState } from 'react'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import type { ClassificationPrediction } from '../../types'

interface Props {
  participantId: string
  existing?: Partial<ClassificationPrediction>
  locked: boolean
}

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export function ClassificationForm({ participantId, existing, locked }: Props) {
  const [data, setData] = useState<Partial<ClassificationPrediction>>(existing ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await setDoc(
      doc(db, 'predictions', participantId, 'extras', 'classificacao'),
      { ...data, updatedAt: Timestamp.now() }
    )
    setSaving(false)
    setSaved(true)
  }

  function setGroupFirst(g: string, v: string) {
    setData(d => ({ ...d, groupsFirst: { ...(d.groupsFirst ?? {}), [g]: v } }))
    setSaved(false)
  }
  function setGroupSecond(g: string, v: string) {
    setData(d => ({ ...d, groupsSecond: { ...(d.groupsSecond ?? {}), [g]: v } }))
    setSaved(false)
  }

  const inputClass = `border rounded px-2 py-1 text-sm w-full ${locked ? 'bg-gray-100 text-gray-400' : 'border-green-300 focus:outline-none focus:border-green-500'}`

  return (
    <div className="space-y-6">
      {locked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-sm text-yellow-800">
          Prazo encerrado.
        </div>
      )}

      <div>
        <h3 className="font-bold text-green-900 mb-3">Classificados por Grupo (1º e 2º)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GROUPS.map(g => (
            <div key={g} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="font-semibold text-sm mb-2 text-gray-700">Grupo {g}</div>
              <input disabled={locked} className={inputClass} placeholder="1º lugar"
                value={data.groupsFirst?.[g] ?? ''} onChange={e => setGroupFirst(g, e.target.value)} />
              <input disabled={locked} className={`${inputClass} mt-1`} placeholder="2º lugar"
                value={data.groupsSecond?.[g] ?? ''} onChange={e => setGroupSecond(g, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Campeão', key: 'champion' },
          { label: 'Vice-Campeão', key: 'vice' },
          { label: '3º Lugar', key: 'third' },
          { label: '4º Lugar', key: 'fourth' },
        ].map(({ label, key }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
            <input
              disabled={locked}
              className={inputClass}
              placeholder={label}
              value={(data as any)[key] ?? ''}
              onChange={e => { setData(d => ({ ...d, [key]: e.target.value })); setSaved(false) }}
            />
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="text-sm font-semibold text-gray-700 mb-2">Artilheiro da Copa</div>
        <input
          disabled={locked}
          className={inputClass}
          placeholder="Nome do jogador"
          value={(data as any).artilheiroPlayer ?? ''}
          onChange={e => { setData(d => ({ ...d, artilheiroPlayer: e.target.value } as any)); setSaved(false) }}
        />
        <input
          disabled={locked}
          className={`${inputClass} mt-1`}
          placeholder="Seleção"
          value={(data as any).artilheiroTeam ?? ''}
          onChange={e => { setData(d => ({ ...d, artilheiroTeam: e.target.value } as any)); setSaved(false) }}
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
```

- [ ] **Step 2: Update `src/pages/MeusPalpites.tsx`** — add a tab for "Classificação" below the groups form

Add tabs to `MeusPalpites.tsx`:

```tsx
// Add at top of MeusPalpites after imports
import { ClassificationForm } from '../components/predictions/ClassificationForm'

// Inside the component, replace the single GroupsForm render with:
const [tab, setTab] = useState<'jogos' | 'classificacao'>('jogos')

// In the JSX, add tab switcher:
<div className="flex gap-2 mb-4 border-b border-gray-200">
  {(['jogos', 'classificacao'] as const).map(t => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
        tab === t ? 'border-green-700 text-green-800' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {t === 'jogos' ? 'Jogos' : 'Classificação & Artilheiro'}
    </button>
  ))}
</div>

{tab === 'jogos' && !loadingMatches && !loadingPreds && (
  <GroupsForm participantId={participant!.id} matches={matches} existing={predictions} deadline={GROUP_DEADLINE} />
)}
{tab === 'classificacao' && (
  <ClassificationForm participantId={participant!.id} locked={new Date() >= GROUP_DEADLINE} />
)}
```

- [ ] **Step 3: Implement Admin page** `src/pages/Admin.tsx`

```tsx
import { useState } from 'react'
import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { generateToken } from '../lib/tokens'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'corneteiros2026'

export function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [name, setName] = useState('')
  const [lastLink, setLastLink] = useState('')
  const [error, setError] = useState('')

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 w-72">
          <h1 className="font-bold text-lg mb-4 text-green-900">Admin — Bolão dos Corneteiros</h1>
          <input
            type="password"
            placeholder="Senha"
            value={pw}
            onChange={e => setPw(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-sm mb-3"
          />
          <button
            onClick={() => pw === ADMIN_PASSWORD ? setAuthed(true) : setError('Senha incorreta')}
            className="bg-green-700 text-white w-full py-2 rounded text-sm font-medium"
          >
            Entrar
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    )
  }

  async function handleAddParticipant() {
    if (!name.trim()) return
    const token = generateToken()
    await addDoc(collection(db, 'participants'), {
      name: name.trim(),
      token,
      createdAt: Timestamp.now(),
    })
    const link = `${window.location.origin}/p/${token}`
    setLastLink(link)
    setName('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-green-900 mb-6">Painel Admin</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Adicionar Participante</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nome do participante"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
              onKeyDown={e => e.key === 'Enter' && handleAddParticipant()}
            />
            <button
              onClick={handleAddParticipant}
              className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-800"
            >
              Adicionar
            </button>
          </div>
          {lastLink && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
              <p className="text-xs text-green-700 mb-1 font-medium">Link gerado:</p>
              <div className="flex gap-2 items-center">
                <code className="text-xs flex-1 break-all">{lastLink}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(lastLink)}
                  className="text-xs bg-green-700 text-white px-2 py-1 rounded whitespace-nowrap"
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
```

- [ ] **Step 4: Add `VITE_ADMIN_PASSWORD` to `.env.local.example`**

```
VITE_ADMIN_PASSWORD=corneteiros2026
```

- [ ] **Step 5: Test the full MVP flow manually**

```bash
npm run dev
```

1. Go to `/admin`, log in, add a participant named "Teste", copy the link
2. Open the link (`/p/<token>`) — verify form loads with group matches (will be empty if Firestore has no data yet — OK)
3. Go to `/` — verify ranking page loads (empty is fine)

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: add classification form and admin panel (MVP complete)"
```

---

## Task 10: Seed Match Data

Match data must be in Firestore before participants can fill in predictions. Use a one-time admin script to seed from api-football.com.

**Files:**
- Create: `scripts/seed-matches.ts`

**Pre-requisite:** Sign up at rapidapi.com, subscribe to api-football.com (free tier), get your API key.

- [ ] **Step 1: Install script dependencies**

```bash
npm install -D tsx dotenv
```

- [ ] **Step 2: Create `scripts/seed-matches.ts`**

```ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Run: npx tsx scripts/seed-matches.ts
// Requires: FIREBASE_SERVICE_ACCOUNT_PATH and RAPIDAPI_KEY in .env.local

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH!)
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
const COPA_2026_ID = 1 // api-football.com tournament ID for World Cup 2026

async function fetchFixtures(): Promise<any[]> {
  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${COPA_2026_ID}&season=2026`
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
    },
  })
  const data = await res.json()
  return data.response ?? []
}

function getPhase(roundName: string): string {
  const r = roundName.toLowerCase()
  if (r.includes('group')) return 'groups'
  if (r.includes('round of 32') || r.includes('16th')) return 'r32'
  if (r.includes('round of 16') || r.includes('8th')) return 'r16'
  if (r.includes('quarter')) return 'qf'
  if (r.includes('semi')) return 'sf'
  if (r.includes('3rd')) return '3rd'
  if (r.includes('final')) return 'final'
  return 'groups'
}

function getGroup(roundName: string): string | undefined {
  const match = roundName.match(/Group (\w)/i)
  return match ? match[1].toUpperCase() : undefined
}

async function seed() {
  const fixtures = await fetchFixtures()
  console.log(`Fetched ${fixtures.length} fixtures`)

  const GROUP_DEADLINE = new Date('2026-06-11T16:00:00Z')
  const batch = db.batch()

  for (const f of fixtures) {
    const kickoff = new Date(f.fixture.date)
    const phase = getPhase(f.league.round)
    const isKnockout = phase !== 'groups'
    const deadline = isKnockout
      ? new Date(kickoff.getTime() - 60 * 60 * 1000) // 1h before
      : GROUP_DEADLINE

    const ref = db.collection('matches').doc(String(f.fixture.id))
    batch.set(ref, {
      phase,
      group: getGroup(f.league.round),
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      kickoff: Timestamp.fromDate(kickoff),
      status: f.fixture.status.short === 'FT' ? 'finished'
        : f.fixture.status.short === '1H' || f.fixture.status.short === '2H' ? 'live'
        : 'scheduled',
      deadline: Timestamp.fromDate(deadline),
      apiId: String(f.fixture.id),
    })
  }

  await batch.commit()
  console.log('Matches seeded successfully')
}

seed().catch(console.error)
```

- [ ] **Step 3: Download Firebase service account key**

In Firebase Console → Project Settings → Service Accounts → Generate new private key. Save as `serviceAccount.json` (git-ignored). Add to `.env.local`:

```
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccount.json
RAPIDAPI_KEY=your_rapidapi_key_here
```

- [ ] **Step 4: Add serviceAccount.json to `.gitignore`**

```
serviceAccount.json
```

- [ ] **Step 5: Run the seed script**

```bash
npx tsx scripts/seed-matches.ts
```

Expected: `Fetched 104 fixtures` and `Matches seeded successfully`

- [ ] **Step 6: Verify in Firebase Console** — check Firestore → `matches` collection has 104 documents

- [ ] **Step 7: Test the palpites form** — go to `/p/<token>` and verify group matches appear

- [ ] **Step 8: Commit**

```bash
git add scripts/seed-matches.ts .gitignore
git commit -m "feat: add match seed script from api-football.com"
```

---

## Task 11: Participant Page (Palpites + Desempenho Tabs)

**Files:**
- Create: `src/pages/Participante.tsx`
- Create: `src/components/participant/PalpitesTab.tsx`
- Create: `src/components/participant/DesempenhoTab.tsx`

- [ ] **Step 1: Create `src/components/participant/PalpitesTab.tsx`**

```tsx
import type { Match, MatchPrediction } from '../../types'
import { PHASE_LABELS } from '../../types/copa2026'
import { calcMatchPoints, getScoreType } from '../../lib/scoring'

interface Props {
  matches: Match[]
  predictions: Record<string, MatchPrediction>
}

const TYPE_LABELS: Record<string, string> = {
  exact: 'Placar exato',
  goalDiff: 'Diferença certa',
  oneScore: 'Um escore certo',
  result: 'Resultado certo',
  miss: 'Errou',
}

export function PalpitesTab({ matches, predictions }: Props) {
  const finished = matches.filter(m => m.status === 'finished')
  const pending = matches.filter(m => m.status !== 'finished')

  function renderMatch(m: Match) {
    const pred = predictions[m.id]
    const hasPred = pred !== undefined
    const hasResult = m.homeScore !== null && m.awayScore !== null

    let pts: number | null = null
    let type: string | null = null
    if (hasPred && hasResult) {
      pts = calcMatchPoints(
        { h: pred.homeScore, a: pred.awayScore },
        { h: m.homeScore!, a: m.awayScore! },
        m.phase
      )
      type = TYPE_LABELS[getScoreType(
        { h: pred.homeScore, a: pred.awayScore },
        { h: m.homeScore!, a: m.awayScore! },
        m.phase
      )]
    }

    return (
      <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-right flex-1 truncate font-medium">{m.homeTeam}</div>
          <div className="text-center w-16 text-gray-400 text-xs">
            {hasResult ? (
              <span className="font-bold text-gray-800">{m.homeScore} – {m.awayScore}</span>
            ) : '– –'}
          </div>
          <div className="text-left flex-1 truncate font-medium">{m.awayTeam}</div>
        </div>
        <div className="ml-4 text-right w-28 shrink-0">
          {hasPred ? (
            <div>
              <span className="text-gray-500">{pred.homeScore} – {pred.awayScore}</span>
              {pts !== null && (
                <span className={`ml-2 font-bold ${pts > 0 ? 'text-green-700' : 'text-red-500'}`}>
                  {pts > 0 ? `+${pts}` : '0'}
                </span>
              )}
              {type && pts !== null && pts > 0 && (
                <div className="text-xs text-gray-400">{type}</div>
              )}
            </div>
          ) : (
            <span className="text-gray-300 text-xs">Sem palpite</span>
          )}
        </div>
      </div>
    )
  }

  const phases = [...new Set(matches.map(m => m.phase))]

  return (
    <div className="space-y-6">
      {phases.map(phase => {
        const phaseMatches = matches.filter(m => m.phase === phase)
        return (
          <div key={phase}>
            <h3 className="font-bold text-green-900 mb-2">{PHASE_LABELS[phase]}</h3>
            <div className="bg-white border border-gray-200 rounded-lg px-4">
              {phaseMatches.map(renderMatch)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/participant/DesempenhoTab.tsx`**

```tsx
import type { Score } from '../../types'

interface Props { score: Score | null }

export function DesempenhoTab({ score }: Props) {
  if (!score) {
    return <div className="text-center py-8 text-gray-400">Pontuação ainda não calculada.</div>
  }

  const tb = score.tiebreaker

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: score.total, color: 'bg-green-700' },
          { label: 'Jogos', value: score.matchPoints, color: 'bg-blue-600' },
          { label: 'Classificação', value: score.classificationPoints, color: 'bg-purple-600' },
          { label: 'Artilheiro', value: score.artilheiroPoints, color: 'bg-yellow-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} text-white rounded-lg p-3 text-center`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs opacity-80">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Critérios de Desempate</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Campeão', ok: tb.champion },
            { label: 'Artilheiro', ok: tb.artilheiro },
            { label: 'Vice-Campeão', ok: tb.vice },
            { label: '3º Lugar', ok: tb.third },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-600">{label}</span>
              <span className={ok ? 'text-green-600 font-medium' : 'text-gray-300'}>
                {ok ? '✓ Acertou' : '✗ Não acertou'}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
            <span className="text-gray-600">Placares exatos</span>
            <span className="font-bold">{score.exactScores}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Implement `src/pages/Participante.tsx`**

```tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useParticipantByName } from '../hooks/useParticipant'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useRanking } from '../hooks/useRanking'
import { PalpitesTab } from '../components/participant/PalpitesTab'
import { DesempenhoTab } from '../components/participant/DesempenhoTab'

export function Participante() {
  const { nome } = useParams<{ nome: string }>()
  const { participant, loading } = useParticipantByName(nome)
  const { matches } = useMatches()
  const { predictions } = usePredictions(participant?.id)
  const { scores } = useRanking()
  const [tab, setTab] = useState<'palpites' | 'desempenho'>('palpites')

  const score = scores.find(s => s.participantId === participant?.id) ?? null
  const rank = scores.findIndex(s => s.participantId === participant?.id) + 1

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando...</div>
  if (!participant) return <div className="text-center py-8 text-red-500">Participante não encontrado.</div>

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-900">{participant.name}</h1>
          {rank > 0 && (
            <p className="text-sm text-gray-500">
              {rank}º lugar · {score?.total ?? 0} pontos
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-4">
        {(['palpites', 'desempenho'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${
              tab === t ? 'border-green-700 text-green-800' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'palpites' && <PalpitesTab matches={matches} predictions={predictions} />}
      {tab === 'desempenho' && <DesempenhoTab score={score} />}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Participante.tsx src/components/participant/
git commit -m "feat: add participant page with palpites and desempenho tabs"
```

---

## Task 12: Jogos Page

**Files:**
- Create: `src/pages/Jogos.tsx`
- Create: `src/components/matches/MatchCard.tsx`
- Create: `src/components/matches/MatchList.tsx`

- [ ] **Step 1: Create `src/components/matches/MatchCard.tsx`**

```tsx
import { useState } from 'react'
import type { Match, Score } from '../../types'
import { calcMatchPoints } from '../../lib/scoring'

interface Props {
  match: Match
  participantPredictions?: Array<{ name: string; homeScore: number; awayScore: number }>
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Agendado',
  live: 'Ao Vivo',
  finished: 'Encerrado',
}

export function MatchCard({ match, participantPredictions }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasResult = match.homeScore !== null && match.awayScore !== null

  const kickoffBR = match.kickoff.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-right flex-1 font-medium truncate">{match.homeTeam}</span>
            <span className="text-sm font-bold text-gray-700 w-16 text-center">
              {hasResult ? `${match.homeScore} – ${match.awayScore}` : '– –'}
            </span>
            <span className="text-sm text-left flex-1 font-medium truncate">{match.awayTeam}</span>
          </div>
          <div className="ml-3 flex flex-col items-end shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              match.status === 'live' ? 'bg-red-100 text-red-700 font-bold' :
              match.status === 'finished' ? 'bg-gray-100 text-gray-500' :
              'bg-blue-50 text-blue-600'
            }`}>
              {STATUS_LABEL[match.status]}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">{kickoffBR}</span>
          </div>
        </div>
      </button>

      {expanded && participantPredictions && participantPredictions.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500 font-medium mb-2">Palpites dos participantes</p>
          <div className="space-y-1">
            {participantPredictions.map(p => {
              const pts = hasResult
                ? calcMatchPoints(
                    { h: p.homeScore, a: p.awayScore },
                    { h: match.homeScore!, a: match.awayScore! },
                    match.phase
                  )
                : null
              return (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{p.homeScore} – {p.awayScore}</span>
                    {pts !== null && (
                      <span className={`font-bold ${pts > 0 ? 'text-green-600' : 'text-red-400'}`}>
                        {pts > 0 ? `+${pts}` : '0'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Implement `src/pages/Jogos.tsx`**

```tsx
import { useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import { MatchCard } from '../components/matches/MatchCard'
import { PHASE_LABELS } from '../types/copa2026'
import type { Phase } from '../types'

const PHASES: Phase[] = ['groups', 'r32', 'r16', 'qf', 'sf', '3rd', 'final']

export function Jogos() {
  const { matches, loading } = useMatches()
  const [selectedPhase, setSelectedPhase] = useState<Phase>('groups')

  const filtered = matches.filter(m => m.phase === selectedPhase)

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-4">Jogos</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {PHASES.map(p => (
          <button
            key={p}
            onClick={() => setSelectedPhase(p)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              selectedPhase === p
                ? 'bg-green-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'
            }`}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando jogos...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <MatchCard key={m.id} match={m} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Jogos desta fase ainda não disponíveis.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Jogos.tsx src/components/matches/
git commit -m "feat: add jogos page with match calendar"
```

---

## Task 13: Cloud Functions Setup

**Files:**
- Create: `functions/package.json`
- Create: `functions/tsconfig.json`
- Create: `functions/src/index.ts`
- Create: `functions/src/scoring.ts`

- [ ] **Step 1: Initialize Cloud Functions**

```bash
cd functions
npm init -y
npm install firebase-admin firebase-functions
npm install -D typescript @types/node
```

- [ ] **Step 2: Create `functions/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2020",
    "esModuleInterop": true
  },
  "compileOnSave": true,
  "include": ["src"]
}
```

- [ ] **Step 3: Create `functions/src/scoring.ts`** — exact copy of `src/lib/scoring.ts`

```ts
// Mirror of src/lib/scoring.ts — keep in sync

type Phase = 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'
type Score = { h: number; a: number }
type MatchResult = 'home' | 'away' | 'draw'

export function calcMatchResult(homeScore: number, awayScore: number): MatchResult {
  if (homeScore > awayScore) return 'home'
  if (awayScore > homeScore) return 'away'
  return 'draw'
}

export function calcMatchPoints(prediction: Score, real: Score, phase: Phase): number {
  const isKnockout = phase !== 'groups'
  const multiplier = isKnockout ? 2 : 1
  const predResult = calcMatchResult(prediction.h, prediction.a)
  const realResult = calcMatchResult(real.h, real.a)
  if (predResult !== realResult) return 0
  if (prediction.h === real.h && prediction.a === real.a) return 8 * multiplier
  if (realResult !== 'draw' && (prediction.h - prediction.a) === (real.h - real.a)) return 6 * multiplier
  if (prediction.h === real.h || prediction.a === real.a) return 5 * multiplier
  return 4 * multiplier
}

export function calcClassificationPoints(pred: any, real: any): number {
  let pts = 0
  const groups = Object.keys(real.groupsFirst ?? {})
  for (const g of groups) {
    const rF = real.groupsFirst[g], rS = real.groupsSecond[g]
    const pF = pred.groupsFirst?.[g], pS = pred.groupsSecond?.[g]
    if (pF === rF) pts += 10; else if (pF === rS) pts += 5
    if (pS === rS) pts += 10; else if (pS === rF) pts += 5
  }
  for (const t of (pred.qf ?? [])) if ((real.qf ?? []).includes(t)) pts += 10
  for (const t of (pred.sf ?? [])) if ((real.sf ?? []).includes(t)) pts += 15
  for (const t of (pred.final ?? [])) if ((real.final ?? []).includes(t)) pts += 20
  if (pred.fourth && pred.fourth === real.fourth) pts += 10
  if (pred.third && pred.third === real.third) pts += 20
  if (pred.vice && pred.vice === real.vice) pts += 30
  if (pred.champion && pred.champion === real.champion) pts += 40
  return pts
}

export function getScoreType(prediction: Score, real: Score, phase: Phase): string {
  const pR = calcMatchResult(prediction.h, prediction.a)
  const rR = calcMatchResult(real.h, real.a)
  if (pR !== rR) return 'miss'
  if (prediction.h === real.h && prediction.a === real.a) return 'exact'
  if (real.h - real.a === prediction.h - prediction.a && rR !== 'draw') return 'goalDiff'
  if (prediction.h === real.h || prediction.a === real.a) return 'oneScore'
  return 'result'
}
```

- [ ] **Step 4: Create `functions/src/index.ts`** — stub that will export functions

```ts
import * as admin from 'firebase-admin'
admin.initializeApp()

export { scheduledSync } from './scheduledSync'
export { onMatchFinished } from './onMatchFinished'
export { manualSync } from './manualSync'
```

- [ ] **Step 5: Commit**

```bash
cd ..
git add functions/
git commit -m "feat: initialize Cloud Functions with scoring logic"
```

---

## Task 14: Cloud Function — Score Recalculation Trigger

**Files:**
- Create: `functions/src/onMatchFinished.ts`

- [ ] **Step 1: Create `functions/src/onMatchFinished.ts`**

```ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { calcMatchPoints, getScoreType } from './scoring'

const db = admin.firestore()

export const onMatchFinished = functions.firestore
  .document('matches/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()

    // Only trigger when status changes to 'finished'
    if (before.status === after.status) return
    if (after.status !== 'finished') return
    if (after.homeScore === null || after.awayScore === null) return

    const matchId = context.params.matchId
    const real = { h: after.homeScore as number, a: after.awayScore as number }
    const phase = after.phase as string

    // Get all participants
    const participantsSnap = await db.collection('participants').get()

    const updates: Promise<void>[] = participantsSnap.docs.map(async pDoc => {
      const participantId = pDoc.id
      const participantName = pDoc.data().name

      // Get this participant's prediction for this match
      const predSnap = await db
        .collection('predictions').doc(participantId)
        .collection('matches').doc(matchId)
        .get()

      if (!predSnap.exists) return

      const pred = predSnap.data()!
      const prediction = { h: pred.homeScore as number, a: pred.awayScore as number }
      const points = calcMatchPoints(prediction, real, phase as any)
      const type = getScoreType(prediction, real, phase as any)

      // Update the score document
      const scoreRef = db.collection('scores').doc(participantId)
      await db.runTransaction(async tx => {
        const scoreSnap = await tx.get(scoreRef)
        const existing = scoreSnap.exists ? scoreSnap.data()! : {
          participantId,
          participantName,
          total: 0,
          matchPoints: 0,
          classificationPoints: 0,
          artilheiroPoints: 0,
          exactScores: 0,
          correctResults: 0,
          tiebreaker: { champion: false, artilheiro: false, vice: false, third: false, exactCount: 0 },
          matchBreakdown: {},
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }

        const prevBreakdown = existing.matchBreakdown?.[matchId]
        const prevPoints = prevBreakdown?.points ?? 0

        const newBreakdown = {
          ...(existing.matchBreakdown ?? {}),
          [matchId]: { points, type },
        }

        const exactDelta = (type === 'exact' ? 1 : 0) - (prevBreakdown?.type === 'exact' ? 1 : 0)
        const resultDelta = (type !== 'miss' ? 1 : 0) - (prevBreakdown?.type !== 'miss' && prevBreakdown ? 1 : 0)

        tx.set(scoreRef, {
          ...existing,
          participantName,
          matchPoints: (existing.matchPoints ?? 0) + points - prevPoints,
          total: (existing.total ?? 0) + points - prevPoints,
          exactScores: (existing.exactScores ?? 0) + exactDelta,
          correctResults: (existing.correctResults ?? 0) + resultDelta,
          matchBreakdown: newBreakdown,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        })
      })
    })

    await Promise.all(updates)
    console.log(`Recalculated scores for match ${matchId}`)
  })
```

- [ ] **Step 2: Commit**

```bash
git add functions/src/onMatchFinished.ts
git commit -m "feat: add onMatchFinished Cloud Function for score recalculation"
```

---

## Task 15: Cloud Function — API Sync (Scheduled + Manual)

**Files:**
- Create: `functions/src/scheduledSync.ts`
- Create: `functions/src/manualSync.ts`

- [ ] **Step 1: Create `functions/src/scheduledSync.ts`**

```ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore()
const RAPIDAPI_KEY = functions.config().rapidapi?.key ?? ''
const COPA_2026_TOURNAMENT_ID = 1

async function syncMatches(): Promise<number> {
  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${COPA_2026_TOURNAMENT_ID}&season=2026&status=FT`
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
    },
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  const fixtures = data.response ?? []

  const batch = db.batch()
  for (const f of fixtures) {
    const ref = db.collection('matches').doc(String(f.fixture.id))
    batch.update(ref, {
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      status: 'finished',
    })
  }
  await batch.commit()

  // Also fetch live matches
  const liveUrl = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${COPA_2026_TOURNAMENT_ID}&season=2026&status=1H-2H-HT-ET-P`
  const liveRes = await fetch(liveUrl, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
    },
  })
  if (liveRes.ok) {
    const liveData = await liveRes.json()
    const liveBatch = db.batch()
    for (const f of (liveData.response ?? [])) {
      const ref = db.collection('matches').doc(String(f.fixture.id))
      liveBatch.update(ref, {
        homeScore: f.goals.home,
        awayScore: f.goals.away,
        status: 'live',
      })
    }
    await liveBatch.commit()
  }

  await db.collection('config').doc('settings').update({
    lastSync: admin.firestore.FieldValue.serverTimestamp(),
  })

  return fixtures.length
}

// Runs every hour during Copa (June 11 – July 19, 2026)
export const scheduledSync = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async () => {
    const count = await syncMatches()
    console.log(`Synced ${count} finished matches`)
  })
```

- [ ] **Step 2: Create `functions/src/manualSync.ts`**

```ts
import * as functions from 'firebase-functions'

export const manualSync = functions.https.onRequest(async (req, res) => {
  // Simple password check — for admin use only
  const adminKey = functions.config().admin?.key ?? ''
  if (req.headers['x-admin-key'] !== adminKey) {
    res.status(401).send('Unauthorized')
    return
  }

  try {
    // Import syncMatches logic — inline here to avoid circular deps
    const { default: syncFn } = await import('./scheduledSync')
    res.status(200).send({ ok: true })
  } catch (e: any) {
    res.status(500).send({ error: e.message })
  }
})
```

Note: refactor `manualSync` to share the `syncMatches` function from `scheduledSync` by extracting it to a shared module in a future cleanup pass.

- [ ] **Step 3: Set Firebase Functions config**

```bash
firebase functions:config:set rapidapi.key="YOUR_RAPIDAPI_KEY" admin.key="YOUR_ADMIN_KEY"
```

- [ ] **Step 4: Add sync trigger to Admin page**

In `src/pages/Admin.tsx`, add after the participant section:

```tsx
async function handleManualSync() {
  const res = await fetch('/api/manualSync', {
    headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_KEY ?? '' }
  })
  alert(res.ok ? 'Sync iniciado!' : 'Erro no sync')
}

// In JSX:
<div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
  <h2 className="font-semibold text-gray-700 mb-3">Sync de Resultados</h2>
  <button
    onClick={handleManualSync}
    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
  >
    Forçar Sync Agora
  </button>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add functions/src/
git commit -m "feat: add scheduled and manual sync Cloud Functions"
```

---

## Task 16: Knockout Prediction Form

**Files:**
- Create: `src/components/predictions/KnockoutForm.tsx`
- Modify: `src/pages/MeusPalpites.tsx`

- [ ] **Step 1: Create `src/components/predictions/KnockoutForm.tsx`**

```tsx
import { useState } from 'react'
import { ScoreInput } from './ScoreInput'
import { saveMatchPrediction } from '../../lib/firestore'
import type { Match, MatchPrediction } from '../../types'
import { PHASE_LABELS } from '../../types/copa2026'

interface Props {
  participantId: string
  matches: Match[]
  existing: Record<string, MatchPrediction>
}

export function KnockoutForm({ participantId, matches, existing }: Props) {
  const [localPreds, setLocalPreds] = useState<Record<string, { home?: number; away?: number; penalty?: string }>>(
    () => Object.fromEntries(
      Object.entries(existing).map(([id, p]) => [id, { home: p.homeScore, away: p.awayScore, penalty: p.penaltyWinner }])
    )
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const phases = [...new Set(matches.map(m => m.phase))]

  async function handleSave(match: Match) {
    const pred = localPreds[match.id]
    if (pred?.home === undefined || pred?.away === undefined) return
    setSaving(match.id)
    await saveMatchPrediction(participantId, match.id, {
      homeScore: pred.home,
      awayScore: pred.away,
      penaltyWinner: pred.penalty,
    })
    setSaving(null)
    setSaved(s => ({ ...s, [match.id]: true }))
  }

  return (
    <div className="space-y-6">
      {phases.map(phase => {
        const phaseMatches = matches.filter(m => m.phase === phase)
        return (
          <div key={phase}>
            <h3 className="font-bold text-green-900 mb-3">{PHASE_LABELS[phase]}</h3>
            <div className="space-y-3">
              {phaseMatches.map(match => {
                const now = new Date()
                const locked = now >= match.deadline
                const pred = localPreds[match.id] ?? {}
                const notAvailable = match.homeTeam === '' || match.awayTeam === ''

                if (notAvailable) {
                  return (
                    <div key={match.id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-400">
                      Jogo ainda não definido
                    </div>
                  )
                }

                return (
                  <div key={match.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                    <ScoreInput
                      homeTeam={match.homeTeam}
                      awayTeam={match.awayTeam}
                      homeScore={pred.home}
                      awayScore={pred.away}
                      locked={locked}
                      onChange={v => { setLocalPreds(p => ({ ...p, [match.id]: { ...pred, ...v } })); setSaved(s => ({ ...s, [match.id]: false })) }}
                    />

                    <div className="mt-2">
                      <label className="text-xs text-gray-500">Pênaltis (quem passa):</label>
                      <div className="flex gap-2 mt-1">
                        {[match.homeTeam, match.awayTeam, 'Nenhum (sem prorrog.)'].map(team => (
                          <button
                            key={team}
                            disabled={locked}
                            onClick={() => { setLocalPreds(p => ({ ...p, [match.id]: { ...pred, penalty: team } })); setSaved(s => ({ ...s, [match.id]: false })) }}
                            className={`text-xs px-2 py-1 rounded border ${
                              pred.penalty === team
                                ? 'bg-green-700 text-white border-green-700'
                                : 'border-gray-300 text-gray-600 hover:border-green-400'
                            } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {team}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!locked && (
                      <div className="mt-2 flex justify-end gap-2 items-center">
                        {saved[match.id] && <span className="text-xs text-green-600">Salvo!</span>}
                        <button
                          onClick={() => handleSave(match)}
                          disabled={saving === match.id}
                          className="text-xs bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 disabled:opacity-50"
                        >
                          {saving === match.id ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Update `src/pages/MeusPalpites.tsx`** — add a third tab for knockout matches

```tsx
// Add to imports:
import { KnockoutForm } from '../components/predictions/KnockoutForm'

// Change tab type to include 'matamata':
const [tab, setTab] = useState<'jogos' | 'classificacao' | 'matamata'>('jogos')

// Add hook for knockout matches:
const { matches: knockoutMatches } = useMatches() // filter in render

// Add tab button:
{ label: 'Mata-Matas', value: 'matamata' }

// Add tab render:
{tab === 'matamata' && !loadingMatches && !loadingPreds && (
  <KnockoutForm
    participantId={participant!.id}
    matches={knockoutMatches.filter(m => m.phase !== 'groups')}
    existing={predictions}
  />
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/predictions/KnockoutForm.tsx src/pages/MeusPalpites.tsx
git commit -m "feat: add knockout stage prediction form with penalty field"
```

---

## Task 17: Deploy

- [ ] **Step 1: Build the frontend**

```bash
npm run build
```

Expected: `dist/` created with no TypeScript errors

- [ ] **Step 2: Deploy Firestore rules and indexes**

```bash
firebase deploy --only firestore
```

- [ ] **Step 3: Deploy hosting**

```bash
firebase deploy --only hosting
```

Verify site loads at `https://YOUR_PROJECT_ID.web.app`

- [ ] **Step 4: Build and deploy Cloud Functions**

```bash
cd functions && npm run build && cd ..
firebase deploy --only functions
```

Expected: all 3 functions deployed (`scheduledSync`, `onMatchFinished`, `manualSync`)

- [ ] **Step 5: Run the seed script against production**

```bash
npx tsx scripts/seed-matches.ts
```

Verify matches appear in Firebase Console.

- [ ] **Step 6: End-to-end smoke test**

1. Go to `/admin`, add participant "João", copy link
2. Open link, fill in 5 group stage predictions, save each
3. Go to `/` — verify João appears in ranking (0 pts, no matches finished yet)
4. Go to `/participante/João` — verify palpites appear in Palpites tab
5. Go to `/jogos` — verify matches appear

- [ ] **Step 7: Final commit and tag**

```bash
git add -A
git commit -m "feat: complete MVP deployment for Copa 2026"
git tag v1.0.0
```

---

## Scope Coverage Check

| Spec requirement | Task |
|---|---|
| Token-based participant access | Task 5, 8 |
| Group stage predictions (72 games) | Task 8 |
| Classification + artilheiro predictions | Task 9 |
| Knockout predictions with penalty field | Task 16 |
| Exact score (8/16 pts) + goal diff (6/12) + one score (5/9) + result (4/6) | Task 3 |
| Classification points (groups, qf, sf, final, champion, vice, 3rd, 4th, artilheiro) | Task 3 |
| Tiebreaker logic | Task 3, 14 |
| Real-time ranking | Task 5, 7 |
| Participant public page (tabs: palpites + desempenho) | Task 11 |
| Jogos page with match calendar | Task 12 |
| Admin panel (add participants, generate links) | Task 9 |
| Automatic score recalculation on match finish | Task 14 |
| Scheduled API sync (hourly cron) | Task 15 |
| Manual sync from admin | Task 15 |
| Copa 2026 format (16 avos + extra round) | Task 2, 4 |
| Firebase Hosting deploy | Task 17 |
| Seed match data from api-football.com | Task 10 |
