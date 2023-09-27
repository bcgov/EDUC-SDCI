<template>
  <div>
    <h1>Offshore Schools</h1>

    <ul>
      <li v-for="school in offshoreSchools" :key="school.mincode">{{ school.displayName }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const appStore = useAppStore()
const { offshoreSchools } = storeToRefs(appStore)
</script>

<style></style>
