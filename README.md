# 🚀 VOYAGER | Galactic Exploration

Voyager is a **Retro-Future** arcade space exploration game built with a modern web stack. Navigate the cosmos as Astronaut 311-A, reconstruct ancient zodiac constellations, and make friends with Zarg 966-Z in the distant Zargaborg system.

![Voyager Win Screen Proof](https://github.com/user-attachments/assets/5c378544-42f8-410a-9d29-a36c8430e37b)

## 🌌 The Mission

As the pilot of the VOYAGER craft, you must connect the stars of the 12 Zodiac constellations before the void closes. Each connection restores light to the galaxy. Complete all 12 to reach the biosphere of Zarg 966-Z.

## 🛠️ Technology Stack

- **Core Engine**: HTML5 Canvas & Vanilla JavaScript (Procedural rendering and physics).
- **Styling**: CSS3 with neon glow filters and glassmorphism.
- **Backend & Persistence**: Firebase Hosting, Firestore (Leaderboard), and Anonymous Authentication.
- **Orchestration**: Built using a multi-agent AI workflow (Agents A, B, and C).

## 🎮 How to Play

### Controls
- **Arrow Keys**: 8-way directional movement.
- **Shift**: Boost (Speed x2).
- **Z**: Brake (Speed x0.5).
- **Enter**: Progress through UI screens and submit scores.

### Developer Shortcuts
- **Shift + D**: Instant win (skip to end) for testing purposes.

## 🚀 Getting Started

### Prerequisites
- Node.js installed.
- Firebase Tools: `npm install -g firebase-tools`

### Local Development
1. Clone the repository.
2. Run the local emulator:
   ```bash
   firebase serve
   ```
3. Open `http://localhost:5000` in your browser.

### Deployment
Deploy to the live web with a single command:
```bash
firebase deploy
```

## 🏆 Leaderboard
Compete for the highest mission score! Scores are calculated based on your remaining time and the number of constellations restored.

## 🤖 AI Orchestration Context
This project was developed through a collaborative AI agent architecture:
- **Agent A (The Engine)**: Crafted the game loop and physics.
- **Agent B (The Architect)**: Built the persistence layer and Firestore integration.
- **Agent C (The Engineer)**: Validated the codebase, performed QA testing, and polished the UX.

---
*Safe travels, Astronaut. The stars are waiting.*
