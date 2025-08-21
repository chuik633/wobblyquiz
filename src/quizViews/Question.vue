<template>
  <div class="question-container">
    <h5>{{ description }}</h5>
    <h3 class="handwritten">{{ question }}</h3>
    <div class="spacer"></div>
    <div class="options-container">
      <div
        v-for="(option, i) of options"
        :data-index="i"
        class="option"
        @click="toggleOption(i)"
        :selected="isSelected(i)"
      >
        <!-- <div :data-index="i" class="selector"></div> -->
        <div :data-index="i" class="text">{{ option }}</div>
      </div>
    </div>
    <button @click="() => emit('submit', getSelected())">Submit</button>
  </div>
</template>

<style scoped>
.question-container {
  width: 100%;
  height: 100%;
  background-color: var(--neutral);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 60px;
  justify-content: flex-start;
}
.spacer {
  height: 20px;
}
.options-container {
  display: flex;
  width: 100%;
  max-width: 300px;

  flex-direction: column;
  gap: 15px;
}
.option {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: 1px solid var(--light-brown);
  transition: background-color 0.1s cubic-bezier(0.39, 0.575, 0.565, 1);
}
.option .text {
  color: var(--light-brown);
  font-size: 12px;
}

h3 {
  font-family: 'IBM';
  font-weight: 500;
  font-size: 22px;
  letter-spacing: 0px;
  text-align: center;
}
h5 {
  text-align: center;
  letter-spacing: 0px;
  font-size: 11px;
}
.option:hover {
  background-color: var(--yellow);
}

.option[selected='true'] {
  background-color: var(--light-brown);
  border: 0.5px solid var(--brown);
}
.option[selected='true'] .text {
  color: var(--neutral);
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'
import { replaceAllHandwritting } from '../components/subFont'
const emit = defineEmits(['submit'])

const props = defineProps({
  description: String,
  question: String,
  options: Array,
  selectMultiple: Boolean,
})

// keep a list of the selected items
const selected = ref(props.selectMultiple ? [] : null)

function toggleOption(index) {
  if (props.selectMultiple) {
    if (selected.value.includes(index)) {
      selected.value = selected.value.filter((i) => i !== index)
    } else {
      selected.value.push(index)
    }
  } else {
    selected.value = index
  }
}

function isSelected(index) {
  if (props.selectMultiple) {
    return selected.value.includes(index)
  } else {
    return selected.value === index
  }
}

function getSelected() {
  if (props.selectMultiple) {
    const selectedIndexes = selected.value
    return selectedIndexes.map((i) => props.options[i])
  } else {
    const selectedIndex = selected.value
    return props.options[selectedIndex]
  }
}
onMounted(() => {
  replaceAllHandwritting()
  window.addEventListener('resize', handleResize)
})
function handleResize() {
  replaceAllHandwritting()
}
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
