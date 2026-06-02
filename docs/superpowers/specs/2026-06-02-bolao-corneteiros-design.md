# Bolão dos Corneteiros — Copa do Mundo FIFA 2026

**Data:** 2026-06-02  
**Status:** Aprovado

---

## Visão Geral

Site web para o bolão **Bolão dos Corneteiros** da Copa do Mundo FIFA 2026, entre amigos (11–30 participantes). Cada participante acessa via link único (token na URL) para registrar seus palpites. A página pública central exibe o ranking em tempo real, resultados dos jogos e artilharia. Resultados são buscados automaticamente de uma API de futebol via Cloud Function com cron horário.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript |
| Estilização | Tailwind CSS |
| Banco de dados | Firebase Firestore |
| Hospedagem | Firebase Hosting |
| Automação | Firebase Cloud Functions (cron + triggers) |
| API de futebol | api-football.com (via RapidAPI) |
| Autenticação admin | Senha simples (hash no Firestore) |
| Acesso participante | Token único na URL (sem login) |

---

## Páginas

### 1. Ranking Geral — `/` (pública)
- Tabela de classificação ao vivo: posição, nome, pontos totais, placares exatos, resultados certos
- Próximos jogos com horário (fuso Brasil) e prazo para palpitar
- Seção de artilharia: palpite de cada participante + gols do artilheiro real (quando disponível)
- Critérios de desempate visíveis

### 2. Página do Participante — `/participante/:nome` (pública)
Duas abas:

**Aba "Palpites":**
- Todos os palpites do participante (fase de grupos + classificação + artilheiro + mata-matas)
- Resultado real ao lado de cada palpite após o jogo encerrar
- Pontos recebidos por jogo

**Aba "Desempenho":**
- Histórico jogo a jogo: palpite vs. resultado real, pontos ganhos, motivo (placar exato / diferença certa / um escore certo / só resultado / errou)
- Resumo por categoria: total de placares exatos, resultados certos, pontos de classificação, artilheiro
- Posição nos critérios de desempate: campeão, artilheiro, vice, 3º lugar — acertou ou não
- Posição atual no ranking

### 3. Meus Palpites — `/p/:token` (token protegido, edição)
- **Fase de grupos:** formulário com todos os 72 jogos de uma vez. Prazo: até o início do primeiro jogo da Copa.
- **Classificação (fase de grupos):** 1º e 2º lugar de cada grupo (A–L), 3º e 4º geral, campeão, vice, artilheiro. Mesmo prazo dos grupos.
- **Mata-matas (16 avos em diante):** jogos liberam quando os times são confirmados. Prazo: 1 hora antes do apito. Campo obrigatório de pênaltis (quem passa) em todos os mata-matas.
- Campos bloqueados após o prazo.
- Link no topo para ver `/participante/:nome` (modo leitura).

### 4. Jogos — `/jogos` (pública)
- Calendário completo filtrado por fase e grupo
- Resultado real, status (agendado / em jogo / encerrado), horário Brasil
- Ao expandir um jogo: palpites de todos os participantes + pontos recebidos por cada um

### 5. Painel Admin — `/admin` (protegido por senha)
- Adicionar/remover participantes; gerar e regenerar token (link único)
- Copiar link para enviar ao participante
- Forçar sync manual com a API de futebol
- Definir artilheiro oficial ao encerramento da Copa
- Log das últimas sincronizações

---

## Modelo de Dados (Firestore)

### `participants/{participantId}`
```
name: string
token: string  // único, usado na URL
createdAt: timestamp
```

### `matches/{matchId}`
```
phase: "groups" | "r32" | "r16" | "qf" | "sf" | "3rd" | "final"
group: string?         // "A"–"L", apenas fase de grupos
homeTeam: string
awayTeam: string
homeScore: number | null
awayScore: number | null
kickoff: timestamp
status: "scheduled" | "live" | "finished"
deadline: timestamp    // início da Copa para grupos; 1h antes do kickoff para mata-matas
apiId: string          // ID na api-football.com
```

### `predictions/{participantId}/matches/{matchId}`
```
homeScore: number
awayScore: number
penaltyWinner: string?  // obrigatório em r32, r16, qf, sf, final
submittedAt: timestamp
```

### `predictions/{participantId}/extras/artilheiro`
```
player: string
team: string
```

### `predictions/{participantId}/extras/classificacao`
```
groupsFirst: { A: string, B: string, …, L: string }   // 1º de cada grupo
groupsSecond: { A: string, B: string, …, L: string }  // 2º de cada grupo
qf: string[]    // 8 times classificados para as quartas
sf: string[]    // 4 times para as semis
final: string[] // 2 finalistas
champion: string
vice: string
third: string
fourth: string
```

### `scores/{participantId}`
```
total: number
matchPoints: number
classificationPoints: number
artilheiroPoints: number        // 0 ou 25
exactScores: number             // contagem de placares exatos
correctResults: number          // contagem de resultados certos
tiebreaker: {
  champion: boolean,
  artilheiro: boolean,
  vice: boolean,
  third: boolean,
  exactCount: number
}
matchBreakdown: {
  [matchId]: { points: number, type: "exact"|"goalDiff"|"oneScore"|"result"|"miss" }
}
lastUpdated: timestamp
```

