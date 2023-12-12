<script setup lang="ts">
//import { ref } from 'vue'
//import { useAppStore } from '@/stores/app'
import router from '@/router'
//import { useSanitizeURL } from '@/composables/string'

// Type Imports
//import type { ListSchool } from '@/types/types'
//import type { Ref } from 'vue'

//const appStore = useAppStore()
//const selectedOffshoreSchool: Ref<ListSchool | null> = ref(null)

function viewOffshoreSchools() {
  router.push({
    name: 'offshore'
  })
}
</script>

<template>
  <v-card class="px-6 py-4 w-100">
    <h2 class="mb-5">BC Offshore Schools</h2>
    <v-row no-gutters>
      <v-col class="ma-1">
        <v-row>
          <v-btn
            block
            color="bcGovBlue"
            variant="outlined"
            class="text-none text-subtitle-1 mt-1 mb-4"
            @click="viewOffshoreSchools"
            ><template v-slot:append> <v-icon icon="mdi-chevron-right" /></template>View Offshore
            Schools</v-btn
          >
          <v-btn
            href="/api/v1/download/csv/authority/all-mailing/OFFSHORE?filepath=offshoreschoolrepresentatives"
            variant="text"
            class="v-btn-align-left text-none text-subtitle-1 my-1"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Offshore School
            Owner/Operators (CSV)</v-btn
          >
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
