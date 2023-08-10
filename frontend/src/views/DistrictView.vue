<script setup lang="ts">
import InstituteService from '@/Services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'

const appStore = useAppStore()
const districtId = ref(null) // Initialize with null initially

const district = reactive({ value: {} })
const districtContactTypeCodes = reactive({ value: {} })

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
    </v-expansion-panels>

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
                appStore.getDistrictContactTypeCodesLabel(item.selectable.districtContactTypeCode)
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
            <template v-slot:item.schoolCategoryCode="{ item }"> hello world </template>
          </v-data-table>
        </v-window-item>
      </v-window>
    </v-card-text>
  </div>
</template>
