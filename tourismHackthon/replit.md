# YatrAI

AI-powered Nepal tourism mobile app — intelligent journey planner, bus navigator, and community pulse for Kathmandu Valley.

## Run

```bash
npm install
npm start
```

Press `w` for web preview, or scan the QR code with Expo Go.

## Scripts

- `npm start` — Expo dev server
- `npm run web` — Web preview
- `npm run typecheck` — TypeScript check

## Structure

- `app/(tabs)/` — Discover, Plan, Routes, Community screens
- `app/destination/[id].tsx` — Destination detail
- `data/` — Offline destinations, bus routes, cultural tips, community reports
- `components/` — Shared UI
- `context/AppContext.tsx` — Itineraries + community state
- `constants/colors.ts` — Nepal-inspired crimson/saffron palette

## Features

- **Discover** — 8 destinations, daily cultural tips, community alerts
- **AI Planner** — Natural language → itinerary with bus routes (rule-based, offline)
- **Bus Navigator** — 5 Kathmandu Valley routes, fare guide
- **Community Pulse** — Reports with upvoting

## Stack

Expo SDK 54 · Expo Router v6 · React Native · TypeScript · AsyncStorage
