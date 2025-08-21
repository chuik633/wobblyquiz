<template>
  <div class="game-container"></div>
</template>

<style lang="css" scoped></style>

<script setup>
import { onMounted } from 'vue'
import * as d3 from 'd3'
const emit = defineEmits(['submit'])
onMounted(() => {
  const gameContainer = d3.select('.game-container')
})
</script>
