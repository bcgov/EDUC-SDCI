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

function downloadAllSchoolsMailing() {
  alert('TODO - Implement all schools mailing extract download')
}
</script>

<template>
  <v-container fluid class="pt-0">
    <v-sheet elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-col class="mr-6">
          <v-spacer />
          <img
            src="@/assets/images/BCMapGraphic.png"
            alt="Map of British Columbia"
            style="height: 268px; position: absolute; top: 50px; left: -80px"
          />
        </v-col>
        <v-col lg="5" class="mr-6 py-6 school-search">
          <h2 class="mb-5">Find a School in BC</h2>
          <v-row>
            <v-autocomplete
              v-model="selectedSchool"
              label="Select a School"
              :items="appStore.getSchools"
              :item-title="
                (item) => (item?.mincode ? item.mincode + ' - ' + item.displayName : null)
              "
              :item-value="(item) => (item?.mincode ? item : null)"
            ></v-autocomplete>
            <v-btn
              icon="mdi-magnify"
              color="primary"
              variant="flat"
              rounded="lg"
              size="large"
              @click="goToSchool"
              class="mx-3"
            />
            <!-- <v-btn
              color="primary"
              class="text-none text-subtitle-1"
              variant="flat"
              @click="goToSchool"
              ><v-icon icon="mdi-magnify"
            /></v-btn> -->
          </v-row>

          <v-row>
            <v-col class="px-0">
              <v-btn
                color="bcGovBlue"
                class="text-none text-subtitle-1"
                variant="outlined"
                @click="goToSchoolSearch"
                >View All Schools</v-btn
              >
            </v-col>
            <v-spacer />
            <v-col>
              <v-btn
                href="/api/v1/download/csv/school/ALL?filepath=allschoolcontacts"
                block
                class="text-none text-subtitle-1 my-1"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>

                All Schools Info</v-btn
              >
            </v-col>
            <v-col>
              <v-btn block class="text-none text-subtitle-1 ma-1" @click="downloadAllSchoolsMailing"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Mailing for All
                Schools</v-btn
              >
            </v-col>
          </v-row>
        </v-col>
        <v-spacer />
      </v-row>
    </v-sheet>
  </v-container>
</template>
