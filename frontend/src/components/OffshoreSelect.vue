<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { useSanitizeURL } from '@/composables/string'

// Type Imports
import type { ListSchool } from '@/types/types'
import type { Ref } from 'vue'

const appStore = useAppStore()
const selectedOffshoreSchool: Ref<ListSchool | null> = ref(null)

function viewOffshoreSchools() {
  router.push({
    name: 'offshore'
  })
}

function downloadOffshoreSchoolInfo() {
  alert('TODO - Implement offshore school info extract download')
}

function downloadOffshoreSchoolReps() {
  alert('TODO - Implement offshore school representative extract download')
}
</script>

<template>

  <v-container fluid>
    <v-card class="pa-6">
      <h2 class="mb-3">BC Offshore Schools</h2>
      <v-row no-gutters justify="space-between">
        <v-col class="mr-6">
          <v-btn
            color="primary"
            class="text-none text-subtitle-1"
            variant="flat"
            @click="viewOffshoreSchools"
            >View Offshore Schools</v-btn
          >
        </v-col>
        <v-spacer />
        <v-col class="ml-6" cols="4">
          <v-btn
            block
            class="text-none text-subtitle-1 ma-1"
            variant="outlined"
            @click="downloadOffshoreSchoolInfo"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Offshore School
            Info</v-btn
          >
          <v-btn
            block
            class="text-none text-subtitle-1 ma-1"
            variant="outlined"
            @click="downloadOffshoreSchoolReps"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Offshore School
            Representatives</v-btn
          >
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
