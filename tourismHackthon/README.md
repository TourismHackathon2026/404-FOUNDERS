# YatrAI

AI-powered Nepal tourism mobile app — intelligent journey planner, bus navigator, and community pulse for Kathmandu Valley.

## Quick start

```bash
pnpm install
pnpm start
```

Then press `w` for web, or scan the QR code with Expo Go on your phone.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo dev server |
| `pnpm web` | Start web preview |
| `pnpm typecheck` | Run TypeScript checks |

## Project structure

```
app/
  (tabs)/          # Discover, Plan, Routes, Community
  destination/     # Destination detail pages
components/        # Shared UI components
constants/         # Theme colors
context/           # Global state (itineraries, reports)
data/              # Offline destinations, routes, tips
hooks/             # Theme hook
assets/images/     # App icon
```

## Features

- **Discover** — 8 Nepal destinations, daily cultural tips, community alerts
- **AI Planner** — Natural language → step-by-step itinerary with bus routes (rule-based, no API key)
- **Bus Navigator** — 5 Kathmandu Valley routes with expandable stops and fare guide
- **Community Pulse** — Crowd/delay/tip/alert reports with upvoting

## Stack

- Expo SDK 54 + Expo Router v6
- React Native + TypeScript
- React Context + AsyncStorage (offline-first)

## Note

This project was reorganized from scattered duplicate files into a standard Expo app structure. All data is local — no backend required.
