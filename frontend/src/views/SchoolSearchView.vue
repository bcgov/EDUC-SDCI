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
          multiple
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="selectedCity" :items="cities" label="City"></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedType"
          item-title="label"
          item-value="facilityTypeCode"
          :items="types"
          label="Types"
          multiple
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-btn @click="searchSchools" color="primary">Search</v-btn>
        <v-btn @click="resetFilters" color="error">Reset</v-btn>
      </v-col>
    </v-row>

    <!-- Search Results Table -->
    TOTAL: {{ results }} Current Page {{ currentPage }}
    <v-data-table-server
      v-model:expanded="expanded"
      :items-per-page="itemsPerPage"
      :headers="headers"
      :items-length="results"
      :items="filteredSchools"
      show-expand
      class="elevation-1"
      item-value="schoolId"
      :loading="loading"
      @page-change:page="handlePageChange"
      @update:options="handleUpdate"
    >
      <template v-slot:item.displayName="{ item }">
        <a :href="`/school/${item.selectable.schoolId}`">{{ item.selectable.displayName }}</a>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <v-card>
              <v-card-title> {{ item.selectable.displayName }} School Information </v-card-title>
              <v-card-text>
                <p>Category Code: {{ item.selectable.schoolCategoryCode }}</p>
                <p>Facility Code: {{ item.selectable.facilityTypeCode }}</p>
                <p>
                  District:
                  <router-link :to="`/district/District${item.selectable.districtId}`">
                    View District
                  </router-link>
                </p>
                <p>
                  Grades:
                  <v-container>
                    <v-row>
                      <v-col
                        v-for="(grade, index) in item.selectable.grades"
                        :key="index"
                        cols="12"
                        md="4"
                      >
                        {{ grade.schoolGradeCode }}
                      </v-col>
                    </v-row>
                  </v-container>
                </p>
                <p>
                  Addresses:
                  <v-container>
                    <v-row>
                      <v-col
                        v-for="(address, index) in item.raw.addresses"
                        :key="index"
                        cols="12"
                        md="4"
                      >
                        <v-card>
                          <v-card-text>
                            <v-list dense>
                              <v-list-item>
                                <v-list-item-content>
                                  <v-list-item-title>
                                    <p>addressLine1 {{ address.addressLine1 }}</p>
                                    <p>addressLine2 {{ address.addressLine2 }}</p>
                                    <p>city {{ address.city }}</p>
                                    <p>postal {{ address.postal }}</p>
                                    <p>addressTypeCode {{ address.addressTypeCode }}</p>
                                    <p>provinceCode {{ address.provinceCode }}</p>
                                    <p>countryCode {{ address.countryCode }}</p>
                                    <p>schoolAddressId {{ address.schoolAddressId }}</p>
                                  </v-list-item-title>
                                </v-list-item-content>
                              </v-list-item>
                            </v-list>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </p>
              </v-card-text>
            </v-card>
          </td>
        </tr>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, isProxy, toRaw } from 'vue'
import InstituteService from '@/services/InstituteService'

const jurisdictions = ref([])
const cities = ref([])
const types = ref([])
const grades = ref([])

const selectedJurisdiction = ref(null)
const selectedCity = ref(null)
const selectedType = ref(null)
const selectedGrade = ref(null)
const results = ref(0)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const itemsSort = ref('')
const totalPages = ref(0)
const loading = ref(false)
const handlePageChange = async (page) => {
  loading.value = true
  currentPage.value = page
  await searchSchools()
  loading.value = false
}
const handleUpdate = async (options) => {
  loading.value = true
  currentPage.value = options.page || currentPage.value
  itemsPerPage.value = options.perPage || itemsPerPage.value
  if (isProxy(options.sortBy)) {
    console.log('is proxy')
    const sortby = toRaw(options.sortBy)
    itemsSort.value = sortby[0]
  }

  await searchSchools()
  loading.value = false
}

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
  { title: '', key: 'data-table-expand' },
  { title: 'School Name', key: 'displayName' },
  { title: 'ID', key: 'schoolId' },
  { title: 'school Category', key: 'schoolCategoryCode' },
  { title: 'Mincode', key: 'mincode' }
]

const filteredSchools = ref(schools)
const search = ref('')
const expanded = ref([])

const searchSchools = async () => {
  // Filter schools based on selected filters
  let currentDate = new Date().toISOString().substring(0, 19)
  console.log(currentDate)
  const params = [
    {
      condition: null,
      searchCriteriaList: []
    }
  ]
  if (selectedJurisdiction.value) {
    params[0].searchCriteriaList.push({
      key: 'schoolCategoryCode',
      operation: selectedJurisdiction.value.length > 1 ? 'in' : 'eq',
      value: selectedJurisdiction.value.join(','),
      valueType: 'STRING',
      condition: 'AND'
    })
  }
  if (selectedType.value) {
    params[0].searchCriteriaList.push({
      key: 'facilityTypeCode',
      operation: 'in',
      value: selectedType.value.join(','),
      valueType: 'STRING',
      condition: 'AND'
    })
  }
  //only add open schools
  params[0].searchCriteriaList.push({
    key: 'openedDate',
    operation: 'lte',
    value: currentDate,
    valueType: 'DATE_TIME',
    condition: 'AND'
  })
  params[0].searchCriteriaList.push({
    key: 'closedDate',
    operation: 'eq',
    value: null,
    valueType: 'STRING',
    condition: 'AND'
  })

  const jsonString = JSON.stringify(params)
  const encodedParams = encodeURIComponent(jsonString)

  const req = {
    pageNumber: currentPage.value,
    pageSize: itemsPerPage,
    searchCriteriaList: encodedParams,
    sort: itemsSort.value
  }

  try {
    const searchresults = await InstituteService.searchSchools(req)
    filteredSchools.value = searchresults.data.content
    results.value = searchresults.data.totalElements

    // Update current page and total pages
    currentPage.value = req.pageNumber
    totalPages.value = searchresults.data.totalPages
  } catch (error) {
    console.error('Error fetching schools:', error)
  }
}

const resetFilters = () => {
  // Reset selected filters and search input to show all schools
  selectedJurisdiction.value = null
  selectedCity.value = null
  selectedType.value = null
  selectedGrade.value = null
  search.value = ''
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
