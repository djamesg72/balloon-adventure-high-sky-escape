<template>
  <div class="game-hud">
    <!-- Score Panel - Always visible -->
    <div class="score-panel">
      <div class="score">Score: {{ currentScore }}</div>
      <div class="game-status">{{ getGameStatusText() }}</div>
      <div class="multiplier">{{ currentMultiplier.toFixed(2) }}x</div>
    </div>
    
    <!-- Bottom HUD Panel - Always visible -->
    <div class="bottom-hud">
      <!-- Timer Bar - Between rounds only (shared for both betting modules) -->
      <div class="timer-section" v-if="gameState === 'waiting' || gameState === 'crashed' || gameState === 'landed'">
        <div class="timer-message">Next round starting in {{ countdownSeconds }}...</div>
        <div class="timer-bar">
          <div 
            class="timer-fill" 
            :style="{ 
              width: `${timeProgress}%`,
              backgroundColor: getTimerColor()
            }"
          ></div>
        </div>
      </div>
      
      <!-- Betting Modules Container -->
      <div class="betting-modules">
        <!-- Betting Module 1 -->
        <div class="betting-module">
          <!-- Auto Land Settings -->
          <div class="auto-land-section">
            <div class="auto-land-header">
              <span>Auto Land</span>
              <button 
                @click="toggleAutoLand1" 
                :class="['toggle-btn', { active: autoLandEnabled1 }]"
              >
                {{ autoLandEnabled1 ? 'ON' : 'OFF' }}
              </button>
            </div>
            
            <div class="auto-land-controls" v-if="autoLandEnabled1">
              <div class="control-group">
                <span class="on-label">ON:</span>
                <input 
                  type="number" 
                  :value="autoLandMultiplier1"
                  @input="updateAutoLandMultiplier1(($event.target as HTMLInputElement).valueAsNumber)"
                  min="1.01" 
                  max="50"
                  step="0.1"
                  class="multiplier-input"
                />
              </div>
            </div>
          </div>
          
          <!-- Land Button 1 -->
          <button 
            @click="landNow1" 
            :disabled="gameState !== 'playing' || hasLanded1"
            :class="['land-button', { 
              'auto-triggered': autoLandEnabled1 && shouldAutoLand1,
              'disabled': gameState !== 'playing' || hasLanded1,
              'landed': hasLanded1
            }]"
          >
            {{ hasLanded1 && landingMultiplier1 ? `✅ LANDED AT ${landingMultiplier1.toFixed(2)}x!` : (hasLanded1 ? '✅ LANDED SAFELY!' : (autoLandEnabled1 && shouldAutoLand1 ? '🤖 AUTO LANDING' : '🪂 LAND NOW')) }}
          </button>
        </div>

        <!-- Betting Module 2 -->
        <div class="betting-module">
          <!-- Auto Land Settings -->
          <div class="auto-land-section">
            <div class="auto-land-header">
              <span>Auto Land</span>
              <button 
                @click="toggleAutoLand2" 
                :class="['toggle-btn', { active: autoLandEnabled2 }]"
              >
                {{ autoLandEnabled2 ? 'ON' : 'OFF' }}
              </button>
            </div>
            
            <div class="auto-land-controls" v-if="autoLandEnabled2">
              <div class="control-group">
                <span class="on-label">ON:</span>
                <input 
                  type="number" 
                  :value="autoLandMultiplier2"
                  @input="updateAutoLandMultiplier2(($event.target as HTMLInputElement).valueAsNumber)"
                  min="1.01" 
                  max="50"
                  step="0.1"
                  class="multiplier-input"
                />
              </div>
            </div>
          </div>
          
          <!-- Land Button 2 -->
          <button 
            @click="landNow2" 
            :disabled="gameState !== 'playing' || hasLanded2"
            :class="['land-button', { 
              'auto-triggered': autoLandEnabled2 && shouldAutoLand2,
              'disabled': gameState !== 'playing' || hasLanded2,
              'landed': hasLanded2
            }]"
          >
            {{ hasLanded2 && landingMultiplier2 ? `✅ LANDED AT ${landingMultiplier2.toFixed(2)}x!` : (hasLanded2 ? '✅ LANDED SAFELY!' : (autoLandEnabled2 && shouldAutoLand2 ? '🤖 AUTO LANDING' : '🪂 LAND NOW')) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, type PropType } from 'vue'
import { GameState } from '../types/game'

// Props
const props = defineProps({
  gameState: {
    type: String as PropType<GameState>,
    required: true
  },
  currentScore: {
    type: Number,
    required: true
  },
  currentMultiplier: {
    type: Number,
    required: true
  },
  timeProgress: {
    type: Number,
    default: 100
  },
  countdownSeconds: {
    type: Number,
    default: 5
  },
  // Betting Module 1 props
  autoLandEnabled1: {
    type: Boolean,
    default: false
  },
  autoLandMultiplier1: {
    type: Number,
    default: 2.0
  },
  hasLanded1: {
    type: Boolean,
    default: false
  },
  landingMultiplier1: {
    type: Number,
    default: null
  },
  // Betting Module 2 props
  autoLandEnabled2: {
    type: Boolean,
    default: false
  },
  autoLandMultiplier2: {
    type: Number,
    default: 3.0
  },
  hasLanded2: {
    type: Boolean,
    default: false
  },
  landingMultiplier2: {
    type: Number,
    default: null
  },
  // Legacy props for backward compatibility
  autoLandEnabled: {
    type: Boolean,
    default: false
  },
  autoLandMultiplier: {
    type: Number,
    default: 2.0
  },
  hasLanded: {
    type: Boolean,
    default: false
  },
  landingMultiplier: {
    type: Number,
    default: null
  }
})

// Emits
const emit = defineEmits<{
  // Betting Module 1
  landNow1: []
  toggleAutoLand1: []
  updateAutoLandMultiplier1: [multiplier: number]
  // Betting Module 2
  landNow2: []
  toggleAutoLand2: []
  updateAutoLandMultiplier2: [multiplier: number]
  // Legacy events for backward compatibility
  landNow: []
  toggleAutoLand: []
  updateAutoLandMultiplier: [multiplier: number]
}>()

// Computed properties
const shouldAutoLand1 = computed(() => {
  return props.autoLandEnabled1 && props.currentMultiplier >= props.autoLandMultiplier1
})

const shouldAutoLand2 = computed(() => {
  return props.autoLandEnabled2 && props.currentMultiplier >= props.autoLandMultiplier2
})

const shouldAutoLand = computed(() => {
  return props.autoLandEnabled && props.currentMultiplier >= props.autoLandMultiplier
})

// No longer watching for auto-land trigger here - moved to backend for better control

// Methods
const landNow1 = () => {
  emit('landNow1')
}

const toggleAutoLand1 = () => {
  emit('toggleAutoLand1')
}

const updateAutoLandMultiplier1 = (multiplier: number) => {
  if (!isNaN(multiplier) && multiplier >= 1.01) {
    emit('updateAutoLandMultiplier1', multiplier)
  }
}

const landNow2 = () => {
  emit('landNow2')
}

const toggleAutoLand2 = () => {
  emit('toggleAutoLand2')
}

const updateAutoLandMultiplier2 = (multiplier: number) => {
  if (!isNaN(multiplier) && multiplier >= 1.01) {
    emit('updateAutoLandMultiplier2', multiplier)
  }
}

// Legacy methods for backward compatibility
const landNow = () => {
  emit('landNow')
}

const toggleAutoLand = () => {
  emit('toggleAutoLand')
}

const updateAutoLandMultiplier = (multiplier: number) => {
  if (!isNaN(multiplier) && multiplier >= 1.01) {
    emit('updateAutoLandMultiplier', multiplier)
  }
}

// Get game status text for HUD
const getGameStatusText = (): string => {
  switch (props.gameState) {
    case GameState.WAITING:
      return 'Starting next round...'
    case GameState.PLAYING:
      return props.hasLanded ? '🎉 Landed Safely! Waiting for crash...' : 'Flying - Make your move!'
    case GameState.LANDED:
      return '🎉 Safe Landing!'
    case GameState.CRASHED:
      return props.hasLanded ? '🎉 You Won! Landed before crash!' : '💥 Balloon Popped!'
    default:
      return ''
  }
}

// Timer color based on progress (green to red)
const getTimerColor = (): string => {
  const progress = props.timeProgress
  if (progress > 60) return '#4ade80' // Green - plenty of time
  if (progress > 30) return '#fbbf24' // Yellow - time running out
  if (progress > 10) return '#f97316' // Orange - urgent
  return '#ef4444' // Red - critical
}
</script>

<style scoped>
.game-hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 15;
}

