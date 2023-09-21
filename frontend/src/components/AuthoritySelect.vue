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

function downloadAuthorityMailing() {
  alert('TODO - Implement authority mailing download')
}
function downloadAuthorityContacts() {
  alert('TODO - Implement authority contacts download')
}
</script>

<template>
  <v-container fluid>
    <v-card class="pa-6">
      <h2 class="mb-3">Independent Authority Information</h2>
      <v-row no-gutters>
        <v-col class="mr-6">
          <v-autocomplete
            v-model="selectedAuthority"
            label="Select an Independent Authority"
            :items="appStore.getAuthoritiesList"
            :item-title="(item) => (item ? item.authorityNumber + ' - ' + item.displayName : '')"
            :item-value="(item) => item"
          ></v-autocomplete>
          <v-btn
            color="primary"
            class="text-none text-subtitle-1"
            variant="flat"
            @click="goToAuthority"
            >View Authority Info</v-btn
          >
        </v-col>
        <v-spacer />
        <v-col class="ml-6" cols="4">
          <v-btn
            block
            class="text-none text-subtitle-1 ma-1"
            variant="outlined"
            @click="downloadAuthorityContacts"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template> Contacts for All
            Authorities</v-btn
          >
          <v-btn
            block
            class="text-none text-subtitle-1 ma-1"
            variant="outlined"
            @click="downloadAuthorityMailing"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template> Mailing for All
            Authorities</v-btn
          >
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
