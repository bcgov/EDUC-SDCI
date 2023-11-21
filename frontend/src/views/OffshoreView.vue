<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import { reactive, onBeforeMount, ref } from 'vue'
import { distNumberFromMincode } from '@/utils/common'
import jsonexport from 'jsonexport/dist'
import DisplayAddress from '@/components/common/DisplayAddress.vue'
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
    'Facility Type': item.facilityTypeCode,
    'School Category': item.schoolCategoryCode,
    'Phone Number': item.phoneNumber,
    'Fax Number': item.faxNumber,
    Email: item.email
    // 'Elementary Ungraded': item.ELEMUNGR,
    // 'Secondary Ungraded': item.SECUNGR,
    // 'Kindergarten Half': item.KINDHALF,
    // KindergartenFull: item.KINDFULL
    // GRADE01: item.GRADE01,
    // GRADE02: item.GRADE02,
    // GRADE03: item.GRADE03,
    // GRADE04: item.GRADE04,
    // GRADE05: item.GRADE05,
    // GRADE06: item.GRADE06,
    // GRADE07: item.GRADE07,
    // GRADE08: item.GRADE08,
    // GRADE09: item.GRADE09,
    // GRADE10: item.GRADE10,
    // GRADE11: item.GRADE11,
    // GRADE12: item.GRADE12
  }))
}
onBeforeMount(() => {
  if (offshoreSchools) {
    for (let i = 0; i < offshoreSchools.value.length; i++) {
      filteredSchools.value = offshoreSchools.value
      filteredSchools.value[i].districtNumber = distNumberFromMincode(
        offshoreSchools.value[i]?.mincode
      )
      filteredSchools.value[i].schoolNumber = offshoreSchools.value[i]?.schoolNumber
      filteredSchools.value[i].displayName = offshoreSchools.value[i]?.displayName
      filteredSchools.value[i].addressLine1 = offshoreSchools.value[i]?.addresses[0]?.addressLine1
      filteredSchools.value[i].city = offshoreSchools.value[i]?.addresses[0]?.city
      filteredSchools.value[i].provinceCode = offshoreSchools.value[i]?.addresses[0]?.provinceCode
      filteredSchools.value[i].countryCode = offshoreSchools.value[i]?.addresses[0]?.countryCode
      filteredSchools.value[i].postal = offshoreSchools.value[i]?.addresses[0]?.postal
      filteredSchools.value[i].jobTitle = offshoreSchools.value[i]?.contacts[0]?.jobTitle
      filteredSchools.value[i].firstName = offshoreSchools.value[i]?.contacts[0]?.firstName
      filteredSchools.value[i].lastName = offshoreSchools.value[i]?.contacts[0]?.lastName
      filteredSchools.value[i].facilityTypeCode = offshoreSchools.value[i]?.facilityTypeCode
      filteredSchools.value[i].schoolCategoryCode = offshoreSchools.value[i]?.schoolCategoryCode
      filteredSchools.value[i].phoneNumber = offshoreSchools.value[i]?.phoneNumber
      filteredSchools.value[i].faxNumber = offshoreSchools.value[i]?.faxNumber
      filteredSchools.value[i].email = offshoreSchools.value[i]?.email
      // filteredSchools.value[i].ELEMUNGR = offshoreSchools.value.ELEMUNGR
      // filteredSchools.value[i].SECUNGR = offshoreSchools.value.SECUNGR
      // filteredSchools.value[i].KINDHALF = offshoreSchools.value.KINDHALF
      // filteredSchools.value[i].KINDFULL = offshoreSchools.value.KINDFULL
      // filteredSchools.value[i].GRADE01 = offshoreSchools.value.GRADE01
      // filteredSchools.value[i].GRADE02 = offshoreSchools.value.GRADE02
      // filteredSchools.value[i].GRADE03 = offshoreSchools.value.GRADE03
      // filteredSchools.value[i].GRADE03 = offshoreSchools.value.GRADE03
      // filteredSchools.value[i].GRADE04 = offshoreSchools.value.GRADE04
      // filteredSchools.value[i].GRADE05 = offshoreSchools.value.GRADE05
      // filteredSchools.value[i].GRADE06 = offshoreSchools.value.GRADE06
      // filteredSchools.value[i].GRADE07 = offshoreSchools.value.GRADE07
      // filteredSchools.value[i].GRADE08 = offshoreSchools.value.GRADE08
      // filteredSchools.value[i].GRADE09 = offshoreSchools.value.GRADE09
      // filteredSchools.value[i].GRADE10 = offshoreSchools.value.GRADE10
      // filteredSchools.value[i].GRADE11 = offshoreSchools.value.GRADE11
      // filteredSchools.value[i].GRADE12 = offshoreSchools.value.GRADE12
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
      <v-row no-gutters justify="space-between">
        <v-col>
          <h2 class="mt-3 mb-2">Offshore Schools</h2>
        </v-col>
        <v-spacer />
        <v-col cols="3"
          ><v-btn
            variant="text"
            class="text-none text-subtitle-1 ma-1 v-btn-align-left"
            href="/api/v1/download/csv/authority/all-mailing/OFFSHORE?filepath=offshoreschoolrepresentatives"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download Offshore
            Representatives (CSV)</v-btn
          >
          <v-btn
            @click="downloadCSV"
            variant="text"
            class="text-none text-subtitle-1 ma-1 v-btn-align-left"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download Offshore
            Schools(CSV)</v-btn
          >
        </v-col>
      </v-row>
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
            <strong>Email:</strong> {{ item.email }}
          </template>
        </v-data-table>
      </v-container>
    </v-sheet>
  </div>
</template>

<style></style>

<style>
/* sizes header to align with content on desktop */
.v-toolbar__content,
.v-toolbar__extension {
  max-width: 1280px;
  padding: 0 2rem;
}
</style>