.game-hud > * {
  pointer-events: auto;
}

/* Score Panel - TOP */
.score-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
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

.game-status {
  font-size: 1.1em;
  font-weight: 500;
  color: #fbbf24;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  margin-top: 5px;
}

/* Bottom HUD Panel */
.bottom-hud {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(30, 30, 50, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Betting Modules Container */
.betting-modules {
  display: flex;
  gap: 20px;
  width: 100%;
}

.betting-module {
  flex: 1;
  background: rgba(40, 40, 60, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.module-title {
  font-size: 1.1em;
  font-weight: bold;
  color: #ffffff;
}

.bet-amount {
  font-size: 1em;
  font-weight: bold;
  color: #64ffda;
  background: rgba(100, 255, 218, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

/* Timer Section - Between rounds */
.timer-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.timer-message {
  color: #b8c5d6;
  font-size: 0.95em;
  font-weight: 500;
  text-align: center;
}

.timer-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.timer-fill {
  height: 100%;
  transition: width 0.1s ease, background-color 0.3s ease;
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

/* Auto Land Section */
.auto-land-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auto-land-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auto-land-header span {
  font-size: 1.2em;
  font-weight: bold;
  color: #ffffff;
}

.toggle-btn {
  padding: 8px 16px;
  border: 2px solid #666;
  background: rgba(50, 50, 70, 0.8);
  color: #ccc;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.toggle-btn.active {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
}

.auto-land-controls {
  display: flex;
  justify-content: center;
  align-items: start;
}

.control-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}

.on-label {
  color: #ffffff;
  font-size: 1em;
  font-weight: bold;
}

.control-group label {
  color: #b8c5d6;
  font-size: 0.9em;
  font-weight: 500;
}

.multiplier-input {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(50, 50, 70, 0.8);
  color: #ffffff;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  text-align: center;
}

.multiplier-input:focus {
  outline: none;
  border-color: #4ade80;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background: rgba(50, 50, 70, 0.5);
  border-radius: 8px;
  flex: 1;
  margin-left: 10px;
}

.status-item span:first-child {
  color: #b8c5d6;
  font-size: 0.9em;
}

.status-indicator {
  font-weight: bold;
  color: #666;
  transition: all 0.3s ease;
}

.status-indicator.reached {
  color: #4ade80;
  text-shadow: 0 0 5px rgba(74, 222, 128, 0.5);
}

/* Land Button - PART OF BOTTOM PANEL */
.land-button {
  font-size: 1.4em;
  padding: 18px 40px;
  background: linear-gradient(45deg, #4ade80, #22c55e);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(74, 222, 128, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.land-button:hover:not(.landed):not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(74, 222, 128, 0.6);
  background: linear-gradient(45deg, #22c55e, #16a34a);
}

.land-button:active {
  transform: translateY(0);
}

.land-button.auto-triggered {
  background: linear-gradient(45deg, #667eea, #764ba2);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  animation: pulse-auto 1s ease-in-out infinite;
}

.land-button.disabled {
  background: rgba(100, 100, 120, 0.3);
  color: rgba(255, 255, 255, 0.4);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.land-button.disabled:hover {
  background: rgba(100, 100, 120, 0.3);
  color: rgba(255, 255, 255, 0.4);
  box-shadow: none;
  transform: none;
}

.land-button.landed {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  cursor: default;
  animation: pulse-success 2s ease-in-out infinite;
}

.land-button.landed:hover {
  background: linear-gradient(45deg, #10b981, #059669);
  transform: none;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

@keyframes pulse-success {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes pulse-auto {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .score-panel {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .bottom-hud {
    bottom: 10px;
    left: 10px;
    right: 10px;
  }
  
  .betting-modules {
    flex-direction: column;
    gap: 15px;
  }
  
  .land-button {
    font-size: 1.2em;
    padding: 15px 30px;
  }
  
  .auto-land-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .status-item {
    margin-left: 0;
  }
}

@media (max-width: 600px) {
  .score {
    font-size: 1.2em;
  }
  
  .multiplier {
    font-size: 1.5em;
  }
  
  .score-panel {
    padding: 10px 15px;
  }
  
  .bottom-hud {
    padding: 15px;
  }
  
  .betting-module {
    padding: 12px;
  }
  
  .module-title {
    font-size: 1em;
  }
  
  .bet-amount {
    font-size: 0.9em;
  }
}
</style>
