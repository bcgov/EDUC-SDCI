<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import InstituteService from '@/services/InstituteService'
import { useAppStore } from '@/stores/app'
import type { School } from '@/types/types.d.ts'
import * as jsonexport from 'jsonexport/dist'
import { distNumberFromMincode } from '@/utils/common'
// props
const appStore = useAppStore()
const districtInfo = reactive<any>({ value: {} })
const downloadContacts = ref<any>([])
const filteredContacts = ref<any>([])
const filteredAddresses = reactive<any>({ value: {} })
const headers = [
  { title: 'Contact', key: 'jobTitle' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Extension', key: 'phoneExtension' },
  { title: 'Fax', key: 'faxNumber' },
  { title: 'Email', key: 'email' }
]
const schoolData = reactive({ value: {} as School })

// functions
const downloadCSV = () => {
  jsonexport(downloadContacts.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}
const transformContactForDownload = (inputData: any) => {
  return inputData.map(
    (item: {
      districtNumber: string
      mincode: string
      displayName: string
      addressLine1: string
      city: string
      provinceCode: string
      postal: string
      jobTitle: string
      firstName: string
      lastName: string
      facilityTypeCode: string
      schoolCategoryCode: string
      phoneNumber: string
      phoneExtension: string
      alternatePhoneNumber: string
      alternatePhoneExtension: string
      email: string
    }) => ({
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
      email: item.email
    })
  )
}
onBeforeMount(async () => {
  const route = useRoute()
  const selectedSchoolId: string | string[] = route.params.schoolId
  try {
    const response = await InstituteService.getSchool(selectedSchoolId as string)
    schoolData.value = response.data
    console.log(schoolData.value)
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
        filteredContacts.value[0].districtNumber = distNumberFromMincode(response.data.mincode)
        filteredContacts.value[0].displayName = response.data.displayName
        filteredContacts.value[0].schoolCategoryCode = response.data.schoolCategoryCode
        filteredContacts.value[0].facilityTypeCode = response.data.facilityTypeCode
        filteredContacts.value[0].mincode = response.data.mincode
        filteredContacts.value[0].phoneNumber = response.data.phoneNumber
        filteredContacts.value[0].phoneExtension = response.data.phoneExtension
        filteredContacts.value[0].email = response.data.email
        filteredContacts.value[0].faxNumber = response.data.faxNumber
        filteredContacts.value[0].addressLine1 = response.data.addresses[0].addressLine1
        filteredContacts.value[0].addressLine2 = response.data.addresses[0].addressLine2
        filteredContacts.value[0].city = response.data.addresses[0].city
        filteredContacts.value[0].provinceCode = response.data.addresses[0].provinceCode
        filteredContacts.value[0].countryCode = response.data.addresses[0].countryCode
        filteredContacts.value[0].postal = response.data.addresses[0].postal
        downloadContacts.value = transformContactForDownload(filteredContacts.value)
      }
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="primary"
      :items="[{ title: 'Home', href: '/' }, 'School', schoolData.value.displayName]"
    ></v-breadcrumbs>
    <v-card class="fill-screen-height" width="100%" v-if="schoolData.value">
      <v-card-item>
        <v-card-title v-if="schoolData.value.displayName">
          {{ schoolData.value.displayName }} - {{ schoolData.value.mincode }}</v-card-title
        >
        District: {{ districtInfo.value.districtNumber }} - {{ districtInfo.value.displayName }}
        <v-card-subtitle>
          <!-- School Address -->
          <div v-if="filteredAddresses.value != 'N/A'">
            <span v-if="filteredAddresses.value.addressLine1"
              >{{ filteredAddresses.value.addressLine1 }}<br
            /></span>
            <span v-if="filteredAddresses.value.addressLine2"
              >{{ filteredAddresses.value.addressLine2 }}<br
            /></span>
            <span v-if="filteredAddresses.value.city">{{ filteredAddresses.value.city }}</span
            >,
            <span v-if="filteredAddresses.value.provinceCode"
              >{{ filteredAddresses.value.provinceCode }},</span
            >
            <span v-if="filteredAddresses.value.postal">{{ filteredAddresses.value.postal }}</span>
          </div>
          <!-- School type info. -->
          <span v-if="schoolData.value.facilityTypeCode"
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
      </v-card-item>
      <v-card-text>
        <v-btn
          @click="downloadCSV"
          class="text-none text-subtitle-1 ma-1"
          variant="flat"
          :disabled="!schoolData.value"
        >
          <template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download to CSV
        </v-btn>
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
