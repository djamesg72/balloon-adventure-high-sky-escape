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
        :autoLandEnabled1="autoLandEnabled1"
        :autoLandMultiplier1="autoLandMultiplier1"
        :hasLanded1="hasLanded1"
        :landingMultiplier1="landingMultiplier1"
        :autoLandEnabled2="autoLandEnabled2"
        :autoLandMultiplier2="autoLandMultiplier2"
        :hasLanded2="hasLanded2"
        :landingMultiplier2="landingMultiplier2"
        :autoLandEnabled="autoLandEnabled"
        :autoLandMultiplier="autoLandMultiplier"
        :hasLanded="hasLanded"
        :landingMultiplier="landingMultiplier"
        @landNow1="landNow1"
        @landNow2="landNow2"
        @toggleAutoLand1="toggleAutoLand1"
        @toggleAutoLand2="toggleAutoLand2"
        @updateAutoLandMultiplier1="updateAutoLandMultiplier1"
        @updateAutoLandMultiplier2="updateAutoLandMultiplier2"
        @landNow="landNow"
        @toggleAutoLand="toggleAutoLand"
        @updateAutoLandMultiplier="updateAutoLandMultiplier"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { BalloonGame } from '../game/BalloonGame'
import { GameState } from '../game/GameTypes'
import GameHUD from './GameHUD.vue'
import type { AudioManager } from '../utils/audioManager'

// Props
const props = defineProps<{
  audioManager?: AudioManager | null
}>()

// Reactive state
const gameContainer: Ref<HTMLElement | undefined> = ref<HTMLElement>()
const gameState: Ref<GameState> = ref<GameState>(GameState.WAITING)
const currentScore: Ref<number> = ref(0)
const currentMultiplier: Ref<number> = ref(1)
const finalScore: Ref<number> = ref(0)
const countdownSeconds: Ref<number> = ref(5)
const timeProgress: Ref<number> = ref(100)

// Separate state for each balloon
const hasLanded1: Ref<boolean> = ref(false)
const hasLanded2: Ref<boolean> = ref(false)
const landingMultiplier1: Ref<number | undefined> = ref(undefined)
const landingMultiplier2: Ref<number | undefined> = ref(undefined)

// Legacy state for backward compatibility
const hasLanded: Ref<boolean> = ref(false)
const landingMultiplier: Ref<number | undefined> = ref(undefined)

// Auto-land settings for balloon 1
const autoLandEnabled1: Ref<boolean> = ref(false)
const autoLandMultiplier1: Ref<number> = ref(2.0)
let autoLandTriggered1: boolean = false

// Auto-land settings for balloon 2
const autoLandEnabled2: Ref<boolean> = ref(false)
const autoLandMultiplier2: Ref<number> = ref(3.0)
let autoLandTriggered2: boolean = false

// Legacy auto-land settings
const autoLandEnabled: Ref<boolean> = ref(false)
const autoLandMultiplier: Ref<number> = ref(2.0)
let autoLandTriggered: boolean = false

// Game instance and timers
let game: BalloonGame | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

// Audio integration methods
const playPopSound = () => {
  if (props.audioManager && !props.audioManager.isMuted()) {
    props.audioManager.playPopSound()
  }
}

const playLandingSound = () => {
  if (props.audioManager && !props.audioManager.isMuted()) {
    props.audioManager.playLandingFanfare()
  }
}

const playCountdownBeep = (isFinal: boolean = false) => {
  if (props.audioManager && !props.audioManager.isMuted()) {
    props.audioManager.playCountdownBeep(isFinal)
  }
}

