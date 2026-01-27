# Ruleta de Premios

A prize roulette wheel app for raffles and giveaways. Enter participants and prizes, then spin the wheel to randomly select winners — one prize at a time.

Built with Astro, React, Tailwind CSS, and Framer Motion.

## Features

- Animated roulette wheel with neon cyberpunk theme
- CSV / JSON import for participant lists
- Multiple prizes with sequential awarding
- Winner accept/reject flow
- Fullscreen mode for TV/projector display
- Confetti celebration on winner selection
- UI in Spanish

## Project Structure

```
src/
├── components/
│   ├── GameContainer.tsx   # State management (Context + Reducer)
│   ├── SetupForm.tsx       # Participant & prize input
│   ├── GameStage.tsx       # Main game UI with wheel and controls
│   ├── Wheel.tsx           # Animated SVG roulette wheel
│   ├── WinnerModal.tsx     # Winner confirmation dialog
│   ├── GameOver.tsx        # Final results summary
│   └── Confetti.tsx        # Celebration effect
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helpers (CSV parsing, colors, rotation calc)
├── layouts/
│   └── Layout.astro
├── pages/
│   └── index.astro
└── styles/
    └── global.css
```

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start local dev server at `localhost:4321`    |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview build locally before deploying       |

## Deployment

The app builds to static files and can be deployed to Vercel, Netlify, or any static hosting provider.
