<template>
  <v-breadcrumbs class="breadcrumbs" bg-color="primary" :items="[{title: 'Home', href:'/'}, 'Offshore Schools']"></v-breadcrumbs>
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


<style>
/* sizes header to align with content on desktop */
.v-toolbar__content,
.v-toolbar__extension {
  max-width: 1280px;
  padding: 0 2rem;
}
</style>