// Countdown functionality
const startCountdown = (): void => {
  countdownSeconds.value = 5
  timeProgress.value = 100
  const totalTime = 5000 // 5 seconds
  const startTime = Date.now()
  
  // Play initial beep ONLY ONCE at the start
  playCountdownBeep(false)
  
  countdownInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, totalTime - elapsed)
    const newCountdownSeconds = Math.ceil(remaining / 1000)
    
    // Remove the beep that was playing every second - now only plays once at start
    countdownSeconds.value = newCountdownSeconds
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
  if (!gameContainer.value) {
    console.error('Game container not found')
    return
  }
  
  try {
    // Create canvas element for PixiJS
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    gameContainer.value.appendChild(canvas)
    
    console.log('Initializing BalloonGame...')
    game = new BalloonGame(canvas)
    console.log('BalloonGame initialized successfully')
    
    // Setup event handlers
    game.onGameStateChange = (state: GameState) => {
      console.log('Game state changed to:', state)
      gameState.value = state
      if (state === GameState.PLAYING) {
        // Start wind sound when game begins with initial intensity
        if (props.audioManager) {
          props.audioManager.setWindIntensity(0.3) // Start with moderate wind
        }
      } else if (state === GameState.CRASHED || state === GameState.LANDED) {
        // Stop wind sound when game ends
        if (props.audioManager) {
          props.audioManager.setWindIntensity(0)
        }
      }
    }
    
    game.onScoreUpdate = (score: number, multiplier: number) => {
      currentScore.value = score
      currentMultiplier.value = multiplier
      
      // Update wind intensity based on current multiplier (more intense as risk increases)
      if (gameState.value === GameState.PLAYING && props.audioManager) {
        // Calculate intensity based on multiplier: starts at 0.3, increases to 0.8 at high multipliers
        const baseIntensity = 0.3
        const maxIntensity = 0.8
        const multiplierFactor = Math.min((multiplier - 1) / 10, 1) // Normalize multiplier to 0-1 over first 10x
        const intensity = baseIntensity + (maxIntensity - baseIntensity) * multiplierFactor
        props.audioManager.setWindIntensity(intensity)
      }
      
      // Check auto-land conditions for balloon 1
      if (autoLandEnabled1.value && gameState.value === GameState.PLAYING && !autoLandTriggered1 && !hasLanded1.value) {
        if (multiplier >= autoLandMultiplier1.value) {
          autoLandTriggered1 = true // Prevent multiple triggers
          setTimeout(() => autoLandNow1(multiplier), 500) // Small delay to show the auto-land indicator
        }
      }
      
      // Check auto-land conditions for balloon 2
      if (autoLandEnabled2.value && gameState.value === GameState.PLAYING && !autoLandTriggered2 && !hasLanded2.value) {
        if (multiplier >= autoLandMultiplier2.value) {
          autoLandTriggered2 = true // Prevent multiple triggers
          setTimeout(() => autoLandNow2(multiplier), 500) // Small delay to show the auto-land indicator
        }
      }
      
      // Legacy auto-land check (for backward compatibility)
      if (autoLandEnabled.value && gameState.value === GameState.PLAYING && !autoLandTriggered && !hasLanded.value) {
        if (multiplier >= autoLandMultiplier.value) {
          autoLandTriggered = true // Prevent multiple triggers
          setTimeout(() => autoLandNow(multiplier), 500) // Small delay to show the auto-land indicator
        }
      }
    }
    
    game.onLand = (score: number) => {
      finalScore.value = score
      hasLanded.value = true // Mark that player has landed successfully
      // Only store multiplier if not already set (for auto-land)
      if (landingMultiplier.value === undefined) {
        landingMultiplier.value = currentMultiplier.value // Store the multiplier when landed
      }
      
      // Play landing fanfare
      playLandingSound()
      
      // Don't end the round - just record the score and continue playing
      // The round will only end when the balloon crashes
    }
    
    // Add separate landing callbacks for each balloon if they exist
    if (game.onLand1) {
      game.onLand1 = (score: number) => {
        finalScore.value = score
        hasLanded1.value = true
        if (landingMultiplier1.value === undefined) {
          landingMultiplier1.value = currentMultiplier.value
        }
        playLandingSound()
      }
    }
    
    if (game.onLand2) {
      game.onLand2 = (score: number) => {
        finalScore.value = score
        hasLanded2.value = true
        if (landingMultiplier2.value === undefined) {
          landingMultiplier2.value = currentMultiplier.value
        }
        playLandingSound()
      }
    }
    
    game.onCrash1 = (score: number) => {
      console.log('Balloon 1 crashed!')
      // Play balloon pop sound
      playPopSound()
      
      // Check if both balloons have crashed
      if (game?.hasBalloon1Crashed() && game?.hasBalloon2Crashed()) {
        // Both balloons crashed - end the game
        endGameRound(score)
      }
    }
    
    game.onCrash2 = (score: number) => {
      console.log('Balloon 2 crashed!')
      // Play balloon pop sound
      playPopSound()
      
      // Check if both balloons have crashed
      if (game?.hasBalloon1Crashed() && game?.hasBalloon2Crashed()) {
        // Both balloons crashed - end the game
        endGameRound(score)
      }
    }
    
    // Start initial countdown
    console.log('Starting initial countdown...')
    startCountdown()
  } catch (error) {
    console.error('Failed to initialize game:', error)
    // Create a fallback UI state
    gameState.value = GameState.WAITING
    setTimeout(() => {
      console.log('Retrying game initialization...')
      initializeGame()
    }, 1000)
  }
}

