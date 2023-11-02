<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import InstituteService from '@/services/InstituteService'
import { useAppStore } from '@/stores/app'
import type { School, Grade } from '@/types/types.d.ts'
import * as jsonexport from 'jsonexport/dist'
import { distNumberFromMincode, formatPhoneNumber } from '@/utils/common'
import DisplayAddress from '@/components/common/DisplayAddress.vue'
import { useSanitizeURL } from '@/composables/string'
const appStore = useAppStore()

// props
const districtInfo = reactive<any>({ value: {} })
const downloadContacts = ref<any>([])
const filteredContacts = ref<any>([])
const filteredAddresses = reactive<any>({ value: {} })
const headers = [
  { title: 'Role', key: 'jobTitle' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Extension', key: 'phoneExtension' },
  { title: 'Fax', key: 'faxNumber' },
  { title: 'Email', key: 'email' }
]
const schoolData = reactive({ value: {} as School })
const tabOptions = {
  contacts: 1,
  learning: 2 //can we display grades and NLCs on their own tab?
}
const tab = ref(tabOptions.contacts)

// functions
const downloadCSV = () => {
  jsonexport(downloadContacts.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}
const transformContactForDownload = (inputData: any): {} => {
  return inputData.map((item: any) => ({
    districtNumber: item.districtNumber,
    mincode: item.mincode,
    displayName: item.displayName,
    addressLine1: item.addressLine1,
    city: item.city,
    provinceCode: item.provinceCode,
    postal: item.postal,
    jobTitle: item.jobTitle,
    firstName: item.firstName,
    lastName: item.lastName,
    facilityTypeCode: item.facilityTypeCode,
    schoolCategoryCode: item.schoolCategoryCode,
    phoneNumber: item.phoneNumber,
    phoneExtension: item.phoneExtension,
    alternatePhoneNumber: item.alternatePhoneNumber,
    alternatePhoneExtension: item.alternatePhoneExtension,
    email: item.email,
    grades: item.grades
  }))
}
// loading component
onBeforeMount(async () => {
  const route = useRoute()
  const selectedSchoolId: string | string[] = route.params.schoolId
  try {
    const response = await InstituteService.getSchool(selectedSchoolId as string)
    schoolData.value = response.data

    //add the missing labels
    const filteredGrades = appStore.compareSchoolGrades(
      appStore.getGradeByGradeCodes,
      schoolData.value.grades
    )
    //extract only the labels
    const filteredGradesLabels = appStore.extractGradeLabels(filteredGrades)
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
        for (let i = 0; i < response.data.contacts.length; i++) {
          filteredContacts.value = response.data.contacts
          filteredContacts.value[i].districtNumber = distNumberFromMincode(response.data.mincode)
          filteredContacts.value[i].displayName = response.data.displayName
          filteredContacts.value[i].schoolCategoryCode = response.data.schoolCategoryCode
          filteredContacts.value[i].facilityTypeCode = response.data.facilityTypeCode
          filteredContacts.value[i].mincode = response.data.mincode
          filteredContacts.value[i].phoneNumber = response.data.phoneNumber
          filteredContacts.value[i].phoneExtension = response.data.phoneExtension
          filteredContacts.value[i].email = response.data.email
          filteredContacts.value[i].faxNumber = response.data.faxNumber
          filteredContacts.value[i].addressLine1 = response.data.addresses[0].addressLine1
          filteredContacts.value[i].addressLine2 = response.data.addresses[0].addressLine2
          filteredContacts.value[i].city = response.data.addresses[0].city
          filteredContacts.value[i].provinceCode = response.data.addresses[0].provinceCode
          filteredContacts.value[i].countryCode = response.data.addresses[0].countryCode
          filteredContacts.value[i].postal = response.data.addresses[0].postal
          filteredContacts.value[i].grades = filteredGradesLabels
        }
        downloadContacts.value = transformContactForDownload(filteredContacts.value)
      }
    }
  } catch (error) {
    console.error(error)
  }
})

function goToDistrict() {
  router.push({
    name: 'district',
    params: {
      districtNumber: useSanitizeURL(String(districtInfo.value?.districtNumber)),
      displayName: useSanitizeURL(String(districtInfo.value?.displayName))
    }
  })
}
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[
        { title: 'Home', href: '/' },
        'School',
        { title: schoolData?.value?.displayName, href: '' }
      ]"
    ></v-breadcrumbs>

    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-row v-if="schoolData.value" no-gutters justify="space-between">
          <v-col>
            <v-row>
              <h1 class="mt-3 mb-2">
                {{ schoolData.value.displayName }} - {{ schoolData.value.mincode }}
              </h1>
            </v-row>
            <v-row>
              <a
                :href="`/district/${useSanitizeURL(
                  String(districtInfo.value?.districtNumber)
                )}-${useSanitizeURL(String(districtInfo.value?.displayName))}`"
              >
                District {{ districtInfo.value.districtNumber }} -
                {{ districtInfo.value.displayName }}
              </a>
            </v-row>
            <v-row>
              <!-- <p>
                <strong>Grades: </strong>{{ appStore.extractGradeLabels(schoolData.value?.grades) }}
              </p> -->
              <!-- <div
                label
                v-for="grade in appStore.getGradeByGradeCodes"
                :key="grade.schoolGradeCode"
              >
                {{
                  schoolData.value.grades.find(
                    (schoolGrade: Grade) => schoolGrade.schoolGradeCode == grade.schoolGradeCode
                  )
                    ? grade.label
                    : undefined
                }}
              </div> -->
            </v-row>
            <v-row>
              <v-col class="pl-0">
                <p><strong>Phone:</strong> {{ formatPhoneNumber(schoolData.value.phoneNumber) }}</p>
                <p><strong>Fax:</strong> {{ formatPhoneNumber(schoolData.value.faxNumber) }}</p>
                <p>
                  <strong>Email: </strong>
                  <a :href="'mailto:' + schoolData.value?.email">
                    {{ schoolData.value.email }}
                  </a>
                </p>
              </v-col>
              <v-col v-for="item in schoolData.value.addresses" :key="item.addressTypeCode">
                <DisplayAddress v-bind="item" />
              </v-col>
              <v-col
                ><v-btn
                  block
                  class="text-none text-subtitle-1 ma-1"
                  @click="downloadCSV"
                  :disabled="!schoolData.value"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>School
                  Info</v-btn
                ></v-col
              >
            </v-row>
          </v-col>
        </v-row>
      </v-row>
    </v-sheet>

    <v-card class="fill-screen-height pa-6" width="100%" v-if="schoolData.value">
      <v-tabs v-model="tab">
        <v-tab :value="tabOptions.contacts">School Contacts</v-tab>
      </v-tabs>
      <v-card-text>
        <v-window v-model="tab">
          <v-window-item :value="tabOptions.contacts">
            <v-data-table-virtual
              :headers="headers"
              :items="filteredContacts"
              class="elevation-1"
              item-value="name"
            ></v-data-table-virtual>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
    <pre>{{ schoolData.value }}</pre>
  </div>
</template>
