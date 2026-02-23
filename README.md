# ZIVRO

ZIVRO is a real-time random video chat platform with stranger matching, one-to-one WebRTC calls, and in-call text chat.

This repository is split into:
- `client/`: React + Vite frontend
- `server/`: Node.js + Express + Socket.IO + Redis backend

## Features

- Random stranger matching using an atomic Redis queue
- One-to-one video/audio chat using WebRTC
- In-call text messaging
- `Next` behavior that requeues both users
- `Leave`/disconnect behavior that requeues only the partner
- Dark/light mode toggle on landing page
- Media permission gate and terms acceptance gate before joining queue
- Health endpoint for backend uptime/Redis checks

## Architecture Overview

- Signaling and matchmaking run through Socket.IO on the backend.
- Media flows peer-to-peer via WebRTC between users.
- Redis stores queue state, room relationships, and temporary user profile data.

### High-level flow

1. User opens frontend and submits profile (name, gender, region).
2. User grants camera/mic permission and accepts terms.
3. Frontend emits `join-queue`.
4. Backend enqueues user in Redis and tries to match in pairs.
5. On match, backend emits `matched` to both users with role (`isInitiator`).
6. Peers exchange WebRTC offer/answer/ICE via `signal` events.
7. Users can chat (`chat-message`), skip (`next`), or leave (`leave-queue`).

## Tech Stack

### Frontend (`client/`)

- React 19
- Vite 7
- Tailwind CSS 3
- Socket.IO client 4
- WebRTC APIs (`RTCPeerConnection`)
- Lucide React icons

### Backend (`server/`)

- Node.js (CommonJS)
- Express 5
- Socket.IO 4
- Redis (ioredis)
- Helmet, CORS, Morgan, Dotenv

## Repository Structure

```text
Zivro/
  client/
    src/
      components/
        StartChat.jsx
        MediaPermissionModal.jsx
        TermsModal.jsx
        Loader.jsx
        VideoChat.jsx
      socket/socket.js
      webrtc/peer.js
      App.jsx
      main.jsx
      index.css
    package.json
    vite.config.js
    tailwind.config.js
    vercel.json
    .env
  server/
    index.js
    socket-handler.js
    queue.js
    redis.js
    package.json
    .env
  .gitignore
```

## Environment Variables

### Backend (`server/.env`)

Required:

- `REDIS_URL`: Redis connection URL (example: `redis://127.0.0.1:6379`)
- `CLIENT_URL`: Allowed frontend origin for CORS/Socket.IO

Optional:

- `PORT`: Backend port (default: `5000`)
- `NODE_ENV`: Environment mode (default: `production`)
- `LOG_LEVEL`: Present in `.env`, currently not used in code

Notes:
- `redis.js` supports `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, but `index.js` currently exits if `REDIS_URL` is missing.

### Frontend (`client/.env`)

Required:

- `VITE_BACKEND_URL`: Backend base URL for Socket.IO client

Optional:

- `VITE_APP_ENV`: Present in `.env`, currently not used in code

## Local Development Setup

## 1) Prerequisites

- Node.js 18+
- npm
- Redis server

## 2) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

## 3) Configure env files

Backend (`server/.env`) example:

```env
NODE_ENV=development
PORT=5000
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
```

Frontend (`client/.env`) example:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_APP_ENV=development
```

## 4) Start services

Start backend:

```bash
cd server
node index.js
```

Start frontend:

```bash
cd client
npm run dev
```

Frontend dev URL: `http://localhost:5173`

## Backend API and Socket Contract

### HTTP endpoint

- `GET /health`
  - `200`: `{ status: "ok", env, uptime }`
  - `503`: `{ status: "redis-down" }`

### Client -> Server Socket events

- `join-queue` with payload:
  - `{ name, gender, region }`
- `next` (no payload)
- `leave-queue` (no payload)
- `signal` with payload:
  - `{ to, data }`
- `chat-message` with payload:
  - `{ message }`

### Server -> Client Socket events

- `matched`:
  - `{ roomId, partnerId, partnerName, isInitiator }`
- `partner-left`:
  - `{ reason: "next" | "leave" | "disconnect" }`
- `signal`:
  - `{ from, data }`
- `chat-message`:
  - `{ from, message, timestamp }`

## Redis Data Model and Matchmaking

Queue and room state keys:

- `zivro:queue:list` (Redis list)
- `zivro:queue:set` (Redis set for de-duplication)
- `zivro:rooms` (hash: user -> partner)
- `zivro:room_details` (hash: user -> roomId)
- `zivro:user:{socketId}` (string JSON with TTL, default 10 minutes)

Atomic behavior (Lua-backed):

- `tryMatch()`: pops two users and creates pair/room mappings atomically.
- `nextPairAtomic()`: removes both users from current room and requeues both.
- `endCallAtomic()`: removes caller fully and requeues only partner.

## Frontend State Flow

`App.jsx` status transitions:

- `idle` -> `permissions` -> `terms` -> `queue` -> `chat`

Control behavior:

- `Cancel` in queue calls `leaveQueue()` and resets to home.
- `Next` in chat emits `next` and returns to queue UI.
- `End call` emits `leave-queue` and resets to home.

## Deployment Notes

- Frontend includes `vercel.json` for Vercel build output (`dist`).
- Backend is configured for Render-style deployment:
  - Binds `0.0.0.0`
  - Has `/health` check
  - Graceful shutdown on `SIGINT`/`SIGTERM`

Recommended production env:

- Backend:
  - `CLIENT_URL=https://<your-frontend-domain>`
  - `REDIS_URL=<managed-redis-url>`
  - `NODE_ENV=production`
- Frontend:
  - `VITE_BACKEND_URL=https://<your-backend-domain>`

## Security and Reliability Notes

- CORS restricted to `CLIENT_URL`
- Helmet enabled (CSP disabled explicitly)
- Socket signaling is partner-validated (`partner === to`)
- Chat messages are trimmed and capped to 500 chars server-side
- Redis reconnect strategy and readiness hooks included
- Graceful shutdown closes Socket.IO, HTTP server, and Redis

## Known Gaps / Improvements

- `server/package.json` has no `start`/`dev` script (only placeholder `test`).
- `cleanupStaleUsers()` exists in `queue.js` but is not scheduled/invoked.
- `client/index.html` links `/src/style.css`, but that file is not present.
- TURN credentials in `client/src/webrtc/peer.js` are public/test credentials; use private TURN for production.
- No automated tests are currently configured.

## Useful Commands

Frontend:

```bash
cd client
npm run dev
npm run build
npm run preview
npm run lint
```

Backend:

```bash
cd server
node index.js
```

## License

No root license file is included in this repository. Backend `package.json` currently lists `ISC`.

