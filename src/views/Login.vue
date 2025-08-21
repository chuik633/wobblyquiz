<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-element">
      <label for="name">Name:</label>
      <input id="name" v-model="name" type="text" required autocomplete="off" />
      <div class="form-element">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required autocomplete="off" />
      </div>
    </div>
    <button type="submit">Submit</button>
  </form>
</template>
<style scoped>
.form-element {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
input {
  background: inherit;
  border: 0.5px solid var(--brown);
  display: flex;
  padding: 5px;
}
</style>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['submit'])
const name = ref('')
const email = ref('')

function handleSubmit() {
  console.log('Name:', name.value)
  console.log('Email:', email.value)
  emit('submit', { name: name.value, email: email.value })
}
</script>
