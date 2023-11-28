<script setup lang="ts">
import { ref, onMounted, onBeforeMount, isProxy, toRaw } from 'vue'
import { useAppStore } from '@/stores/app'
import InstituteService from '@/services/InstituteService'
import DisplayAddress from '@/components/common/DisplayAddress.vue'
const currentDate: Date = new Date()
const appStore = useAppStore()
const jurisdictions = ref([])
const cities = ref([])
const types = ref([])
const grades = ref([])

const selectedJurisdiction = ref<any>(null)
const selectedCity = ref<any>(null)
const selectedType = ref<any>(null)
const selectedGrade = ref<any>(null)
const results = ref<any>(0)
const currentPage = ref<any>(0)
const itemsPerPage = ref<any>(10)
const itemsSort = ref<any>('ASC')
const totalPages = ref<any>(0)
const loading = ref<any>(false)
const handlePageChange = async (page: any) => {
  loading.value = true
  currentPage.value = page
  await searchSchools()
  loading.value = false
}
const handleUpdate = async (options: any) => {
  loading.value = true
  currentPage.value = options.page || currentPage.value
  itemsPerPage.value = options.perPage || itemsPerPage.value
  if (isProxy(options.sortBy)) {
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
    //filter out the schools that have expired
    jurisdictions.value = response.data?.filter((item: any) => {
      const effectiveDate: Date = new Date(item.effectiveDate)
      const expiryDate: Date = new Date(item.expiryDate)
      return expiryDate >= currentDate && effectiveDate <= currentDate
    })
    //sort by display order
    jurisdictions.value?.sort((a: any, b: any) => {
      return a.displayOrder - b.displayOrder
    })
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
    category: 'Category 1',
    city: 'City 1',
    type: 'Type A',
    grade: 'Grade 1'
    // Add more school data objects as needed
  },
  {
    category: 'Category 2',
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
  { title: 'Mincode', key: 'mincode' },
  { title: 'Category', key: 'schoolCategoryCodeLabel' },
  { title: 'Type', key: 'facilityTypeCodeLabel' }
]

const filteredSchools = ref(schools)
const search = ref('')
const expanded = ref([])
const transformedSchools = ref(schools)
const searchSchools = async () => {
  // Filter schools based on selected filters
  let currentDate = new Date().toISOString().substring(0, 19)
  const params: any = [
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
    pageNumber: currentPage.value !== 0 ? currentPage.value - 1 : currentPage.value,
    pageSize: itemsPerPage,
    searchCriteriaList: encodedParams,
    sort: itemsSort.value
  }

  try {
    const searchresults = await InstituteService.searchSchools(req)
    filteredSchools.value = searchresults.data?.content
    transformedSchools.value = filteredSchools.value.map((item: any) => {
      const { ...rest } = item
      return {
        ...rest,
        schoolCategoryCodeLabel: appStore.getCategoryCodeLabel(item.schoolCategoryCode),
        facilityTypeCodeLabel: appStore.getFacilityCodeLabel(item.facilityTypeCode),
        grades: appStore.compareSchoolGrades(appStore.getGradeByGradeCodes, item.grades)
      }
    })
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
  transformedSchools.value = schools
  results.value = 0
  currentPage.value = 0
  totalPages.value = 0
}

onBeforeMount(async () => {
  // Fetch types data when the component is mounted
  await fetchTypes()
  searchSchools()
})
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[{ title: 'Home', href: '/' }, 'Search']"
    ></v-breadcrumbs>
    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <h2>Find Schools</h2>
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedJurisdiction"
            :items="jurisdictions"
            item-title="label"
            item-value="schoolCategoryCode"
            label="Category"
            multiple
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedType"
            item-title="label"
            item-value="facilityTypeCode"
            :items="types"
            label="Types"
            multiple
          ></v-select>
        </v-col>
        <v-col cols="12" md="3"
          ><v-btn
            icon="mdi-magnify"
            color="primary"
            variant="flat"
            rounded="lg"
            size="large"
            @click="searchSchools"
            class="text-none text-subtle-1 ml-3"
        /></v-col>
        <v-col cols="12">
          <v-btn @click="resetFilters" variant="outlined" color="primary" class="text-none"
            >Reset</v-btn
          >
          <!-- <v-btn @click="searchSchools" color="primary">Search</v-btn> -->
        </v-col>
      </v-row>
    </v-sheet>

    <v-card class="pa-6" width="100%">
      <!-- Search Results Table -->
      Total: {{ results }} <span v-if="results != 0">Current Page {{ currentPage + 1 }}</span>
      <v-data-table-server
        v-if="results != 0"
        v-model:items-per-page="itemsPerPage"
        :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' }
        ]"
        :expanded="expanded"
        :headers="headers"
        :items-length="results"
        :items="transformedSchools"
        show-expand
        class="elevation-1"
        item-value="schoolId"
        :loading="loading"
        @page-change:page="handlePageChange"
        @update:options="handleUpdate"
        :sort-by="[{ key: 'mincode', order: 'asc' }]"
      >
        <template v-slot:item.displayName="{ item }">
          <a :href="`/school/${item.schoolId}`">{{ item.displayName }}</a>
        </template>
        <template v-slot:expanded-row="{ item }">
          <tr>
            <td :colspan="headers.length">
              <v-col>
                <v-row class="my-1 pl-2">
                  <v-chip
                    v-for="(grade, index) in item.grades"
                    :key="index"
                    class="ml-1"
                    size="small"
                    color="primary"
                    label
                  >
                    {{ grade.label }}</v-chip
                  >
                </v-row>
                <v-row>
                  <p>
                    <router-link
                      class="pl-4"
                      :to="`/district/${
                        appStore.getDistrictByDistrictId(item.districtId)?.districtNumber
                      }-${appStore.getDistrictByDistrictId(item.districtId)?.displayName}`"
                    >
                      District
                      {{ appStore.getDistrictByDistrictId(item.districtId)?.districtNumber }} -
                      {{ appStore.getDistrictByDistrictId(item.districtId)?.displayName }}
                    </router-link>
                  </p>
                </v-row>
                <v-row>
                  <v-col v-for="(address, index) in item?.addresses" :key="index" cols="12" md="4">
                    <DisplayAddress v-bind="address" />
                  </v-col>
                </v-row>
              </v-col>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<style>
/* Add custom styles here if needed */
</style>
