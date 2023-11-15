<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { ref } from 'vue'
import InstituteService from '@/services/InstituteService'
import * as jsonexport from 'jsonexport/dist'

const appStore = useAppStore()
// used for open and close modal
const dialog = ref(false)
// varibles used for search
const filteredContacts = ref([])
const selectedContactType = ref(null)
const results = ref(0)
const itemsPerPage = ref(100)
const itemsSort = ref('')
const totalPages = ref(1)
const headers = [
  { title: 'District Name', key: 'displayName' },
  { title: 'District', key: 'districtNumber' },
  { title: 'Title', key: 'jobTitle' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Extension', key: 'phoneExtension' },
  { title: 'Email', key: 'email' }
]
// export to CSV file
const downloadCSV = () => {
  jsonexport(filteredContacts.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}
// const loading = ref(false)
const resetContactFilters = () => {
  // Reset selected filters and search input to show all schools
  selectedContactType.value = null
  filteredContacts.value = []
  totalPages.value = 0
  results.value = 0
}
const transformContactForDownload = (inputData: any) => {
  return inputData.map((item: any) => ({
    districtNumber: item.districtNumber,
    displayName: item.displayName,
    firstName: item.firstName,
    lastName: item.lastName,
    jobTitle: item.jobTitle,
    phoneNumber: item.phoneNumber,
    phoneExtension: item.phoneExtension,
    alternatePhoneNumber: item.alternatePhoneNumber,
    alternatePhoneExtension: item.alternatePhoneExtension,
    email: item.email
  }))
}
const searchContact = async () => {
  // Filter contacts based on selected filters
  let currentDate = new Date().toISOString().substring(0, 19)
  const params: any = [
    {
      condition: null,
      searchCriteriaList: []
    }
  ]
  if (selectedContactType.value) {
    params[0].searchCriteriaList.push({
      key: 'districtContactTypeCode',
      operation: 'eq',
      value: selectedContactType.value,
      valueType: 'STRING',
      condition: 'OR'
    })
  }
  const jsonString = JSON.stringify(params)
  const encodedParams = encodeURIComponent(jsonString)
  const req = {
    pageSize: itemsPerPage,
    searchCriteriaList: encodedParams,
    sort: itemsSort.value
  }
  try {
    const searchResults = await InstituteService.searchContactByType(req)
    filteredContacts.value = transformContactForDownload(searchResults.data.content)
    results.value = searchResults.data.totalElements
    // Update current page and total pages
    totalPages.value = searchResults.data.totalPages
  } catch (error) {
    console.error('Error fetching schools:', error)
  }
}
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[{ title: 'Home', href: '/' }, 'Contacts by Type']"
    ></v-breadcrumbs>
    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-spacer />
        <v-col cols="12">
          <h2 class="mt-3 mb-2">Find District Contacts by Type</h2>
          <v-row>
            <v-autocomplete
              v-model="selectedContactType"
              label="Select a Contact by Type"
              :items="appStore.getDistrictContactTypeCodes"
              item-title="label"
              item-value="districtContactTypeCode"
            ></v-autocomplete>
            <v-btn
              @click="searchContact"
              icon="mdi-magnify"
              color="primary"
              variant="flat"
              rounded="lg"
              size="large"
              class="text-none text-subtle-1 ml-3"
            />
          </v-row>
          <v-btn @click="resetContactFilters" variant="outlined" color="primary" class="text-none"
            >Reset</v-btn
          >
        </v-col>
      </v-row>
    </v-sheet>
    <!-- END Contacts by Type header-->
    <v-container>
      <v-row>
        <v-col class="ma-2">TOTAL: {{ results }}</v-col>
        <v-col></v-col>
        <v-col>
          <v-btn
            block
            class="text-none text-subtitle-1 ma-1"
            @click="downloadCSV"
            :disabled="results == 0"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Contact Info</v-btn
          >
        </v-col>
      </v-row>
      <v-data-table-virtual
        :headers="headers"
        :items="filteredContacts"
        class="elevation-1"
        height="700"
        item-value="name"
      ></v-data-table-virtual>
    </v-container>
  </div>
</template>

<style>
/* sizes header to align with content on desktop */
.v-toolbar__content,
.v-toolbar__extension {
  max-width: 1280px;
  padding: 0 2rem;
}
</style>
