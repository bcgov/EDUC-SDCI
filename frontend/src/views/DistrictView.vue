<script setup lang="ts">
import InstituteService from '@/services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import { formatPhoneNumber } from '@/utils/common'

import type { District } from '@/types/types.d.ts'

// import common components
import DisplayAddress from '@/components/common/DisplayAddress.vue'

const appStore = useAppStore()
const districtId = ref<string | null>(null) // Initialize with null initially

const district = reactive({ value: {} as District })

const tabOptions = {
  contacts: 1,
  schools: 2
}
const tab = ref(tabOptions.contacts) // Default to contacts tab

const contactHeaders = [
  { title: 'Contact Type', key: 'districtContactTypeCode' },
  { title: 'Name', key: 'firstName' },
  { title: 'Title/Role', key: 'jobTitle' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Email', key: 'email' }
]

const schoolHeaders = [
  { title: 'School Name', key: 'displayName' },
  { title: 'Mincode', key: 'mincode' },
  { title: 'Category', key: 'schoolCategoryCode' },
  { title: 'Type', key: 'facilityTypeCode' },
  //{ title: 'Grades', key: ''},
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Fax', key: 'faxNumber' },
  { title: 'Email', key: 'email' },
  { title: 'Website', key: 'website' }
]

const schoolSearch = ref('')
const contactSearch = ref('')

onMounted(async () => {
  const route = useRoute()
  // Set the districtId inside the onMounted hook; null if districtId not found
  districtId.value =
    appStore.getDistrictByDistrictNumber(String(route.params.districtNumber))?.districtId ?? null
  // get district data
  try {
    const response = await InstituteService.getDistrictView(districtId.value as string)
    district.value = response.data
  } catch (error) {
    console.error(error)
  }
  // get district contact type codes
  // try {
  //   const response = await InstituteService.getDistrictContactTypeCodes()
  //   districtContactTypeCodes.value = response.data
  // } catch (error) {
  //   console.error(error)
  // }
})

function downloadDistrictContacts() {
  alert("TODO - Implement CSV download for a district's contacts")
}

function downloadDistrictSchools() {
  alert("TODO - Implement CSV download for a district's schools")
}
</script>

<template>
  <div style="max-width: 1280px">
    <v-spacer />
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[
        { title: 'Home', href: '/' },
        'District',
        district.value.districtData?.districtNumber + ' ' + district.value.districtData?.displayName
      ]"
    ></v-breadcrumbs>

    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-spacer />
        <v-col cols="6">
          <v-row v-if="district.value.districtData" no-gutters justify="space-between">
            <v-col>
              <h2 class="mt-3 mb-2">
                {{ district.value.districtData?.districtNumber }} -
                {{ district.value.districtData?.displayName }}
              </h2>
              <p>
                <strong>Phone:</strong>
                {{ formatPhoneNumber(district.value.districtData?.phoneNumber) }}
              </p>
              <p>
                <strong>Fax:</strong>
                {{ formatPhoneNumber(district.value.districtData?.faxNumber) }}
              </p>
              <p><strong>Email:</strong> {{ district.value.districtData?.email }}</p>
              <p>
                <a :href="district.value.districtData?.website">{{
                  district.value.districtData?.website
                }}</a>
              </p>
            </v-col>
            <v-col
              v-for="item in district.value.districtData.addresses"
              :key="item.addressTypeCode"
            >
              <h2>&nbsp;</h2>
              <DisplayAddress v-bind="item" />
            </v-col>
            <v-col>
              <h2>&nbsp;</h2>
              <v-btn block class="text-none text-subtitle-1 ma-1" @click="downloadDistrictContacts"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>District
                Contacts</v-btn
              >
              <v-btn block class="text-none text-subtitle-1 ma-1" @click="downloadDistrictSchools"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>District
                Schools</v-btn
              >
            </v-col>
          </v-row>
        </v-col>
        <v-spacer />
      </v-row>
    </v-sheet>
    <!-- END DISTRICT HEADER INFO -->

    <v-sheet class="pa-6">
      <v-tabs v-model="tab">
        <v-tab :value="tabOptions.contacts"> District Contacts </v-tab>
        <v-tab :value="tabOptions.schools">
          District Schools ({{ district.value.districtData?.contacts.length }})
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <!-- District Contacts tab contents -->
          <v-window-item :value="tabOptions.contacts">
            <v-text-field
              v-model="contactSearch"
              append-icon="mdi-magnify"
              label="Filter District Contacts"
              single-line
              hide-details
            ></v-text-field>
            <v-data-table
              items-per-page="-1"
              :headers="contactHeaders"
              :items="district.value.districtData?.contacts"
              :search="contactSearch"
            >
              <template v-slot:item.firstName="{ item }">
                {{ item.columns.firstName }} {{ item.columns.lastName }}
              </template>

              <template v-slot:item.email="{ item }">
                <a :href="`mailto:${item.columns.email}`">{{ item.columns.email }}</a>
              </template>

              <template v-slot:item.districtContactTypeCode="{ item }">
                {{ appStore.getDistrictContactTypeCodeLabel(item.columns.districtContactTypeCode) }}
              </template>

              <template v-slot:item.phoneNumber="{ item }">
                {{ formatPhoneNumber(item.columns.phoneNumber) }}
              </template>
            </v-data-table>
          </v-window-item>
          <!-- District Schools tab contents -->
          <v-window-item :value="tabOptions.schools">
            <v-text-field
              v-model="schoolSearch"
              append-icon="mdi-magnify"
              label="Filter District Schools"
              single-line
              hide-details
            ></v-text-field>
            <v-data-table
              items-per-page="-1"
              :headers="schoolHeaders"
              :items="district.value.districtSchools"
              :search="schoolSearch"
            >
              <template v-slot:item.schoolCategoryCode="{ item }">
                {{ appStore.getCategoryCodeLabel(item.columns.schoolCategoryCode) }}
              </template>

              <template v-slot:item.facilityTypeCode="{ item }">
                {{ appStore.getFacilityCodeLabel(item.columns.facilityTypeCode) }}
              </template>

              <template v-slot:item.email="{ item }">
                <a :href="`mailto:${item.columns.email}`">{{ item.columns.email }}</a>
              </template>

              <template v-slot:item.website="{ item }">
                <a :href="item.columns.website">{{ item.columns.website }}</a>
              </template>

              <template v-slot:item.phoneNumber="{ item }">
                {{ formatPhoneNumber(item.columns.phoneNumber) }}
              </template>

              <template v-slot:item.faxNumber="{ item }">
                {{ formatPhoneNumber(item.columns.faxNumber) }}
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-sheet>

    <!-- DEBUG panels for development; remove in TEST and higher -->

    <!-- <v-expansion-panels id="ui-debug" class="debug">
      <v-expansion-panel title="DEBUG: District JSON">
        <v-expansion-panel-text>
          <pre>
            {{ district }}
          </pre>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel title="DEBUG: DistrictContactTypeCodes JSON">
        <v-expansion-panel-text>
          <pre>
            {{ appStore.getDistrictContactTypeCodes }}
          </pre>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel title="DEBUG: ContactTypeCodes">
        <v-expansion-panel-text>
          <pre>
            {{ appStore.getContactTypeCodes }}
          </pre>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels> -->
  </div>
</template>
