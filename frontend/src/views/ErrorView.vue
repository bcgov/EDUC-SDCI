<template>
  <div class="error-container">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for could not be found.</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps()
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.5rem;
  text-align: center;
}
</style>
