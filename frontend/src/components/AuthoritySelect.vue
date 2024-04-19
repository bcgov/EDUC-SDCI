<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { useSanitizeURL } from '@/composables/string'

import type { ListAuthority } from '@/types/types'
import type { Ref } from 'vue'

const appStore = useAppStore()
const selectedAuthority: Ref<ListAuthority | null> = ref(null)

function goToAuthority() {
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
  <v-card class="px-6 py-4 w-100">
    <h2 class="mb-5">Independent Authorities</h2>
    <v-row no-gutters justify="space-between">
      <v-col class="ma-2">
        <v-row justify="space-between">
          <v-col cols="10" class="pa-0">
            <v-autocomplete
              class="mr-2"
              v-model="selectedAuthority"
              label="Select an Authority"
              :items="appStore.getAuthoritiesList"
              :item-title="(item) => (item ? item.authorityNumber + ' - ' + item.displayName : '')"
              :item-value="(item) => item"
            ></v-autocomplete>
          </v-col>
          <v-col cols="2" class="pa-0">
            <v-btn
              icon="mdi-magnify"
              color="primary"
              variant="flat"
              rounded="lg"
              size="large"
              @click="goToAuthority"
              class="v-btn-align-left text-none text-subtitle-1 ml-1"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-btn
            href="/api/v1/download/csv/authority/all-mailing/INDEPENDNT?filepath=authoritymailing"
            variant="text"
            class="v-btn-align-left text-none wrap text-subtitle-1 my-1 text-wrap"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Mailing for All
            Authorities (CSV)</v-btn
          >
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
