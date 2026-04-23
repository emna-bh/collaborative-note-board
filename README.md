# Collaborative Note Board

A full-stack collaborative board where authenticated users can create, edit, delete, reorder, and watch notes update in real time. The app uses Firebase emulators for local authentication and Firestore persistence, a NestJS backend for API and websocket orchestration, and a Next.js frontend for the board UI.

## What is in this repo

- `frontend/`: Next.js app for authentication, notes UI, and realtime activity feed
- `backend/`: NestJS API, Firebase Admin integration, websocket gateway, and seed script
- Local Firebase Emulator config lives in `backend/firebase.json`

## Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- Java 21+ or another Java runtime supported by the Firebase Firestore emulator
- `npx` access to run `firebase-tools` locally

### 1. Install dependencies

Open one terminal in `backend/` and one in `frontend/`, then run:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

The repo already includes local env files for the default emulator setup:

- `backend/.env`
- `frontend/.env.local`

### 2. Start the Firebase emulators

From `backend/`:

```bash
npx firebase-tools emulators:start --project demo-no-project
```

This starts:

- Firebase Auth Emulator on `http://127.0.0.1:9099`
- Firestore Emulator on `127.0.0.1:8080`
- Firebase Emulator UI on `http://localhost:4000`

### 3. Start the backend

From `backend/` in a second terminal:

```bash
npm run start:dev
```

Backend URLs:

- API root: `http://localhost:3001`
- Swagger docs: `http://localhost:3001/api`
- Health check: `http://localhost:3001/health`

### 4. Start the frontend

From `frontend/` in a third terminal:

```bash
npm run dev
```

Frontend URL:

- App: `http://localhost:3000`

### 5. Seed sample data

Once the emulators and backend are running, you can seed sample users and notes from `backend/`:

```bash
npm run seed:sample
```

This creates:

- 2 sample users
- 8 notes
- matching activity records for the feed

Default seeded credentials:

- `one.user@example.com` / `Password123!`
- `two.user@example.com` / `Password123!`

## Recommended Local Run Order

1. Start Firebase emulators
2. Start the backend
3. Start the frontend
4. Run the seed script if you want demo data

If the frontend loads but login or realtime updates do not work, the first thing to check is whether the emulators are still running.

## Architecture Overview

### Frontend

The frontend is a Next.js app that:

- authenticates users against the Firebase Auth emulator
- fetches notes and activities from the backend
- keeps the board in sync through Socket.IO
- uses React Query to keep server state and realtime updates aligned

Main responsibilities:

- `frontend/app/board/page.tsx`: board page composition
- `frontend/components/providers/auth-provider.tsx`: auth session state
- `frontend/features/notes/use-notes-realtime.ts`: realtime cache updates for notes
- `frontend/components/activity/activity-feed.tsx`: live activity stream UI

### Backend

The backend is a NestJS app running on Fastify that:

- verifies Firebase ID tokens
- exposes REST endpoints for notes, activity, and health
- persists notes and activities in Firestore
- broadcasts realtime note and activity events with Socket.IO

Main responsibilities:

- `backend/src/main.ts`: app bootstrap, CORS, validation, Swagger
- `backend/src/modules/auth`: token verification and auth integration
- `backend/src/modules/notes`: note CRUD and reordering
- `backend/src/modules/activity`: activity queries and persistence
- `backend/src/modules/realtime/notes.gateway.ts`: websocket auth and broadcasts
- `backend/src/modules/health`: simple backend health endpoint

### Data flow

At a high level:

1. A user signs in through Firebase Auth Emulator from the frontend.
2. The frontend sends the Firebase ID token to the backend for protected HTTP calls and websocket connection auth.
3. The backend verifies the token, reads or writes Firestore data, and records activity entries for note changes.
4. The websocket gateway emits note and activity events to connected clients.
5. The frontend updates its React Query cache so the board and activity feed refresh without a page reload.

## Trade-Offs And What I Would Improve

### Trade-offs in the current setup

- Using Firebase emulators makes local development fast and safe, but it also means the setup depends on emulator-specific environment variables and a Java runtime for Firestore.
- The backend acts as a clean integration layer for auth, notes, and realtime events, but data access is still tightly coupled to Firestore collections and could be abstracted further if a different datastore were ever needed.
- Realtime is simple and effective with one shared board room, but that same simplicity means the current model is not yet designed for multiple boards, permissions scopes, or tenant isolation.

### What I would improve next

- Add a short config validation step during startup so missing or invalid environment variables fail fast with clear messages.
- Add a collaborative cursor presence to show who’s currently viewing the board.
- Add pagination or cursors for older activity records instead of treating the feed as a small recent list.
- Separate infrastructure concerns more clearly for local, test, and production environments.
- Add unit & integration tests.

## Handy URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api`
- Health: `http://localhost:3001/health`
- Firebase Emulator UI: `http://localhost:4000`

## Verification Checklist

After startup, a quick manual verification looks like this:

1. Open `http://localhost:4000` and confirm the Firebase Emulator UI is available.
2. Open `http://localhost:3001/health` and confirm the backend responds with `status: ok`.
3. Open `http://localhost:3000` and sign in with one of the seeded users.
4. Create or edit a note and confirm the board updates immediately.
5. Open a second browser session with the other user and confirm note changes and activity feed entries appear in real time.
