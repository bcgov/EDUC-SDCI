<template>
  <v-container class="my-4">
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedJurisdiction"
          :items="jurisdictions"
          item-title="label"
          item-value="schoolCategoryCode"
          label="Jurisdiction"
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="selectedCity" :items="cities" label="City"></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedType"
          :items="types"
          item-title="facilityTypeCode"
          item-value="label"
          :label="Type"
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedGrade"
          :items="grades"
          item-value="label"
          item-title="schoolGradeCode"
          label="Grade"
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-btn @click="searchSchools" color="primary">Search</v-btn>
        <v-btn @click="resetFilters" color="error">Reset</v-btn>
      </v-col>
    </v-row>

    <!-- Search Results Table -->
    Total: {{ results }}
    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="filteredSchools"
      item-value="name"
      class="elevation-1"
    ></v-data-table>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import InstituteService from '@/services/InstituteService'

const jurisdictions = ref([])
const cities = ref([])
const types = ref([])
const grades = ref([])

const selectedJurisdiction = ref(null)
const selectedCity = ref(null)
const selectedType = ref(null)
const selectedGrade = ref(null)
const results = ref(null)

const fetchTypes = async () => {
  try {
    const response = await InstituteService.getFacilityCodes()
    types.value = response.data
  } catch (error) {
    console.error('Error fetching types:', error)
  }
  try {
    const response = await InstituteService.getCategoryCodes()
    jurisdictions.value = response.data
  } catch (error) {
    console.error('Error fetching types:', error)
  }
  try {
    const response = await InstituteService.getGradeCodes()
    grades.value = response.data
  } catch (error) {
    console.error('Error fetching types:', error)
  }
}

const schools = [
  {
    jurisdiction: 'Jurisdiction 1',
    city: 'City 1',
    type: 'Type A',
    grade: 'Grade 1'
    // Add more school data objects as needed
  },
  {
    jurisdiction: 'Jurisdiction 1',
    city: 'City 2',
    type: 'Type B',
    grade: 'Grade 2'
    // Add more school data objects as needed
  }
  // Add more school data objects as needed
]

const headers = [
  { title: 'School Name', key: 'displayName' },
  { title: 'ID', key: 'districtId' },
  { title: 'Mincode', key: 'mincode' },
  { title: 'Grade', key: 'grade' }
]

const filteredSchools = ref(schools)
const search = ref('')

const searchSchools = async () => {
  // Filter schools based on selected filters
  console.log('SEARCH')
  const req = {
    schoolCategoryCode: selectedJurisdiction.value,
    city: selectedCity.value,
    facilityTypeCode: selectedType.value,
    grade: selectedGrade.value
  }

  const schoolSearchParam = {
    params: {
      pageNumber: 1,
      pageSize: 10,
      searchCriteriaList: JSON.stringify([
        {
          condition: null,
          searchCriteriaList: [
            {
              key: 'schoolCategoryCode',
              operation: 'IN',
              value: 'EAR_LEARN,PUBLIC',
              valueType: 'String',
              condition: 'AND'
            }
          ]
        }
      ])
    }
  }

  const searchresults = await InstituteService.searchSchools(schoolSearchParam)
  console.log(searchresults.data)
  results.value = searchresults.data.totalElements
  filteredSchools.value = searchresults.data.content
}

const resetFilters = () => {
  // Reset selected filters and search input to show all schools
  selectedJurisdiction.value = null
  selectedCity.value = null
  selectedType.value = null
  selectedGrade.value = null
  search.value = ''
  results.value = ''
  filteredSchools.value = schools
}

onBeforeMount(async () => {
  // Fetch types data when the component is mounted
  await fetchTypes()
})
</script>

<style>
/* Add custom styles here if needed */
</style>
