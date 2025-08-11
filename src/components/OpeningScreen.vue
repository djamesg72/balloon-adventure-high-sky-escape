<template>
  <div class="opening-screen" v-if="showScreen" @click="startGame" @touchstart="startGame">
    <div class="opening-container">
      <div class="balloon-logo">
        <div class="game-balloon">
          <!-- Hot Air Balloon SVG -->
          <svg viewBox="0 0 120 180" width="120" height="180" class="balloon-svg">
            <!-- Balloon envelope (main body) -->
            <defs>
              <radialGradient id="balloonGradient" cx="0.3" cy="0.3" r="0.8">
                <stop offset="0%" style="stop-color:#ff8a80"/>
                <stop offset="30%" style="stop-color:#ff6b6b"/>
                <stop offset="70%" style="stop-color:#e74c3c"/>
                <stop offset="100%" style="stop-color:#c0392b"/>
              </radialGradient>
              <linearGradient id="basketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#8b4513"/>
                <stop offset="50%" style="stop-color:#6b3410"/>
                <stop offset="100%" style="stop-color:#5a2d0c"/>
              </linearGradient>
            </defs>
            
            <!-- Balloon body -->
            <ellipse cx="60" cy="50" rx="45" ry="55" fill="url(#balloonGradient)" stroke="#c0392b" stroke-width="1"/>
            
            <!-- Balloon segments (like real hot air balloons) -->
            <path d="M 20 35 Q 60 25 100 35" stroke="#c0392b" stroke-width="1.5" fill="none" opacity="0.6"/>
            <path d="M 25 50 Q 60 40 95 50" stroke="#c0392b" stroke-width="1.5" fill="none" opacity="0.6"/>
            <path d="M 30 65 Q 60 55 90 65" stroke="#c0392b" stroke-width="1.5" fill="none" opacity="0.6"/>
            <path d="M 35 80 Q 60 70 85 80" stroke="#c0392b" stroke-width="1.5" fill="none" opacity="0.6"/>
            
            <!-- Vertical segments -->
            <line x1="35" y1="15" x2="40" y2="95" stroke="#c0392b" stroke-width="1" opacity="0.4"/>
            <line x1="60" y1="5" x2="60" y2="100" stroke="#c0392b" stroke-width="1" opacity="0.4"/>
            <line x1="85" y1="15" x2="80" y2="95" stroke="#c0392b" stroke-width="1" opacity="0.4"/>
            
            <!-- Highlight on balloon -->
            <ellipse cx="45" cy="35" rx="12" ry="15" fill="rgba(255,255,255,0.3)"/>
            
            <!-- Basket -->
            <rect x="48" y="120" width="24" height="18" fill="url(#basketGradient)" stroke="#5a2d0c" stroke-width="1"/>
            <rect x="49" y="121" width="22" height="2" fill="#8b4513"/>
            
            <!-- Basket weave pattern -->
            <line x1="52" y1="122" x2="52" y2="137" stroke="#5a2d0c" stroke-width="0.5"/>
            <line x1="56" y1="122" x2="56" y2="137" stroke="#5a2d0c" stroke-width="0.5"/>
            <line x1="60" y1="122" x2="60" y2="137" stroke="#5a2d0c" stroke-width="0.5"/>
            <line x1="64" y1="122" x2="64" y2="137" stroke="#5a2d0c" stroke-width="0.5"/>
            <line x1="68" y1="122" x2="68" y2="137" stroke="#5a2d0c" stroke-width="0.5"/>
            
            <!-- Ropes connecting balloon to basket -->
            <line x1="40" y1="100" x2="50" y2="120" stroke="#2c3e50" stroke-width="1.5"/>
            <line x1="60" y1="105" x2="60" y2="120" stroke="#2c3e50" stroke-width="1.5"/>
            <line x1="80" y1="100" x2="70" y2="120" stroke="#2c3e50" stroke-width="1.5"/>
            
            <!-- Small basket details -->
            <circle cx="54" cy="130" r="1" fill="#5a2d0c"/>
            <circle cx="66" cy="130" r="1" fill="#5a2d0c"/>
          </svg>
        </div>
      </div>
      <h1 class="game-title">Balloon Adventure</h1>
      <p class="game-subtitle">High Sky Escape</p>
      
      <button 
        class="start-button"
        @click="startGame"
        @touchend="startGame"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Start Adventure' }}
      </button>
      
      <div class="loading-indicator" v-if="loading">
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AudioManager } from '../utils/audioManager'

const emit = defineEmits<{
  gameStarted: [audioManager: AudioManager]
}>()

const showScreen = ref(true)
const loading = ref(false)

let audioManager: AudioManager | null = null

const startGame = async (event?: Event) => {
  event?.preventDefault()
  event?.stopPropagation()
  
  loading.value = true
  
  try {
    // Initialize audio manager
    audioManager = new AudioManager()
    
    // Start audio loading in background - don't wait for it
    audioManager.loadGameSounds()
    audioManager.playGameStartSound()
    
    // Start game immediately without waiting for audio
    showScreen.value = false
    emit('gameStarted', audioManager)
    
  } catch (error) {
    console.warn('Game initialization failed:', error)
    // Continue even if there are errors - create a muted audio manager
    audioManager = new AudioManager()
    audioManager.setMuted(true)
    showScreen.value = false
    emit('gameStarted', audioManager)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.opening-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #FFE4B5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: 'Arial', sans-serif;
  padding: 1rem;
  box-sizing: border-box;
  overflow-y: auto;
  cursor: pointer;
}

.opening-container {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
}

.balloon-logo {
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.game-balloon {
  display: inline-block;
  filter: drop-shadow(0 4px 15px rgba(231, 76, 60, 0.3));
}

.balloon-svg {
  width: 100px;
  height: 150px;
  animation: gentle-sway 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes gentle-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

.game-title {
  font-size: clamp(1.8rem, 6vw, 2.5rem);
  font-weight: bold;
  color: #2c3e50;
  margin: 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
}

.game-subtitle {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.start-button {
  background: linear-gradient(45deg, #e74c3c, #f39c12);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
  width: 100%;
  max-width: 250px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.start-button:active {
  transform: translateY(0);
}

.start-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-indicator {
  margin-top: 1rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile-specific improvements */
@media (max-width: 480px) {
  .opening-container {
    padding: 1.5rem;
    margin: 0.5rem;
    border-radius: 15px;
  }
  
  .balloon-svg {
    width: 80px;
    height: 120px;
  }
}

/* High DPI / Retina displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .opening-container {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
}

/* Landscape mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .opening-screen {
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .opening-container {
    max-height: 85vh;
  }
  
  .balloon-svg {
    width: 70px;
    height: 105px;
  }
}

/* Touch device improvements */
@media (pointer: coarse) {
  .start-button {
    min-height: 48px;
    padding: 1.2rem 2rem;
  }
}
</style>