# 🎥 ZIVRO

> Real-time random video chat — meet strangers instantly with one-to-one WebRTC calls and live text messaging.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎲 Random Matching | Atomic Redis queue pairs strangers instantly |
| 📹 Video & Audio | Peer-to-peer WebRTC calls — no media touches the server |
| 💬 In-call Chat | Real-time text messaging during your video session |
| ⏭ Skip & Requeue | `Next` requeues both users; `Leave` requeues only your partner |
| 🌗 Dark / Light Mode | Theme toggle on the landing page |
| 🔒 Permission Gate | Camera/mic permission and terms acceptance required before joining |
| 🩺 Health Endpoint | Backend uptime + Redis status check built in |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     Browser (React)                  │
│  StartChat → Permissions → Terms → Queue → VideoChat │
└────────────────────┬────────────────────────────────┘
                     │  Socket.IO (signaling)
┌────────────────────▼────────────────────────────────┐
│             Backend (Node.js + Socket.IO)            │
│         Matchmaking · Signaling · Chat relay         │
└────────────────────┬────────────────────────────────┘
                     │  ioredis
┌────────────────────▼────────────────────────────────┐
│                      Redis                           │
│         Queue · Rooms · Temporary user data          │
└─────────────────────────────────────────────────────┘
              ↕ WebRTC (peer-to-peer media)
         Browser ◄────────────────────► Browser
```

### High-level Call Flow

1. User submits profile *(name, gender, region)* on the landing page
2. Camera/mic permission granted → terms accepted
3. Frontend emits `join-queue`
4. Backend enqueues user in Redis and attempts atomic pair matching
5. On match, both users receive `matched` event with role (`isInitiator`)
6. Peers exchange WebRTC offer / answer / ICE candidates via `signal` events
7. Users can chat (`chat-message`), skip (`next`), or leave (`leave-queue`)

---

## 🛠 Tech Stack

### Frontend — `client/`

- **React 19** + **Vite 7**
- **Tailwind CSS 3**
- **Socket.IO Client 4**
- **WebRTC** (`RTCPeerConnection`)
- **Lucide React** icons

### Backend — `server/`

- **Node.js** (CommonJS) + **Express 5**
- **Socket.IO 4**
- **Redis** via `ioredis`
- **Helmet · CORS · Morgan · Dotenv**

---

## 📁 Repository Structure

```text
Zivro/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StartChat.jsx
│   │   │   ├── MediaPermissionModal.jsx
│   │   │   ├── TermsModal.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── VideoChat.jsx
│   │   ├── socket/socket.js
│   │   ├── webrtc/peer.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
└── server/
    ├── index.js
    ├── socket-handler.js
    ├── queue.js
    ├── redis.js
    └── package.json
```

---

## ⚙️ Local Development Setup

### Prerequisites

- Node.js `18+`
- npm
- A running Redis server

### 1. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Configure Environment

**`server/.env`**
```env
NODE_ENV=development
PORT=5000
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_APP_ENV=development
```

### 3. Start Services

```bash
# Terminal 1 — Backend
cd server && node index.js

# Terminal 2 — Frontend
cd client && npm run dev
```

Frontend runs at **`http://localhost:5173`**

---

## 🔌 API & Socket Contract

### HTTP

```
GET /health
→ 200  { status: "ok", env, uptime }
→ 503  { status: "redis-down" }
```

### Client → Server Events

| Event | Payload |
|---|---|
| `join-queue` | `{ name, gender, region }` |
| `signal` | `{ to, data }` |
| `chat-message` | `{ message }` |
| `next` | *(none)* |
| `leave-queue` | *(none)* |

### Server → Client Events

| Event | Payload |
|---|---|
| `matched` | `{ roomId, partnerId, partnerName, isInitiator }` |
| `partner-left` | `{ reason: "next" \| "leave" \| "disconnect" }` |
| `signal` | `{ from, data }` |
| `chat-message` | `{ from, message, timestamp }` |

---

## 🗄 Redis Data Model

| Key | Type | Purpose |
|---|---|---|
| `zivro:queue:list` | List | Matchmaking queue |
| `zivro:queue:set` | Set | De-duplication guard |
| `zivro:rooms` | Hash | `user → partner` mapping |
| `zivro:room_details` | Hash | `user → roomId` mapping |
| `zivro:user:{socketId}` | String (JSON) | Temporary profile, 10min TTL |

### Atomic Operations (Lua-backed)

- **`tryMatch()`** — pops two users and creates room mappings atomically
- **`nextPairAtomic()`** — removes both users from room and requeues both
- **`endCallAtomic()`** — removes caller and requeues only the partner

---

## 🖥 Frontend State Flow

```
idle → permissions → terms → queue → chat
```

| Action | Behavior |
|---|---|
| `Cancel` in queue | Emits `leave-queue`, resets to home |
| `Next` in chat | Emits `next`, returns to queue UI |
| `End call` | Emits `leave-queue`, resets to home |

---

## 🚀 Deployment

### Frontend — Vercel

`vercel.json` is pre-configured. Set:
```env
VITE_BACKEND_URL=https://<your-backend-domain>
```

### Backend — Render / Railway

Binds `0.0.0.0`, includes `/health` check, and handles graceful shutdown on `SIGINT`/`SIGTERM`. Set:
```env
CLIENT_URL=https://<your-frontend-domain>
REDIS_URL=<managed-redis-url>
NODE_ENV=production
```

---

## 🔒 Security & Reliability

- CORS restricted to `CLIENT_URL` only
- Helmet enabled (CSP explicitly disabled for WebRTC compatibility)
- Socket signaling validated — only forwarded to the verified partner
- Chat messages trimmed and capped at **500 characters** server-side
- Redis reconnect strategy and readiness hooks included
- Graceful shutdown closes Socket.IO, HTTP server, and Redis in sequence

---

## ⚠️ Known Gaps & Improvements

- `server/package.json` has no `start` or `dev` script (only a placeholder `test`)
- `cleanupStaleUsers()` exists in `queue.js` but is never scheduled or invoked
- `client/index.html` references `/src/style.css` which does not exist
- TURN credentials in `webrtc/peer.js` are public test credentials — **use private TURN in production**
- No automated tests are currently configured

---

## 📦 Useful Commands

```bash
# Frontend
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Lint source files

# Backend
node index.js     # Start server
```

---

## 📄 License

ISC *(backend `package.json`)* — no root license file is currently included.
