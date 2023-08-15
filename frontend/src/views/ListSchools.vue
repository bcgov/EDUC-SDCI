<template>
  <div>
    <h1>Schools</h1>
    <p>App.vue on start up accesses the institute api and store the response using pinia.
    ListSchools.vue uses the stored response from pinia store</p>
    <p style="float:left; height: 200px; width:300px overflow: scroll">
      <ul>
        <li v-for="school in schools" :key="school.mincode">{{ school.displayName }}</li>
      </ul>
    </p>
  </div>
</template>
<script>
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

export default {
  setup() {
    const appStore = useAppStore()
    const { schools } = storeToRefs(appStore);
    return { schools }
  }
}
</script>
<style>
</style>
