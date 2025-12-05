# Realtime Chat Server

Minimal Express + Socket.IO server for the realtime-chat-app used for local development.

Setup

1. Copy `.env.example` to `.env` and edit values if necessary.
2. Install dependencies: `npm install` in the `server` folder.
3. Start in dev mode: `npm run dev` (uses nodemon and expects `server.js`).

Endpoints
- GET `/api/health` - health check
- POST `/api/auth/register` - register { name, email, password }
- POST `/api/auth/login` - login { email, password }
- GET `/api/messages` - get messages (requires Authorization: Bearer <token>)
- POST `/api/messages` - create message (requires Authorization)
