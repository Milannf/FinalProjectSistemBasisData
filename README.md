# 🎰 Jokris99 — Premium Casino Platform

> Virtual coins only. Not real gambling.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TailwindCSS + Zustand + Recharts |
| Backend | Node.js + Express + Socket.IO |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Cache/Realtime | Redis + Socket.IO |

---

## Prerequisites

- Node.js 18+
- PostgreSQL (Neon account at [neon.tech](https://neon.tech))
- Redis (local or [Upstash](https://upstash.com))

---

## Setup

### 1. Clone & enter project

```bash
cd Casino
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://user:pass@your-neon-host/casino?sslmode=require"
REDIS_URL="redis://localhost:6379"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

Push schema to Neon:

```bash
npx prisma db push
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed 20 dummy players:

```bash
npm run db:seed
```

Start backend:

```bash
npm run dev
```

Backend runs on → `http://localhost:3001`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on → `http://localhost:5173`

---

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero, leaderboard preview, player select |
| `/casino` | Casino — slot machine, spin, RTP meter |
| `/leaderboard` | Leaderboard — realtime rankings |
| `/analytics` | Analytics — charts, session stats |
| `/admin` | Admin — debug tools, RTP control, Redis |

---

## API Endpoints

```
GET    /api/player              — all players
GET    /api/player/:id          — single player
GET    /api/player/:id/history  — round history
GET    /api/player/:id/stats    — full stats

POST   /api/game/spin           — { playerId, betAmount }
POST   /api/game/start-session  — { playerId }
POST   /api/game/end-session    — { playerId, sessionId }

GET    /api/rtp/:playerId       — RTP profile
POST   /api/rtp/reset/:playerId — reset RTP

GET    /api/leaderboard?metric= — profit | highestWin | mostActive

POST   /api/admin/simulate-spins      — { playerId, count }
GET    /api/admin/system-stats
POST   /api/admin/force-win-streak    — { playerId, streakLength }
POST   /api/admin/force-lose-streak   — { playerId, streakLength }
GET    /api/admin/inspect-redis
```

---

## Socket.IO Events

```
leaderboard:update   — top players array
player:spin          — { playerId, outcome, betAmount }
player:win           — full result object
player:lose          — full result object
player:balance       — { playerId, newBalance }
player:streak        — { type, count }
system:onlineCount   — { count }
system:bigWin        — { username, payout, multiplier }
feed:recentWins      — recent wins array
```

---

## Dynamic RTP Engine

Base win rate: **45%**

Modifiers applied in order:
1. **Losing streak** → win rate increases up to +12%
2. **Winning streak** → win rate decreases up to -12%
3. **Session fatigue** → longer sessions = worse odds
4. **Pity system** → guaranteed win after 15 consecutive losses
5. **Sympathy** → near-bankrupt players get +15–25% boost
6. **Onboarding** → new players get +12% for first 10 rounds

Win rate is clamped between **15%** and **75%**.

---

## Redis Keys

| Key | Type | Usage |
|---|---|---|
| `leaderboard:profit` | Sorted Set | Top profit rankings |
| `leaderboard:highestWin` | Sorted Set | Biggest single win |
| `leaderboard:mostActive` | Sorted Set | Total rounds played |
| `session:{id}` | String | Active player session |
| `rtp:{id}` | String | Cached RTP profile |
| `cooldown:{id}` | String | Spin cooldown (1.5s) |
| `online:players` | Set | Connected player IDs |
| `feed:wins` | List | Recent win feed |
| `feed:streaks` | Sorted Set | Hot streaks |
