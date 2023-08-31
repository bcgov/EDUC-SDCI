<script setup lang="ts">
import InstituteService from '@/services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'

// import common components
import DisplayAddress from '@/components/common/DisplayAddress.vue'

const appStore = useAppStore()
const districtId = ref(null) // Initialize with null initially

const district = reactive({ value: {} })
const districtContactTypeCodes = reactive({ value: {} })
const contactTypeCodes = reactive({ value: {} })

const tabOptions = {
  contacts: 1,
  schools: 2
}
const tab = ref(tabOptions.contacts) // Default to contacts tab

const contactHeaders = [
  { title: 'Contact Type', key: 'districtContactTypeCode' },
  { title: 'Name', key: 'firstName' },
  { title: 'Title/Roll', key: 'jobTitle' },
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

onMounted(async () => {
  const route = useRoute()
  // Set the districtId inside the onMounted hook
  districtId.value = appStore.getDistrictByDistrictNumber(
    String(route.params.districtNumber)
  )?.districtId
  // get district data
  try {
    const response = await InstituteService.getDistrictView(districtId.value)
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
</script>

<template>
  <div>
    <v-sheet>
      <h2>
        {{ district.value.districtData?.districtNumber }} -
        {{ district.value.districtData?.displayName }}
      </h2>
      <v-row v-if="district.value.districtData">
        <v-col v-for="item in district.value.districtData.addresses">
          <DisplayAddress v-bind="item" />
        </v-col>
        <v-col>
          <p><strong>Phone:</strong> {{ district.value.districtData?.phoneNumber }}</p>
          <p><strong>Fax:</strong> {{ district.value.districtData?.faxNumber }}</p>
          <p><strong>Email:</strong> {{ district.value.districtData?.email }}</p>
          <p>
            <a :href="district.value.districtData?.website">{{
              district.value.districtData?.website
            }}</a>
          </p>
        </v-col>
        <v-col>
          <v-btn class="text-none text-subtitle-1 ma-1" variant="flat"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>District
            Contacts</v-btn
          >
          <v-btn class="text-none text-subtitle-1 ma-1" variant="flat"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>District
            Schools</v-btn
          >
        </v-col>
      </v-row>
    </v-sheet>
    <v-tabs v-model="tab">
      <v-tab :value="tabOptions.contacts"> District Contacts </v-tab>
      <v-tab :value="tabOptions.schools"> District Schools </v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <!-- District Contacts tab contents -->
        <v-window-item :value="tabOptions.contacts"
          >CONTACTS
          <v-data-table
            items-per-page="-1"
            :headers="contactHeaders"
            :items="district.value.districtData?.contacts"
          >
            <template v-slot:item.firstName="{ item }">
              {{ item.selectable.firstName }} {{ item.selectable.lastName }}
            </template>

            <template v-slot:item.email="{ item }">
              <a :href="`mailto:${item.selectable.email}`">{{ item.selectable.email }}</a>
            </template>

            <template v-slot:item.districtContactTypeCode="{ item }">
              {{
                appStore.getDistrictContactTypeCodeLabel(item.selectable.districtContactTypeCode)
              }}
            </template>
          </v-data-table>
        </v-window-item>
        <!-- District Schools tab contents -->
        <v-window-item :value="tabOptions.schools"
          >SCHOOLS
          <v-data-table
            items-per-page="-1"
            :headers="schoolHeaders"
            :items="district.value.districtSchools"
          >
            <template v-slot:item.schoolCategoryCode="{ item }">
              {{ appStore.getCategoryCodeLabel(item.selectable.schoolCategoryCode) }}
            </template>

            <template v-slot:item.facilityTypeCode="{ item }">
              {{ appStore.getFacilityCodeLabel(item.selectable.facilityTypeCode) }}
            </template>

            <template v-slot:item.email="{ item }">
              <a :href="`mailto:${item.selectable.email}`">{{ item.selectable.email }}</a>
            </template>

            <template v-slot:item.website="{ item }">
              <a :href="item.selectable.website">{{ item.selectable.website }}</a>
            </template>
          </v-data-table>
        </v-window-item>
      </v-window>
    </v-card-text>

    <!-- DEBUG panels for development; remove in TEST and higher -->
    <v-expansion-panels id="ui-debug" class="debug">
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
    </v-expansion-panels>
  </div>
</template>
