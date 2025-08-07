<template>
  <div id="app">
    <BalloonGameComponent />
  </div>
</template>

<script setup lang="ts">
import BalloonGameComponent from './components/BalloonGameComponent.vue'
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