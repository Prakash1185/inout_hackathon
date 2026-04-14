# BitBox - Gamified Activity Tracking (Expo + Node)

Production-style foundation for a real-world activity competition app inspired by INTVL, Duolingo, and Strava.

## Monorepo Layout

- `app/` (Expo Router screens)
- `backend/` (Node.js + Express + MongoDB API)
- `shared/` (cross-layer TypeScript types)
- `src/` (mobile app services, stores, providers, components)

## Implemented Features

### Mobile (Expo)

- JWT auth flow (`/(auth)/login`, `/(auth)/signup`)
- Protected navigation with route-guard in `app/_layout.tsx`
- Home dashboard with:
  - Current user location
  - Captured territory circles on map
  - XP progress, level, streak
  - Active event banner
- Activity tracking with `expo-location` + live polyline on `react-native-maps`
- Result screen with distance, area approximation, XP estimate
- Persist activity to backend
- Leaderboard tab (event + global)
- Profile tab (XP, streak, badges, profile update)

### Backend (Express + Mongoose)

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `PATCH /api/user/update`
- `POST /api/activity`
- `GET /api/activity/user`
- `GET /api/events/active`
- `GET /api/leaderboard?eventId=`

### Gamification

- XP based on distance + captured area
- Level computed from XP threshold formula
- Daily streak updates on activity save
- Badge unlock hooks (`Trailblazer`, `Consistency Pro`)

## Setup

### 1) Install Mobile Dependencies

```bash
npm install
```

### 2) Setup Backend Env

```bash
cd backend
copy .env.example .env
```

Update `backend/.env`:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`

### 3) Install Backend Dependencies

```bash
cd backend
npm install
```

### 4) Start Backend

```bash
npm run backend:dev
```

### 5) Start Mobile App

```bash
npm start
```

## API Base URL for Expo

Set `EXPO_PUBLIC_API_URL` for device/emulator use:

- Android emulator default is `http://10.0.2.2:4000/api`
- iOS simulator default is `http://localhost:4000/api`

You can override via environment variable at runtime.

## Validation Commands

```bash
npm run backend:typecheck
npm run lint
```