const startGame = (): void => {
  if (game) {
    // Let the game handle its own restart completely
    game.restartGame()
    
    // Reset our component state
    currentScore.value = 0
    currentMultiplier.value = 1
    
    // Reset balloon 1 state
    hasLanded1.value = false
    landingMultiplier1.value = undefined
    autoLandTriggered1 = false
    
    // Reset balloon 2 state
    hasLanded2.value = false
    landingMultiplier2.value = undefined
    autoLandTriggered2 = false
    
    // Reset legacy state
    hasLanded.value = false
    landingMultiplier.value = undefined
    autoLandTriggered = false
    
    // Now start the game
    game.startGame()
  }
}

const landNow1 = (): void => {
  if (game && gameState.value === GameState.PLAYING) {
    game.landBalloon1()
  }
}

const landNow2 = (): void => {
  if (game && gameState.value === GameState.PLAYING) {
    game.landBalloon2()
  }
}

const landNow = (): void => {
  if (game && gameState.value === GameState.PLAYING) {
    game.landBalloon() // Legacy method that lands both
  }
}

const autoLandNow1 = (targetMultiplier: number): void => {
  if (game && gameState.value === GameState.PLAYING && !hasLanded1.value) {
    // Store the target multiplier before landing
    landingMultiplier1.value = targetMultiplier
    game.landBalloon1()
  }
}

const autoLandNow2 = (targetMultiplier: number): void => {
  if (game && gameState.value === GameState.PLAYING && !hasLanded2.value) {
    // Store the target multiplier before landing
    landingMultiplier2.value = targetMultiplier
    game.landBalloon2()
  }
}

const autoLandNow = (targetMultiplier: number): void => {
  if (game && gameState.value === GameState.PLAYING && !hasLanded.value) {
    // Store the target multiplier before landing
    landingMultiplier.value = targetMultiplier
    game.landBalloon() // Legacy method
  }
}

// Auto-land methods for balloon 1
const toggleAutoLand1 = (): void => {
  autoLandEnabled1.value = !autoLandEnabled1.value
}

const updateAutoLandMultiplier1 = (multiplier: number): void => {
  autoLandMultiplier1.value = Math.max(1.01, multiplier)
}

// Auto-land methods for balloon 2
const toggleAutoLand2 = (): void => {
  autoLandEnabled2.value = !autoLandEnabled2.value
}

const updateAutoLandMultiplier2 = (multiplier: number): void => {
  autoLandMultiplier2.value = Math.max(1.01, multiplier)
}

// Legacy auto-land methods
const toggleAutoLand = (): void => {
  autoLandEnabled.value = !autoLandEnabled.value
}

const updateAutoLandMultiplier = (multiplier: number): void => {
  autoLandMultiplier.value = Math.max(1.01, multiplier)
}

// Game end helper method
const endGameRound = (score: number): void => {
  console.log('Both balloons crashed! Ending game round...')
  
  // Stop wind sound
  if (props.audioManager) {
    props.audioManager.setWindIntensity(0)
  }
  
  // Update final score and reset all states
  finalScore.value = score
  
  // Reset balloon 1 state
  landingMultiplier1.value = undefined
  autoLandTriggered1 = false
  
  // Reset balloon 2 state
  landingMultiplier2.value = undefined
  autoLandTriggered2 = false
  
  // Reset legacy state
  landingMultiplier.value = undefined
  autoLandTriggered = false
  
  // Start countdown after showing results for 2 seconds
  setTimeout(() => {
    gameState.value = GameState.WAITING // Ensure we're in waiting state
    startCountdown()
  }, 2000)
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
  
  // Stop all sounds when component unmounts
  if (props.audioManager) {
    props.audioManager.stopAllSounds()
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
