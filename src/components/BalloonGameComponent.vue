<template>
  <div class="balloon-game-container">
    <!-- Game Canvas Container -->
    <div ref="gameContainer" class="game-canvas"></div>
    
    <!-- Game UI Overlay -->
    <div class="game-overlay">
      <!-- Countdown Screen -->
      <div v-if="gameState === 'waiting'" class="countdown-screen">
        <div class="countdown-circle">
          <div class="countdown-number">{{ countdownSeconds }}</div>
        </div>
        <div class="countdown-text">Next round starting in...</div>
      </div>
      
      <!-- Playing UI -->
      <div v-if="gameState === 'playing'" class="playing-ui">
        <div class="score-panel">
          <div class="score">Score: {{ currentScore }}</div>
          <div class="multiplier">{{ currentMultiplier.toFixed(2) }}x</div>
        </div>
        
        <!-- Land Button - Only one instance here -->
        <button @click="landNow" class="land-button">
          🪂 LAND NOW
        </button>
      </div>
      
      <!-- Game Over Screens -->
      <div v-if="gameState === 'landed'" class="game-over landed">
        <h2>🎉 Safe Landing!</h2>
        <div class="final-score">Final Score: {{ finalScore }}</div>
        <div class="next-round">Next round in {{ countdownSeconds }}s</div>
      </div>
      
      <div v-if="gameState === 'crashed'" class="game-over crashed">
        <h2>💥 Balloon Popped!</h2>
        <div class="final-score">Score: 0</div>
        <p>You flew too high and the balloon burst!</p>
        <div class="next-round">Next round in {{ countdownSeconds }}s</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'
import { BalloonGame } from '../game/BalloonGame'
import { GameState } from '../game/GameTypes'

// Reactive state
const gameContainer: Ref<HTMLElement | undefined> = ref<HTMLElement>()
const gameState: Ref<GameState> = ref<GameState>(GameState.WAITING)
const currentScore: Ref<number> = ref(0)
const currentMultiplier: Ref<number> = ref(1)
const finalScore: Ref<number> = ref(0)
const riskPercentage: Ref<number> = ref(0)
const countdownSeconds: Ref<number> = ref(5)

// Game instance and timers
let game: BalloonGame | null = null
let gameStartTime: number = 0
let countdownInterval: number | null = null

// Computed properties
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

// Risk indicator color
const getRiskColor = (): string => {
  const risk = riskPercentage.value
  if (risk < 30) return '#4CAF50' // Green
  if (risk < 60) return '#FF9800' // Orange
  if (risk < 80) return '#FF5722' // Red-Orange
  return '#F44336' // Red
}

// Countdown functionality
const startCountdown = (): void => {
  countdownSeconds.value = 5
  countdownInterval = setInterval(() => {
    countdownSeconds.value--
    if (countdownSeconds.value <= 0) {
      stopCountdown()
      startGame()
    }
  }, 1000)
}

const stopCountdown = (): void => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// Game lifecycle methods
const initializeGame = (): void => {
  if (!gameContainer.value) return
  
  try {
    // Create canvas element for PixiJS
    const canvas = document.createElement('canvas')
    gameContainer.value.appendChild(canvas)
    
    game = new BalloonGame(canvas)
    
    // Setup event handlers
    game.onGameStateChange = (state: GameState) => {
      gameState.value = state
      if (state === GameState.PLAYING) {
        gameStartTime = Date.now()
      }
    }
    
    game.onScoreUpdate = (score: number, multiplier: number) => {
      currentScore.value = score
      currentMultiplier.value = multiplier
    }
    
    game.onLand = (score: number) => {
      finalScore.value = score
      // Start countdown after showing results for 2 seconds
      setTimeout(() => {
        if (gameState.value !== GameState.PLAYING) {
          startCountdown()
        }
      }, 2000)
    }
    
    game.onCrash = (score: number) => {
      finalScore.value = score
      // Start countdown after showing results for 2 seconds
      setTimeout(() => {
        if (gameState.value !== GameState.PLAYING) {
          startCountdown()
        }
      }, 2000)
    }
    
    // Start initial countdown
    startCountdown()
  } catch (error) {
    console.error('Failed to initialize game:', error)
  }
}

const startGame = (): void => {
  if (game) {
    game.startGame()
  }
}

const landNow = (): void => {
  if (game && gameState.value === GameState.PLAYING) {
    game.landBalloon()
  }
}

const resetGame = (): void => {
  if (game) {
    game.restartGame()
  }
  currentScore.value = 0
  currentMultiplier.value = 1
  finalScore.value = 0
  riskPercentage.value = 0
  gameStartTime = 0
  stopCountdown()
}

// Lifecycle hooks
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  stopCountdown()
  if (game) {
    game.destroy()
  }
})
</script>

<style scoped>
.balloon-game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.game-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.game-overlay > * {
  pointer-events: auto;
}

/* Countdown Screen */
.countdown-screen {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(30, 30, 50, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.countdown-circle {
  width: 120px;
  height: 120px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  animation: pulse 1s ease-in-out infinite;
}

.countdown-number {
  font-size: 3em;
  font-weight: bold;
  color: #667eea;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.countdown-text {
  font-size: 1.2em;
  color: #b8c5d6;
  margin-top: 10px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Playing UI Updates */
.playing-ui {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.score-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 30, 50, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.score {
  font-size: 1.5em;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.multiplier {
  font-size: 1.8em;
  font-weight: bold;
  color: #64ffda;
  text-shadow: 0 0 10px rgba(100, 255, 218, 0.5);
}

/* Land Button - Desktop: center bottom, Mobile portrait: bottom right */
.land-button {
  align-self: center;
  margin-top: auto;
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.3em;
  padding: 15px 40px;
  background: linear-gradient(45deg, #4ade80, #22c55e);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(74, 222, 128, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 20;
}

.land-button:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 12px 30px rgba(74, 222, 128, 0.6);
  background: linear-gradient(45deg, #22c55e, #16a34a);
}

.land-button:active {
  transform: translateX(-50%) translateY(0);
}

/* Game Over Updates */
.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(30, 30, 50, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  min-width: 300px;
}

.game-over h2 {
  font-size: 2em;
  margin: 0 0 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.landed h2 {
  color: #4ade80;
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
}

.crashed h2 {
  color: #f87171;
  text-shadow: 0 0 20px rgba(248, 113, 113, 0.5);
}

.final-score {
  font-size: 1.5em;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.game-over p {
  color: #8a9ba8;
  margin-bottom: 20px;
}

.next-round {
  margin-top: 15px;
  color: #8a9ba8;
  font-size: 1.1em;
}

/* Remove start screen related styles */
.start-screen,
.start-button,
.play-again-button {
  display: none;
}

/* Mobile Responsive */
@media (max-width: 768px) and (orientation: portrait) {
  .land-button {
    left: auto;
    right: 20px;
    bottom: 20px;
    transform: none;
    font-size: 1.1em;
    padding: 12px 30px;
    position: fixed;
  }
  
  .land-button:hover {
    transform: translateY(-2px);
  }
  
  .land-button:active {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .countdown-circle {
    width: 100px;
    height: 100px;
  }
  
  .countdown-number {
    font-size: 2.5em;
  }
}

@media (max-width: 600px) {
  .score {
    font-size: 1.2em;
  }
  
  .multiplier {
    font-size: 1.5em;
  }
  
  .game-over {
    padding: 30px 20px;
    margin: 0 20px;
  }
}

@media (max-width: 480px) {
  .playing-ui {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .score-panel {
    padding: 10px 15px;
  }

}
</style>
