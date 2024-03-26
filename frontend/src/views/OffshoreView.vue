<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import { reactive, onBeforeMount, ref } from 'vue'
import { distNumberFromMincode } from '@/utils/common'
import jsonexport from 'jsonexport/dist'
import DisplayAddress from '@/components/common/DisplayAddress.vue'
import DisplayAlert from '@/components/common/DisplayAlert.vue'

const appStore = useAppStore()
const { offshoreSchools } = storeToRefs(appStore)
const schoolSearch = ref('')
const schoolHeaders = [
  { title: 'School Code', key: 'mincode' },
  { title: 'Name', key: 'displayName' },
  { title: 'Address', key: 'addresses' },
  { title: 'Contact', key: 'contact' }
]
const downloadSchools = ref<any>([])
const filteredSchools = ref<any>([])
const headers = ref([
  {
    text: 'Name',
    value: 'schoolDisplayName'
  }
  // Add more header objects for additional columns
])
console.log(offshoreSchools)
const downloadCSV = () => {
  jsonexport(downloadSchools.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}
const transformContactForDownload = (inputData: any): {} => {
  return inputData.map((item: any) => ({
    'District Number': item.districtNumber,
    'School Code': item.schoolNumber,
    'School Name': item.displayName,
    Address: item.addressLine1,
    City: item.city,
    Province: item.provinceCode,
    Country: item.countryCode,
    'Postal Code': item.postal,
    Role: item.jobTitle,
    'First Name': item.firstName,
    'Last Name': item.lastName,
    'Facility Type': appStore.getFacilityCodeLabel(item.facilityTypeCode),
    'School Category': appStore.getCategoryCodeLabel(item.schoolCategoryCode),
    'Phone Number': item.phoneNumber,
    'Fax Number': item.faxNumber,
    Email: item.email,
    'Elementary Ungraded': item.ELEMUNGR,
    'Secondary Ungraded': item.SECUNGR,
    'Kindergarten Half': item.KINDHALF,
    KindergartenFull: item.KINDFULL,
    'Grade 01': item.GRADE01,
    'Grade 02': item.GRADE02,
    'Grade 03': item.GRADE03,
    'Grade 04': item.GRADE04,
    'Grade 05': item.GRADE05,
    'Grade 06': item.GRADE06,
    'Grade 07': item.GRADE07,
    'Grade 08': item.GRADE08,
    'Grade 09': item.GRADE09,
    'Grade 10': item.GRADE10,
    'Grade 11': item.GRADE11,
    'Grade 12': item.GRADE12
  }))
}
onBeforeMount(() => {
  if (offshoreSchools.value) {
    for (let i = 0; i < offshoreSchools.value.length; i++) {
      filteredSchools.value = offshoreSchools.value
      filteredSchools.value[i].districtNumber = distNumberFromMincode(
        offshoreSchools.value[i]?.mincode
      )
      filteredSchools.value[i].schoolNumber = (offshoreSchools.value[i] as any)?.schoolNumber
      filteredSchools.value[i].displayName = offshoreSchools.value[i]?.displayName
      filteredSchools.value[i].addressLine1 = (
        offshoreSchools.value[i] as any
      )?.addresses[0]?.addressLine1
      filteredSchools.value[i].city = (offshoreSchools.value[i] as any)?.addresses[0]?.city
      filteredSchools.value[i].provinceCode = (
        offshoreSchools.value[i] as any
      )?.addresses[0]?.provinceCode
      filteredSchools.value[i].countryCode = (
        offshoreSchools.value[i] as any
      )?.addresses[0]?.countryCode
      filteredSchools.value[i].postal = (offshoreSchools.value[i] as any)?.addresses[0]?.postal
      filteredSchools.value[i].jobTitle = (offshoreSchools.value[i] as any)?.contacts[0]?.jobTitle
      filteredSchools.value[i].firstName = (offshoreSchools.value[i] as any)?.contacts[0]?.firstName
      filteredSchools.value[i].lastName = (offshoreSchools.value[i] as any)?.contacts[0]?.lastName
      filteredSchools.value[i].facilityTypeCode = (
        offshoreSchools.value[i] as any
      )?.facilityTypeCode
      filteredSchools.value[i].schoolCategoryCode = (
        offshoreSchools.value[i] as any
      )?.schoolCategoryCode
      filteredSchools.value[i].phoneNumber = (offshoreSchools.value[i] as any)?.phoneNumber
      filteredSchools.value[i].faxNumber = (offshoreSchools.value[i] as any)?.faxNumber
      filteredSchools.value[i].email = (offshoreSchools.value[i] as any)?.email
      filteredSchools.value[i].ELEMUNGR = (offshoreSchools.value[i] as any)?.ELEMUNGR
      filteredSchools.value[i].SECUNGR = (offshoreSchools.value[i] as any)?.SECUNGR
      filteredSchools.value[i].KINDHALF = (offshoreSchools.value[i] as any)?.KINDHALF
      filteredSchools.value[i].KINDFULL = (offshoreSchools.value[i] as any)?.KINDFULL
      filteredSchools.value[i].GRADE01 = (offshoreSchools.value[i] as any)?.GRADE01
      filteredSchools.value[i].GRADE02 = (offshoreSchools.value[i] as any)?.GRADE02
      filteredSchools.value[i].GRADE03 = (offshoreSchools.value[i] as any)?.GRADE03
      filteredSchools.value[i].GRADE03 = (offshoreSchools.value[i] as any)?.GRADE03
      filteredSchools.value[i].GRADE04 = (offshoreSchools.value[i] as any)?.GRADE04
      filteredSchools.value[i].GRADE05 = (offshoreSchools.value[i] as any)?.GRADE05
      filteredSchools.value[i].GRADE06 = (offshoreSchools.value[i] as any)?.GRADE06
      filteredSchools.value[i].GRADE07 = (offshoreSchools.value[i] as any)?.GRADE07
      filteredSchools.value[i].GRADE08 = (offshoreSchools.value[i] as any)?.GRADE08
      filteredSchools.value[i].GRADE09 = (offshoreSchools.value[i] as any)?.GRADE09
      filteredSchools.value[i].GRADE10 = (offshoreSchools.value[i] as any)?.GRADE10
      filteredSchools.value[i].GRADE11 = (offshoreSchools.value[i] as any)?.GRADE11
      filteredSchools.value[i].GRADE12 = (offshoreSchools.value[i] as any)?.GRADE12
    }
    downloadSchools.value = transformContactForDownload(filteredSchools.value)
  }
})
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[{ title: 'Home', href: '/' }, 'Offshore Schools']"
    ></v-breadcrumbs>
    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-container id="main">
        <DisplayAlert class="mx-4 mx-md-0" />
        <v-row no-gutters justify="space-between">
          <v-col cols="11" md="auto">
            <h1 class="mt-3 mb-2 mx-4 mx-md-0">Offshore Schools</h1>
          </v-col>
        </v-row>
        <v-row no-gutters justify="space-between">
          <v-col cols="11" md="4"
            ><v-btn
              variant="text"
              class="text-none text-subtitle-1 ma-1 mx-4 mx-md-0 v-btn-align-left"
              href="/api/v1/download/csv/authority/all-mailing/OFFSHORE?filepath=offshoreschoolrepresentatives"
              ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download Offshore
              Representatives (CSV)</v-btn
            >
            <v-btn
              @click="downloadCSV"
              variant="text"
              class="text-none text-subtitle-1 ma-1 mx-4 mx-md-0 v-btn-align-left"
              ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download Offshore
              Schools(CSV)</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
    <!-- END Offshore Schools Header Block -->

    <v-sheet class="pa-6">
      <v-container>
        <v-text-field
          v-model="schoolSearch"
          append-icon="mdi-magnify"
          label="Filter Offshore School"
          single-line
          hide-details
        ></v-text-field>
        <v-data-table
          :headers="schoolHeaders"
          :hide-default-footer="true"
          items-per-page="50"
          :items="offshoreSchools"
          :search="schoolSearch"
          :sort-by="[{ key: 'mincode', order: 'asc' }]"
        >
          <template v-slot:item.displayName="{ item }">
            <a :href="`/school/${item.schoolId}`"> {{ item.displayName }} </a>
          </template>

          <template v-slot:item.addresses="{ item }">
            <div v-for="address in item.addresses">
              <DisplayAddress v-bind="address" />
            </div>
          </template>
          <template v-slot:item.contact="{ item }">
            <strong>Phone:</strong> {{ item.phoneNumber }} <br />
            <strong>Fax:</strong> {{ item.faxNumber }} <br />
            <strong>Email:</strong> <a :href="'mailto:' + item.email">{{ item.email }}</a>
          </template>
        </v-data-table>
      </v-container>
    </v-sheet>
  </div>
</template>

<style></style>

<style></style>
