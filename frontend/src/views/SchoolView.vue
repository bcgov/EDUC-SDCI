<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import InstituteService from '@/services/InstituteService'
import { useAppStore } from '@/stores/app'
import type { School } from '@/types/types.d.ts'
import { formatPhoneNumber } from '@/utils/common'
// import common components
import DisplayAddress from '@/components/common/DisplayAddress.vue'
const appStore = useAppStore()
const schoolData = reactive({ value: {} as School })
const filteredContacts = ref<any>([])
const filteredAddresses = reactive<any>({ value: {} })
const districtInfo = reactive<any>({ value: {} })
const headers = [
  { title: 'Contact', key: 'jobTitle' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Extension', key: 'phoneExtension' },
  { title: 'Fax', key: 'faxNumber' },
  { title: 'Email', key: 'email' }
]
onBeforeMount(async () => {
  const route = useRoute()
  const selectedSchoolId: string | string[] = route.params.schoolId
  try {
    const response = await InstituteService.getSchool(selectedSchoolId as string)
    schoolData.value = response.data
    //setting district name and number
    if (schoolData.value.districtId) {
      districtInfo.value = appStore.getDistrictByDistrictId(String(schoolData.value.districtId))
    }
    //setting school address
    if (response.data) {
      if (response.data.addresses.length > 0) {
        filteredAddresses.value = response.data.addresses[0]
      }
    }
    //setting school contacts
    if (response.data) {
      if (response.data.contacts.length > 0) {
        filteredContacts.value = response.data.contacts
        filteredContacts.value[0].phoneNumber = response.data.phoneNumber
        filteredContacts.value[0].phoneExtension = response.data.phoneExtension
        filteredContacts.value[0].email = response.data.email
        filteredContacts.value[0].faxNumber = response.data.faxNumber
      }
    }
  } catch (error) {
    console.error(error)
  }
})

function downloadSchoolInfo() {
  alert('TODO - Implement school info extract download')
}
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[{ title: 'Home', href: '/' }, 'School', schoolData.value.displayName]"
    ></v-breadcrumbs>

    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-spacer />
        <v-col cols="6">
          <v-row v-if="schoolData.value" no-gutters justify="space-between">
            <v-col>
              <v-row>
                <h2 class="mt-3 mb-2">
                  {{ schoolData.value.displayName }} - {{ schoolData.value.mincode }}
                </h2>
              </v-row>
              <v-row
                >District {{ districtInfo.value.districtNumber }} -
                {{ districtInfo.value.displayName }}</v-row
              >
              <v-row>
                <v-col class="pl-0">
                  <p>
                    <strong>Phone:</strong> {{ formatPhoneNumber(schoolData.value.phoneNumber) }}
                  </p>
                  <p><strong>Fax:</strong> {{ formatPhoneNumber(schoolData.value.faxNumber) }}</p>
                  <p>
                    <strong>Email: </strong>
                    <a :href="schoolData.value?.email"> {{ schoolData.value.email }} </a>
                  </p>
                </v-col>
                <v-col v-for="item in schoolData.value.addresses" :key="item.addressTypeCode">
                  <DisplayAddress v-bind="item" />
                </v-col>
                <v-col
                  ><v-btn block class="text-none text-subtitle-1 ma-1" @click="downloadSchoolInfo"
                    ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>School
                    Info</v-btn
                  ></v-col
                >
              </v-row>
            </v-col>
          </v-row>
        </v-col>
        <v-spacer />
      </v-row>
    </v-sheet>
    <v-card class="fill-screen-height" width="100%" v-if="schoolData.value">
      <!-- <v-card-item>
        <v-card-title v-if="schoolData.value.displayName">
          {{ schoolData.value.displayName }} - {{ schoolData.value.mincode }}</v-card-title
        >
        District: {{ districtInfo.value.districtNumber }} - {{ districtInfo.value.displayName }}

        <v-card-subtitle> -->
      <!-- School type info. -->
      <!-- <span v-if="schoolData.value.facilityTypeCode"
            >{{ schoolData.value.facilityTypeCode }} SCHOOL<br
          /></span>
          <div v-if="schoolData.value.grades">
            Grades:
            <span v-for="item in schoolData.value.grades" :key="item.schoolGradeCode"
              >{{ item.schoolGradeCode }},</span
            >
          </div>
          <br />
          <span v-if="schoolData.value.schoolCategoryCode"
            >{{ schoolData.value.schoolCategoryCode }} SCHOOL</span
          >
        </v-card-subtitle>
      </v-card-item> -->
      <v-card-text>
        <v-data-table-virtual
          :headers="headers"
          :items="filteredContacts"
          class="elevation-1"
          item-value="name"
        ></v-data-table-virtual>
      </v-card-text>
    </v-card>
  </div>
</template>
