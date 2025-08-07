# 🎈 Balloon Adventure - High Sky Escape

A casino-style crash game built with **Vue 3**, **TypeScript**, and **PixiJS**. Guide your hot-air balloon as high as possible to collect points, but land before it pops in the thin atmosphere!

![Balloon Adventure](https://img.shields.io/badge/Game-Balloon%20Adventure-ff6b6b?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue-3-4fc08d?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![PixiJS](https://img.shields.io/badge/PixiJS-7-ff6b6b?style=for-the-badge)

## 🎮 Game Overview

**Balloon Adventure** is a thrilling casino crash game where players control a hot-air balloon's ascent and descent. The goal is to fly as high as possible to maximize your score while managing the increasing risk of the balloon popping due to high altitude and unpredictable winds.

### 🎯 Gameplay Features

- **Risk vs Reward**: The higher you fly, the more points you earn, but the greater the risk of crashing
- **Dynamic Multipliers**: Score multipliers increase over time, rewarding daring players
- **Unpredictable Crashes**: Random crash mechanics keep every round exciting and unpredictable
- **Visual Risk Indicators**: The balloon changes color and shakes as danger increases
- **Smooth Animations**: Fluid balloon movement with realistic wind sway effects
- **Responsive Design**: Optimized for both desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to the URL shown in terminal (usually `http://localhost:3000`)

### 🎮 How to Play

1. **Click "START ADVENTURE"** to begin your balloon journey
2. **Watch your balloon ascend** automatically as your score increases
3. **Monitor the risk level** - the balloon will change color as danger increases
4. **Click "LAND NOW"** to safely collect your points before the balloon pops
5. **Risk vs Reward**: The longer you wait, the higher your score multiplier, but the greater the crash risk!

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking

### 🏗️ Project Structure

```
src/
├── components/
│   └── BalloonGameComponent.vue    # Main Vue component with game UI
├── game/
│   └── BalloonGame.ts              # Core PixiJS game engine
├── types/
│   └── game.ts                     # TypeScript interfaces and types
├── utils/
│   ├── audioManager.ts             # Sound effects and audio management
│   ├── gameUtils.ts                # Game mathematics and utilities
│   └── riskMechanics.ts           # Risk calculation algorithms
├── App.vue                         # Root Vue application
└── main.ts                         # Application entry point
```

## 🎛️ Game Configuration

The game behavior can be customized through the `GameConfig` interface in `src/game/BalloonGame.ts`.

## 🎭 Game States

The game follows a simple state machine:

1. **WAITING** - Ready to start, showing start screen
2. **PLAYING** - Balloon is ascending, player can land
3. **LANDED** - Player successfully landed, showing final score
4. **CRASHED** - Balloon popped, game over with zero points

---

**Enjoy your high-sky adventure! 🎈✨**

*Remember: The higher you fly, the greater the reward... but also the greater the risk!*

## Project Structure
```
balloon-adventure-high-sky-escape
├── public
│   └── index.html
├── src
│   ├── assets
│   ├── components
│   │   ├── BalloonGame.vue
│   │   ├── ScoreDisplay.vue
│   │   └── GameControls.vue
│   ├── views
│   │   └── Home.vue
│   ├── App.vue
│   ├── main.js
│   └── utils
│       └── riskMechanics.js
├── package.json
├── README.md
└── vite.config.js
```

## Setup Instructions
1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/balloon-adventure-high-sky-escape.git
   cd balloon-adventure-high-sky-escape
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Run the Development Server**
   Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` to see the game in action.

## Gameplay Mechanics
- **Balloon Ascent**: The balloon automatically ascends, and players can control its descent by clicking the "Land Now" button.
- **Risk Mechanics**: The game features randomized risk mechanics that increase the chance of the balloon popping as it ascends higher.
- **Scoring**: Players earn points based on the altitude reached before landing or popping.

## Assets
Game assets, including images and sounds, should be placed in the `src/assets` directory.

## Components
- **BalloonGame.vue**: Main game logic and rendering.
- **ScoreDisplay.vue**: Displays the current score and altitude.
- **GameControls.vue**: User interface for game controls.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.