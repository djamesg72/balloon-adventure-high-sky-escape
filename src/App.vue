<template>
  <div id="app">
    <OpeningScreen 
      v-if="showOpeningScreen"
      @gameStarted="onGameStarted"
    />
    <BalloonGameComponent 
      v-else
      :audio-manager="audioManager"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BalloonGameComponent from './components/BalloonGameComponent.vue'
import OpeningScreen from './components/OpeningScreen.vue'
import type { AudioManager } from './utils/audioManager'

const showOpeningScreen = ref(true)
const audioManager = ref<AudioManager | null>(null)

const onGameStarted = (manager: AudioManager) => {
  audioManager.value = manager
  showOpeningScreen.value = false
  
  // Play start sound
  manager.playStartSound()
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
</style>