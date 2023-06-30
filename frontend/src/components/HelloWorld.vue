<script setup lang="ts">
defineProps<{
  msg: string
}>()
import { ref } from 'vue'
import axios from 'axios'

const data = ref([]) // Placeholder for the received data

const getData = () => {
  axios
    .get('http://localhost:8080/api/v1/institute/district') // Replace with your API endpoint
    .then((response) => {
      data.value = response.data // Update the value of the data ref
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<template>
  <div>
    <!-- Your component's template here -->
    <button @click="getData">Get Data</button>
    <ul>
      <li v-for="item in data" :key="item.displayId">{{ item.displayName }}</li>
    </ul>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
