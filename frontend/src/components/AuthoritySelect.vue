<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { useSanitizeURL } from '@/composables/string'

const appStore = useAppStore()
const selectedAuthority = ref('')

function goToAuthority() {
  console.log('goTOAuthority() pressed')
  router.push({
    name: 'authority',
    params: {
      authorityNumber: selectedAuthority.value?.authorityNumber,
      displayName: selectedAuthority.value?.displayName
    }
  })
}
</script>

<template>
  <v-container fluid>
    <h2>Independent Authority Information</h2>
    <v-row no-gutters justify="space-between">
      <v-col class="mr-6">
        <v-autocomplete
          v-model="selectedAuthority"
          label="Select an Independent Authority"
          :items="appStore.getAuthoritiesList"
          :item-title="(item) => (item ? item.authorityNumber + ' - ' + item.displayName : '')"
          :item-value="(item) => item"
        ></v-autocomplete>
        <v-btn class="text-none text-subtitle-1" variant="flat" @click="goToAuthority"
          >View Authority Info</v-btn
        >
      </v-col>
      <v-col class="ml-6"> </v-col>
    </v-row>
  </v-container>
</template>
