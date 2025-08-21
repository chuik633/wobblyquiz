<template>
  <div class="about">
    <h1 class="wiggly">FRUITQUIZ</h1>
    <h4 class="handwritten animated">Wobbly Pottery x KathKodes</h4>
    <div class="spacer"></div>
    <p>
      Wobbly Pottery collab with her sibling who is currently freelance but needs some form of
      structure to feel normal. this is filler text and iwll not be here when this is done.
    </p>
    <p>
      This quiz was inspired by the iconic
      <a href="https://sophie006liu.github.io/vegetal/">vegetable quiz! </a>
    </p>
    <div class="spacer"></div>
    <div class="spacer"></div>
    <div class="spacer"></div>
    <h2>Why this?</h2>
    <p>We thought it would be fun to analyze you through games... and fun questions.</p>
    <div class="spacer"></div>
    <h2>Who are we?</h2>
    <p>We thought it would be fun to analyze you through games... and fun questions.</p>
  </div>
</template>
<script setup>
import { replaceAllHandwritting } from '../components/subFont'
import { replaceAllWiggly } from '../components/wigglyFont'
import { onMounted } from 'vue'

onMounted(() => {
  replaceAllHandwritting()
  replaceAllWiggly()
})
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
a:hover {
  font-style: italic;
}
h1 {
  font-family: Fredoka;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0px;
  font-size: 30px;
}
h2 {
  font-size: 12px;
  font-family: 'IBM';
  font-weight: 500 !important;

  text-transform: uppercase;
  font-weight: bold;
}
.spacer {
  height: 20px;
}
h4 {
  font-family: Futura;
  font-size: 20px;
}
p {
  font-size: 10px;
  letter-spacing: 0px;
}
.about {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
