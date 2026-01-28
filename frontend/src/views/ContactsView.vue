<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { ref, onMounted } from 'vue'
import InstituteService from '@/services/InstituteService'
import jsonexport from 'jsonexport/dist'

import DisplayAlert from '@/components/common/DisplayAlert.vue'

const appStore = useAppStore()
// used for open and close modal
const dialog = ref(false)
// varibles used for search
const filteredContacts = ref([])
const selectedContactType = ref(null)
const results = ref(0)
const itemsPerPage = ref(1000)
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
  jsonexport(transformContactForDownload(filteredContacts.value), function (err: any, csv: any) {
    if (err) return console.error(err)
    const contactType = appStore.getDistrictContactTypeCodes.find(
      (c: any) => c.districtContactTypeCode === selectedContactType.value
    )
    const fileName = contactType ? contactType.label + "_contacts.csv" : "contacts.csv"
    appStore.exportCSV(csv, fileName)
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
    "District Number": item.districtNumber,
    "District Name": item.districtName,
    "First Name": item.firstName,
    "Last Name": item.lastName,
    "Title": item.jobTitle,
    "Phone": item.phoneNumber,
    "Extension": item.phoneExtension,
    "Alternate Phone": item.alternatePhoneNumber,
    "Alternate Extension": item.alternatePhoneExtension,
    "Email": item.email
  }))
}

const searchContact = async () => {
  // Use backend builder if a specific contact type is selected

  try {
    if (selectedContactType.value) {
      const req = {
        pageSize: { value: itemsPerPage.value },
        pageNumber: 0,
        sort: itemsSort.value
      }
      const searchResults = await InstituteService.searchContactByType2(
        selectedContactType.value,
        req
      )
      filteredContacts.value = searchResults.data.content

      results.value = searchResults.data.totalElements
      totalPages.value = searchResults.data.totalPages
      return
    }
  } catch (error) {
    console.error('Error fetching schools:', error)
  }
}
onMounted(() => {
  searchContact() // <div>
})
</script>

<template>
  <div>
    <v-breadcrumbs class="breadcrumbs" bg-color="white"
      :items="[{ title: 'Home', href: '/' }, 'Contacts by Type']"></v-breadcrumbs>
    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-container id="main">
        <DisplayAlert class="mx-4 mx-md-0" />
        <v-row no-gutters justify="space-between" class="pa-4 pa-md-0">
          <v-spacer />
          <v-col cols="12">
            <h2 class="mt-3 mb-2">Find District Contacts by Type</h2>
            <v-row no-gutters>
              <v-col cols="11" md="4">
                <v-autocomplete v-model="selectedContactType" label="Select a Contact by Type"
                  :items="appStore.getDistrictContactTypeCodes" item-title="label"
                  item-value="districtContactTypeCode"></v-autocomplete>
              </v-col>
              <v-col cols="3">
                <v-btn @click="searchContact" icon="mdi-magnify" color="primary" variant="flat" rounded="lg"
                  size="large" class="text-none text-subtle-1 ml-md-4" />
              </v-col>
              <v-spacer class="d-block d-md-none" />
              <v-col cols="3" md="12">
                <v-btn @click="resetContactFilters" variant="outlined" color="primary" class="text-none">Reset</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
    <!-- END Contacts by Type header-->
    <v-row>
      <v-col class="ma-2">TOTAL: {{ results }}</v-col>
      <v-col></v-col>
      <v-col>
        <v-btn block class="text-none text-subtitle-1 ma-1" @click="downloadCSV" :disabled="results == 0"><template
            v-slot:prepend> <v-icon icon="mdi-download" /> </template>Contact Info</v-btn>
      </v-col>
    </v-row>
    <v-data-table-virtual :headers="headers" :items="filteredContacts" class="elevation-1" item-value="name"
      :sort-by="[{ key: 'districtNumber', order: 'asc' }]"></v-data-table-virtual>
  </div>
</template>

<style></style>
