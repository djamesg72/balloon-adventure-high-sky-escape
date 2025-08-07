<template>
  <div class="score-display">
    <h2>Score: {{ score }}</h2>
    <h3>Altitude: {{ altitude }} m</h3>
  </div>
</template>

<script>
export default {
  props: {
    score: {
      type: Number,
      required: true
    },
    altitude: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped>
.score-display {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-family: 'Arial', sans-serif;
  z-index: 10;
}
</style>