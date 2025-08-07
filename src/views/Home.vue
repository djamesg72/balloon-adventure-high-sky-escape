<template>
  <div class="home">
    <h1>Balloon Adventure – High Sky Escape</h1>
    <div id="game-container">
      <BalloonGame />
    </div>
    <ScoreDisplay />
    <GameControls />
  </div>
</template>

<script>
import BalloonGame from '../components/BalloonGame.vue';
import ScoreDisplay from '../components/ScoreDisplay.vue';
import GameControls from '../components/GameControls.vue';

export default {
  components: {
    BalloonGame,
    ScoreDisplay,
    GameControls
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #87CEEB;
  height: 100vh;
  color: #fff;
}

#game-container {
  width: 100%;
  height: 80%;
  position: relative;
}
</style>