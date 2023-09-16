<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { useSanitizeURL } from '@/composables/string'
import type { ListDistrict } from '@/types/types'

const appStore = useAppStore()
const selectedSchool = ref({
  displayName: '',
  mincode: '',
  schoolId: ''
} as ListSchool) // placeholder

function goToSchool() {
  if (selectedSchool.value?.displayName) {
    console.log('GOING TO SCHOOL')
    router.push({
      name: 'school',
      params: {
        displayName: useSanitizeURL(String(selectedSchool.value?.displayName)),
        schoolNumber: useSanitizeURL(String(selectedSchool.value?.mincode)),
        schoolId: useSanitizeURL(String(selectedSchool.value?.schoolId))
      }
    })
  }
}

function downloadAllSchoolsInfo() {
  alert('TODO - Implement all schools info extract download')
}

function downloadAllSchoolsMailing() {
  alert('TODO - Implement all schools mailing extract download')
}
</script>

<template>
  <v-container fluid>
    <h2>School Information</h2>
    <v-row no-gutters justify="space-between">
      <v-col class="mr-6">
        <v-autocomplete
          v-model="selectedSchool"
          label="Select a School"
          :items="appStore.getSchools"
          :item-title="(item) => (item ? item.mincode + ' - ' + item.displayName : '')"
          :item-value="(item) => item"
        ></v-autocomplete>
        <v-btn color="primary" class="text-none text-subtitle-1" variant="flat" @click="goToSchool"
          >View School Info</v-btn
        >
      </v-col>
      <v-spacer />
      <v-col class="ml-6" cols="4">
        <v-btn class="text-none text-subtitle-1 ma-1" variant="flat" @click="downloadAllSchoolsInfo"
          ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Download All Schools
          Info</v-btn
        >
        <v-btn
          class="text-none text-subtitle-1 ma-1"
          variant="flat"
          @click="downloadAllSchoolsMailing"
          ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Download All Schools
          Mailing</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>
