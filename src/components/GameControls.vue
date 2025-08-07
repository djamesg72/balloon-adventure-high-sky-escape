<template>
  <div class="game-controls">
    <button @click="landBalloon" class="land-button">Land Now</button>
    <button @click="resetGame" class="reset-button">Play Again</button>
  </div>
</template>

<script>
export default {
  methods: {
    landBalloon() {
      this.$emit('land');
    },
    resetGame() {
      this.$emit('reset');
    }
  }
}
</script>

<style scoped>
.game-controls {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.land-button, .reset-button {
  padding: 10px 20px;
  font-size: 16px;
  margin: 0 10px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

.land-button:hover, .reset-button:hover {
  background-color: #45a049;
}
</style>