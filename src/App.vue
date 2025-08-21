<script setup>
import { RouterLink, RouterView } from 'vue-router'
import OpeningView from './views/OpeningView.vue'
import { ref, computed } from 'vue'
const openingPage = ref(true)
function closeOpeningPage() {
  console.log('closing opening page')
  openingPage.value = false
}
const navVisibility = computed(() => {
  if (openingPage.value) {
    return {
      visibility: 'hidden',
    }
  } else {
    return {
      visibility: 'visible',
    }
  }
})
</script>

<template>
  <OpeningView v-if="openingPage" @start="closeOpeningPage" />

  <RouterView />

  <nav :style="navVisibility">
    <RouterLink to="/">Quiz</RouterLink>
    <RouterLink to="/about">About</RouterLink>
  </nav>
  <div class="texture texture_fleck"></div>
  <div class="texture texture_350"></div>
  <div class="texture texture_375"></div>
</template>

<style scoped>
.texture {
  position: fixed;
  z-index: 99;
  width: 100vw;
  height: 100vh;
  top: 0px;
  left: 0px;
  pointer-events: none;
}
.texture_350 {
  background: url('/texture/texture_350.png') 50% / cover;
  mix-blend-mode: screen;
}
.texture_375 {
  background: url('/texture/texture_375.png') 50% / cover;
  mix-blend-mode: soft-light;
}
.texture_fleck {
  background: url('/texture/texture_flecks.png') 50% / cover;
  opacity: 0.5;
  mix-blend-mode: darken;
}
</style>
