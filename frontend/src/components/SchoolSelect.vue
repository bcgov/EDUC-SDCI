<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { useSanitizeURL } from '@/composables/string'
import DownloadSchoolsModal from '@/components/DownloadSchoolsModal.vue'
import DisplayAlert from '@/components/common/DisplayAlert.vue'

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
</script>

<template>
  <v-sheet elevation="2" class="py-6 full-width">
    <v-container id="main">
      <DisplayAlert class="mx-4" />
      <v-row no-gutters justify="space-between">
        <v-col>
          <img src="@/assets/images/BCMapGraphic.png" alt="Map of British Columbia"
            style="height: 268px; position: absolute; top: 170px; left: -80px" class="d-none d-lg-block" />
        </v-col>
        <v-col cols="10" md="8" xl="6" class="ml-0 py-6 school-search">
          <h2 class="mb-5">Find a School in BC</h2>
          <v-row justify="space-between">
            <v-col cols="auto" class="pa-0" style="max-width: 100%; flex: 1 1 auto;">
              <v-autocomplete v-model="selectedSchool" label="Select a School" :items="appStore.getSchools" :item-title="(item) => (item?.mincode ? item.mincode + ' - ' + item.displayName : null)
                " :item-value="(item) => (item?.mincode ? item : null)" hide-details
                style="min-width: 0; width: 100%;"></v-autocomplete>
            </v-col>
            <v-col cols="auto" class="pa-0 ml-2" style="flex: 0 0 auto;">
              <v-btn icon="mdi-magnify" color="primary" variant="flat" rounded="lg" size="large" @click="goToSchool"
                class="pa-0" style="min-width: 48px; width: 48px;" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4" class="px-0 py-4 py-md-0 my-2">
              <v-btn block color="bcGovBlue" class="text-none text-subtitle-1" variant="outlined"
                @click="goToSchoolSearch"><template v-slot:append> <v-icon icon="mdi-chevron-right" /></template>View
                All Schools</v-btn>
            </v-col>
            <v-spacer class="d-none d-md-block" />
            <v-col cols="12" md="4" class="px-0 py-4 py-md-0 my-md-1">
              <DownloadSchoolsModal></DownloadSchoolsModal>
            </v-col>
          </v-row>
        </v-col>
        <v-spacer />
      </v-row>
    </v-container>
  </v-sheet>
</template>
