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
  { title: 'District Name', key: 'districtName' },
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
      key: 'jobTitle',
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
  <v-dialog v-model="dialog" width="100%">
    <template v-slot:activator="{ props }">
      <v-btn
        block
        variant="outlined"
        color="bcGovBlue"
        class="text-none text-subtitle-1 mb-4"
        v-bind="props"
        ><template v-slot:append> <v-icon icon="mdi-chevron-right" /> </template>
        View District Contacts
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Contacts by Type</span>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-autocomplete
          v-model="selectedContactType"
          label="Select a Contact by Type"
          :items="appStore.getAllDistrictContactTypeCodesLabel"
          :item-title="appStore.getAllDistrictContactTypeCodesLabel"
          :item-value="appStore.getAllDistrictContactTypeCodesLabel"
        ></v-autocomplete>
        <v-btn @click="searchContact" color="primary">Search</v-btn>
        <v-btn @click="resetContactFilters" color="error">Reset</v-btn>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="dialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card-text>
      <v-row>
        <v-col class="ma-2">Total: {{ results }}</v-col>
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
    </v-card>
  </v-dialog>
</template>
