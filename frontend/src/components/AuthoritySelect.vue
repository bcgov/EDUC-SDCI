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
  <v-card class="pa-6 mt-5">
    <h2 class="mb-5">Independent Authorities</h2>
    <v-row no-gutters>
      <v-col class="ma-1">
        <v-row>
          <v-autocomplete
            v-model="selectedAuthority"
            label="Select an Authority"
            :items="appStore.getAuthoritiesList"
            :item-title="(item) => (item ? item.authorityNumber + ' - ' + item.displayName : '')"
            :item-value="(item) => item"
            class="w-75"
          ></v-autocomplete>
          <v-btn
            icon="mdi-magnify"
            color="primary"
            variant="flat"
            rounded="lg"
            size="large"
            @click="goToAuthority"
            class="text-none text-subtitle-1 ml-3"
          />
        </v-row>
        <v-row>
          <v-btn
            block
            variant="text"
            class="v-btn-align-left text-none text-subtitle-1 my-1"
            @click="downloadAuthorityMailing"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template> Mailing for All
            Authorities (CSV)</v-btn
          >
          <v-btn
            block
            variant="text"
            class="v-btn-align-left text-none text-subtitle-1 my-1"
            @click="downloadAuthorityContacts"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Contacts for All
            Authorities (CSV)</v-btn
          >
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
