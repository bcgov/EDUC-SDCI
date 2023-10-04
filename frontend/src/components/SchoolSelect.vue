<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { useSanitizeURL } from '@/composables/string'

// Type Imports
import type { ListSchool } from '@/types/types'
import type { Ref } from 'vue'

const appStore = useAppStore()
const selectedSchool: Ref<ListSchool | null> = ref(null)

function goToSchool() {
  if (selectedSchool.value?.displayName) {
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

function goToSchoolSearch() {
  router.push({
    name: 'search'
  })
}

function downloadAllSchoolsInfo() {
  alert('TODO - Implement all schools info extract download')
}

function downloadAllSchoolsMailing() {
  alert('TODO - Implement all schools mailing extract download')
}
</script>

<template>
  <v-container fluid class="pt-0">
    <v-sheet elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-spacer />
        <img
          src="@/assets/images/BCMapGraphic.png"
          alt="Map of British Columbia"
          style="height: 268px; position: absolute; top: 85px; left: -80px"
        />
        <v-col class="mr-6" >
          <h2 class="mb-3">Find a School in BC</h2>
          <v-autocomplete
            v-model="selectedSchool"
            label="Select a School"
            :items="appStore.getSchools"
            :item-title="(item) => (item?.mincode ? item.mincode + ' - ' + item.displayName : null)"
            :item-value="(item) => (item?.mincode ? item : null)"
          ></v-autocomplete>
          <v-btn
            color="primary"
            class="text-none text-subtitle-1"
            variant="flat"
            @click="goToSchool"
            >View School Info</v-btn
          >
        </v-col>
        <v-spacer />
      </v-row>
    </v-sheet>

    <div class="mt-8" >
      <v-card class="pa-6">
        <h2 class="mb-3">School Information</h2>
        <v-row no-gutters justify="space-between">
          <v-col class="mr-6">
            <v-btn
              color="primary"
              class="text-none text-subtitle-1"
              variant="flat"
              @click="goToSchoolSearch"
              >View All Schools</v-btn
            >
          </v-col>
          <v-spacer />
          <v-col class="ml-6" cols="4">
            <v-btn
              block
              class="text-none text-subtitle-1 ma-1"
              variant="outlined"
              @click="downloadAllSchoolsInfo"
              ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Download All
              Schools Info</v-btn
            >
            <v-btn
              block
              class="text-none text-subtitle-1 ma-1"
              variant="outlined"
              @click="downloadAllSchoolsMailing"
              ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Download All
              Schools Mailing</v-btn
            >
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>
