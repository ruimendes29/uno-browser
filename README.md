# Uno Browser

A multiplayer UNO card game that runs in the browser. Create a room, choose the house rules, share the link with friends and play in real time.

**Live demo:** https://uno-browser.vercel.app

## Features

- Game rooms with a shareable link (`/game/[gameId]`)
- Configurable house rules:
  - play cards with the same identifier together
  - play over a "draw" card
  - keep drawing until you can play
  - end the game when the first player runs out of cards
  - number of players
- Real-time game state synchronised through Firebase Realtime Database
- Card table, hand and colour-picker UI

## Tech stack

Next.js · React 18 · TypeScript · Redux Toolkit · Firebase Realtime Database · Sass (CSS modules) · Vercel

## Project structure

```
pages/        Next.js routes (home, game/[gameId])
components/
  Home/       room creation and rule selection
  Game/       game table, hand, cards, colour picker, game logic
  UI/         reusable UI components
store/        Firebase config and state
```

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
