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
  {{ offshoreSchools }}
  <v-card class="pa-6 mt-5">
    <h2 class="mb-5">BC Offshore Schools</h2>
    <v-row no-gutters>
      <v-col class="ma-1">
        <v-row>
          <v-btn
            block
            class="v-btn-align-left text-none text-subtitle-1 my-1"
            @click="viewOffshoreSchools"
            ><template v-slot:prepend> <v-icon icon="mdi-magnify" /></template>View Offshore
            Schools</v-btn
          >
          <v-btn
            block
            class="v-btn-align-left text-none text-subtitle-1 my-1"
            @click="downloadOffshoreSchoolInfo"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Offshore School
            Info</v-btn
          >
          <v-btn
            block
            class="v-btn-align-left text-none text-subtitle-1 my-1"
            @click="downloadOffshoreSchoolReps"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Offshore School
            Representatives</v-btn
          >
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
