# Velora AI - Generative AI Fitness, Recovery, and Nutrition App

Velora AI is a mobile-first, GenAI-powered wellness app built for hackathon-grade speed and production-style architecture.

It combines:

- AI workout planning
- AI posture feedback
- AI meal intelligence
- AI injury recovery guidance
- AI chat coaching
- Gamified activity tracking and territory competition

## App Screenshots

![App Screenshot 2](/assets/images/2.png)
![App Screenshot 3](/assets/images/3.png)
![App Screenshot 4](/assets/images/4.png)
![App Screenshot 5](/assets/images/5.png)

## Why This Project Fits a Generative AI Hackathon

This is not a single prompt demo. Velora AI uses multiple GenAI workflows end-to-end:

- Vision + language analysis for food detection and nutrition insights
- Context-aware recovery plan generation from uploaded files and symptom input
- Structured AI workout plan generation based on time, goals, and level
- Image-based posture critique during exercise execution
- Conversational AI assistant for fitness and recovery support

Each feature includes safe fallback behavior so the app remains usable even when AI endpoints fail.

## AI Features (Primary Focus)

### 1) Food IQ (GenAI Meal Intelligence)

User flows:

- Upload meal image
- Auto-detect likely food items
- Analyze meal glycemic profile and calories
- Get practical replacement suggestions and post-meal activity recommendation

AI behavior:

- Uses Gemini vision path for image understanding
- Uses Gemini text path for meal-level analysis and nutrient-oriented insights
- Falls back to deterministic safe output when unavailable

Frontend:

- `app/(app)/(tabs)/food-intelligence.tsx`
- `src/components/food-intelligence/FoodEntryScreen.tsx`
- `src/services/food-intelligence.service.ts`

Backend:

- `POST /api/ai/food/detect`
- `POST /api/ai/food/analyze`

### 2) Recovery AI (Injury-based Smart Exercise Assistant)

User flows:

- Upload injury report (image/PDF)
- Scan affected area from camera
- Describe pain manually (area, pain level, symptoms, notes)

Output:

- Condition summary
- Risk level (Low/Medium/High)
- Recovery suggestion
- Recommended exercise IDs mapped to local exercise library
- Session progression + rewards

AI behavior:

- Uses Gemini for structured JSON recommendations
- Supports multimodal payloads with inline image/PDF data
- Uses fallback recommendation engine when AI is unavailable or invalid

Frontend:

- `app/(app)/recovery-ai.tsx`
- `src/components/recovery-ai/RecoveryEntryScreen.tsx`
- `src/services/recovery-ai.service.ts`

Backend:

- `POST /api/ai/recovery/analyze`

### 3) AI Trainer (Plan + Form Intelligence)

User flows:

- Generate personalized workout plan by target muscle, duration, reps, and context
- Open each exercise detail screen
- Capture posture image and get AI-based critique

AI behavior:

- Plan generation via Gemini with strict output normalization
- Posture scan analysis for Good vs Needs Correction feedback
- Fallback plan generation when AI model is unavailable

Frontend:

- `app/(app)/(tabs)/ai-trainer.tsx`
- `app/(app)/trainer/[id].tsx`
- `src/services/ai-trainer.service.ts`

Backend:

- `POST /api/ai/trainer/plan`
- `POST /api/ai/trainer/posture`

### 4) Velora AI Chat Assistant

User flows:

- Open chatbot page
- Ask fitness, nutrition, recovery, or motivation questions

AI behavior:

- Persona-controlled assistant prompt
- Model fallback chain support
- Safe fallback response if models fail

Frontend:

- `app/(app)/chatbot.tsx`
- `src/components/chatbot/ChatScreen.tsx`

Backend endpoint available:

- `POST /api/ai/chat`

## Core Non-AI Features

- Clerk-based Google authentication
- Protected app navigation and onboarding gate
- Activity tracking with map path and captured territory
- Events + leaderboard
- XP, streak, levels, and badges
- User profile and progress views

## Tech Stack

### Mobile

- Expo + React Native + Expo Router
- React Query for server-state
- Zustand for lightweight app state
- NativeWind/Tailwind utility styling
- Expo modules: location, image-picker, document-picker, file-system, print, sharing

### Backend

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Zod input validation
- Gemini integration via `@google/genai`

## Monorepo Structure

- `app/` - Expo Router screens
- `src/` - mobile business logic, UI components, services, stores
- `backend/` - Express API, AI controllers/services, DB models
- `shared/` - shared cross-layer types

## API Surface

### AI Routes

- `POST /api/ai/trainer/plan`
- `POST /api/ai/trainer/posture`
- `POST /api/ai/food/detect`
- `POST /api/ai/food/analyze`
- `POST /api/ai/recovery/analyze`
- `POST /api/ai/chat`

### Core App Routes

- `GET /api/events/active`
- `GET /api/leaderboard?eventId=`
- `GET /api/user/profile`
- `PATCH /api/user/update`
- `POST /api/activity`
- `GET /api/activity/user`

## Authentication

Protected backend routes expect Clerk identity headers:

- `x-clerk-user-id` (required)
- `x-clerk-email` (optional)
- `x-clerk-name` (optional)

## Setup

### 1) Install Dependencies

```bash
npm install
cd backend && npm install
```

### 2) Configure Backend Environment

```bash
cd backend
copy .env.example .env
```

Set in `backend/.env`:

- `PORT`
- `MONGODB_URI`
- `CLIENT_ORIGIN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (default text model)
- `GEMINI_VISION_MODEL` (default multimodal model)
- `GEMINI_FALLBACK_MODELS` (comma-separated optional fallback chain)

### 3) Configure Mobile Environment

Set in root `.env`:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

### 4) Run Project

From root:

```bash
npm run backend:dev
npm start
```

## Expo API URL Notes

Typical local API values:

- Android emulator: `http://10.0.2.2:4000/api`
- iOS simulator: `http://localhost:4000/api`
- Physical device: use your machine LAN IP and same backend port

## Reliability + Safety Design

- Zod schema validation at controllers
- Normalized AI output parsing
- Fallback responses for model failures/timeouts
- Conservative prompts for medical-adjacent recovery use-cases
- User-in-the-loop language where confidence is low

## Validation Commands

```bash
npm run backend:typecheck
npm run lint
```
