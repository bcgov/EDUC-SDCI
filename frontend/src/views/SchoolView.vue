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
const authorityInfo = reactive<any>({ value: {} })
const downloadContacts = ref<any>([])
const filteredContacts = ref<any>([])
const filteredAddresses = reactive<any>({ value: {} })
const filteredGradesLabels = reactive<any>([])
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
    Postal: item.postal,
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
    ElementaryUngraded: item.ELEMUNGR,
    SecondaryUngraded: item.SECUNGR,
    KindergartenHalf: item.KINDHALF,
    KindergartenFull: item.KINDFULL,
    GRADE01: item.GRADE01,
    GRADE02: item.GRADE02,
    GRADE03: item.GRADE03,
    GRADE04: item.GRADE04,
    GRADE05: item.GRADE05,
    GRADE06: item.GRADE06,
    GRADE07: item.GRADE07,
    GRADE08: item.GRADE08,
    GRADE09: item.GRADE09,
    GRADE10: item.GRADE10,
    GRADE11: item.GRADE11,
    GRADE12: item.GRADE12
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
    //extract only the labels for UI (no longer used for extract)
    if (filteredGradesLabels.length == 0) {
      filteredGradesLabels.push(...appStore.extractGradeLabels(filteredGrades))
    }

    //setting district name and number
    if (schoolData.value.districtId) {
      districtInfo.value = appStore.getDistrictByDistrictId(String(schoolData.value.districtId))
    }
    //setting authority name and number if school is independent
    console.log(schoolData.value.independentAuthorityId)
    if (schoolData.value.independentAuthorityId) {
      authorityInfo.value = appStore.getAuthorityByAuthorityId(
        String(schoolData.value.independentAuthorityId)
      )
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
          filteredContacts.value[i].ELEMUNGR = response.data.ELEMUNGR
          filteredContacts.value[i].SECUNGR = response.data.SECUNGR
          filteredContacts.value[i].KINDHALF = response.data.KINDHALF
          filteredContacts.value[i].KINDFULL = response.data.KINDFULL
          filteredContacts.value[i].GRADE01 = response.data.GRADE01
          filteredContacts.value[i].GRADE02 = response.data.GRADE02
          filteredContacts.value[i].GRADE03 = response.data.GRADE03
          filteredContacts.value[i].GRADE03 = response.data.GRADE03
          filteredContacts.value[i].GRADE04 = response.data.GRADE04
          filteredContacts.value[i].GRADE05 = response.data.GRADE05
          filteredContacts.value[i].GRADE06 = response.data.GRADE06
          filteredContacts.value[i].GRADE07 = response.data.GRADE07
          filteredContacts.value[i].GRADE08 = response.data.GRADE08
          filteredContacts.value[i].GRADE09 = response.data.GRADE09
          filteredContacts.value[i].GRADE10 = response.data.GRADE10
          filteredContacts.value[i].GRADE11 = response.data.GRADE11
          filteredContacts.value[i].GRADE12 = response.data.GRADE12
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
            <v-row no-gutters>
              <h1 class="mt-3 mb-2">
                {{ schoolData.value.mincode }} - {{ schoolData.value.displayName }}
              </h1>
            </v-row>
            <v-row no-gutters class="mt-0 mb-1">
              <a
                id="district-link"
                :href="`/district/${useSanitizeURL(
                  String(districtInfo.value?.districtNumber)
                )}-${useSanitizeURL(String(districtInfo.value?.displayName))}`"
              >
                District {{ districtInfo.value.districtNumber }} -
                {{ districtInfo.value.displayName }}
              </a>
              <a
                id="authority-link"
                :href="`/authority/${authorityInfo.value.authorityNumber}-${authorityInfo.value.displayName}`"
                v-if="schoolData.value?.independentAuthorityId && authorityInfo.value"
                class="ml-1"
              >
                Independent Authority {{ authorityInfo.value.authorityNumber }} -
                {{ authorityInfo.value.displayName }}
              </a>
            </v-row>
            <v-row no-gutters class="mt-1 mb-4">
              <v-chip
                v-for="grade in filteredGradesLabels"
                :key="grade"
                class="mr-1"
                size="small"
                color="primary"
                label
                >{{ grade }}</v-chip
              >
            </v-row>
            <v-row no-gutters>
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
                  variant="text"
                  class="text-none text-subtitle-1 ma-1 v-btn-align-left"
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
            >
              <template v-slot:item.phoneNumber="{ item }">
                {{ formatPhoneNumber(item.phoneNumber) }}
              </template>
              <template v-slot:item.faxNumber="{ item }">
                {{ formatPhoneNumber(item.faxNumber) }}
              </template>
            </v-data-table-virtual>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
