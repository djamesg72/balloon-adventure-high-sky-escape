<template>
  <div class="balloon-game-container">
    <!-- Game Canvas Container -->
    <div ref="gameContainer" class="game-canvas"></div>
    
    <!-- Game UI Overlay -->
    <div class="game-overlay">
      <!-- Game HUD - Always visible -->
      <GameHUD 
        :gameState="gameState"
        :currentScore="currentScore"
        :currentMultiplier="currentMultiplier"
        :timeProgress="timeProgress"
        :countdownSeconds="countdownSeconds"
        :autoLandEnabled="autoLandEnabled"
        :autoLandMultiplier="autoLandMultiplier"
        :hasLanded="hasLanded"
        :landingMultiplier="landingMultiplier"
        @landNow="landNow"
        @toggleAutoLand="toggleAutoLand"
        @updateAutoLandMultiplier="updateAutoLandMultiplier"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'
import { BalloonGame } from '../game/BalloonGame'
import { GameState } from '../game/GameTypes'
import GameHUD from './GameHUD.vue'

// Reactive state
const gameContainer: Ref<HTMLElement | undefined> = ref<HTMLElement>()
const gameState: Ref<GameState> = ref<GameState>(GameState.WAITING)
const currentScore: Ref<number> = ref(0)
const currentMultiplier: Ref<number> = ref(1)
const finalScore: Ref<number> = ref(0)
const countdownSeconds: Ref<number> = ref(5)
const timeProgress: Ref<number> = ref(100)
const hasLanded: Ref<boolean> = ref(false)
const landingMultiplier: Ref<number | null> = ref(null)

// Auto-land settings
const autoLandEnabled: Ref<boolean> = ref(false)
const autoLandMultiplier: Ref<number> = ref(2.0)
let autoLandTriggered: boolean = false // Flag to prevent multiple auto-land triggers

// Game instance and timers
let game: BalloonGame | null = null
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
  timeProgress.value = 100
  const totalTime = 5000 // 5 seconds
  const startTime = Date.now()
  
  countdownInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, totalTime - elapsed)
    
    countdownSeconds.value = Math.ceil(remaining / 1000)
    timeProgress.value = (remaining / totalTime) * 100
    
    if (remaining <= 0) {
      stopCountdown()
      startGame()
    }
  }, 100) // Update every 100ms for smooth timer bar
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
      
      // Check auto-land conditions - but only if not already triggered this round
      if (autoLandEnabled.value && gameState.value === GameState.PLAYING && !autoLandTriggered && !hasLanded.value) {
        if (multiplier >= autoLandMultiplier.value) {
          // Auto-land triggered
          autoLandTriggered = true // Prevent multiple triggers
          setTimeout(() => autoLandNow(multiplier), 500) // Small delay to show the auto-land indicator
        }
      }
    }
    
    game.onLand = (score: number) => {
      finalScore.value = score
      hasLanded.value = true // Mark that player has landed successfully
      // Only store multiplier if not already set (for auto-land)
      if (landingMultiplier.value === null) {
        landingMultiplier.value = currentMultiplier.value // Store the multiplier when landed
      }
      // Don't end the round - just record the score and continue playing
      // The round will only end when the balloon crashes
    }
    
    game.onCrash = (score: number) => {
      // Only crashes end the round
      finalScore.value = score
      landingMultiplier.value = null // Clear landing multiplier when crashed
      autoLandTriggered = false // Reset for next round
      // Start countdown after showing results for 2 seconds
      setTimeout(() => {
        gameState.value = GameState.WAITING // Ensure we're in waiting state
        startCountdown()
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
    // Let the game handle its own restart completely
    game.restartGame()
    
    // Reset our component state
    currentScore.value = 0
    currentMultiplier.value = 1
    hasLanded.value = false
    landingMultiplier.value = null
    autoLandTriggered = false
    
    // Now start the game
    game.startGame()
  }
}

const landNow = (): void => {
  if (game && gameState.value === GameState.PLAYING) {
    game.landBalloon()
  }
}

const autoLandNow = (targetMultiplier: number): void => {
  if (game && gameState.value === GameState.PLAYING && !hasLanded.value) {
    // Store the target multiplier before landing
    landingMultiplier.value = targetMultiplier
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
  hasLanded.value = false
  landingMultiplier.value = null
  autoLandTriggered = false // Reset auto-land trigger flag
  timeProgress.value = 100
  stopCountdown()
}

// Auto-land methods
const toggleAutoLand = (): void => {
  autoLandEnabled.value = !autoLandEnabled.value
}

const updateAutoLandMultiplier = (multiplier: number): void => {
  autoLandMultiplier.value = Math.max(1.01, multiplier)
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
  .game-over {
    padding: 30px 20px;
    margin: 0 20px;
  }
}
</style>