### `config/settings`
```
artilheiro: string | null       // definido pelo admin ao final da Copa
lastSync: timestamp
copaStartDate: timestamp        // prazo para palpites da fase de grupos
```

---

## Regras de Pontuação

### Por Jogo

**Fase de Grupos (72 jogos):**
| Acerto | Pontos |
|---|---|
| Placar exato | 8 |
| Resultado + diferença de gols (não empate) | 6 |
| Resultado + gols de 1 dos times | 5 |
| Só o resultado (vit/emp/der) | 4 |
| Errou o resultado | 0 |

**16 avos, Oitavas, Quartas, Semis, Final (32 jogos):**
| Acerto | Pontos |
|---|---|
| Placar exato | 16 |
| Resultado + diferença de gols (não empate) | 12 |
| Resultado + gols de 1 dos times | 9 |
| Só o resultado | 6 |
| Errou o resultado | 0 |

**Regra pênaltis:** resultado válido apenas durante 90min + prorrogação. Pênaltis não alteram o placar. O campo "quem passa nos pênaltis" é obrigatório a partir dos 16 avos — não gera pontos, apenas registra o avanço para pontuação de classificação.

### Por Classificação
| Acerto | Pontos |
|---|---|
| Time 1º ou 2º do grupo na posição correta | 10 por time |
| Time 1º ou 2º do grupo na posição errada | 5 por time |
| Time classificado para as Quartas | 10 por time |
| Time classificado para as Semis | 15 por time |
| Time classificado para a Final | 20 por time |
| 4º lugar certo | 10 |
| 3º lugar certo | 20 |
| Vice-Campeão certo | 30 |
| Campeão certo | 40 |
| Artilheiro certo | 25 |

### Critérios de Desempate (em ordem)
1. Quem acertou o Campeão
2. Quem acertou o Artilheiro
3. Quem acertou o Vice-Campeão
4. Quem acertou o Terceiro Lugar
5. Maior número de placares exatos
6. Divisão do prêmio

---

## Automação (Cloud Functions)

### Cron de resultados (`scheduledSync`)
- Frequência: a cada hora durante o período da Copa
- Busca jogos com status `live` ou recém-encerrados na api-football.com
- Atualiza `matches/{matchId}` com placar e status
- Dispara recálculo de pontuação para todos os participantes

### Trigger de recálculo (`onMatchFinished`)
- Disparado quando `matches/{matchId}.status` muda para `"finished"`
- Lê todos os palpites daquele jogo
- Calcula pontos para cada participante conforme regras acima
- Atualiza `scores/{participantId}.matchBreakdown` e totais
- Atualiza classificação de forma incremental

### Recálculo de classificação (`recalcClassification`)
- Roda ao final de cada fase (grupos, 16 avos, oitavas, quartas, semis, final)
- Compara classificação real com palpites de classificação
- Atualiza `scores/{participantId}.classificationPoints`

### Sync manual (HTTP Function)
- Endpoint protegido chamado pelo painel admin
- Mesma lógica do cron, mas executado sob demanda

---

## Formato Copa 2026

A Copa 2026 tem 48 seleções e uma rodada extra em relação à Copa 2022:

| Fase | Times | Jogos | Pontuação |
|---|---|---|---|
| Fase de Grupos | 48 (12 grupos de 4) | 72 | Tabela grupos |
| 16 avos de final | 32 | 16 | Tabela mata-matas |
| Oitavas de final | 16 | 8 | Tabela mata-matas |
| Quartas de final | 8 | 4 | Tabela mata-matas |
| Semifinais | 4 | 2 | Tabela mata-matas |
| Disputa 3º lugar | 2 | 1 | Tabela mata-matas |
| Final | 2 | 1 | Tabela mata-matas |
| **Total** | | **104** | |

**Classificação para os 16 avos:** Top 2 de cada grupo (24 times) + 8 melhores 3ºs colocados. Os participantes palpitam 1º e 2º de cada grupo; os wildcards dos 3ºs colocados são calculados automaticamente pelo sistema.

---

## Acesso e Segurança

- **Participante:** acessa `/p/:token` para editar palpites. Token é uma string aleatória de 12 caracteres gerada pelo admin. Sem login ou cadastro.
- **Visualização:** qualquer pessoa pode ver `/participante/:nome`, `/jogos`, `/` sem token.
- **Admin:** acessa `/admin` com senha. Hash da senha fica no Firestore (`config/settings`).
- **Firestore Rules:** escrita em `predictions/{participantId}` só permitida com token válido do participante. Leitura pública. Admin usa Firebase Admin SDK nas Cloud Functions.

---

## Fora de Escopo

- Envio de ranking diário por email (era da Copa 2022, não será implementado)
- Sistema de pagamento de premiação
- Chat ou comentários
- App mobile nativo
