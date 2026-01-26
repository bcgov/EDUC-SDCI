<script setup lang="ts">
import { ref, onMounted, onBeforeMount, isProxy, toRaw } from 'vue'
import { useAppStore } from '@/stores/app'
import SchoolService from '@/services/SchoolService'
import CodesService from '@/services/CodesService'
import DisplayAddress from '@/components/common/DisplayAddress.vue'
import DisplayAlert from '@/components/common/DisplayAlert.vue'

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
    const response = await CodesService.getFacilityCodes()
    types.value = response.data
  } catch (error) {
    console.error('Error fetching types:', error)
  }
  try {
    const response = await CodesService.getCategoryCodes()
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
    const response = await CodesService.getGradeCodes()
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
  { title: 'School Name', key: 'displayName', sortable: false },
  { title: 'Mincode', key: 'mincode', sortable: false },
  { title: 'Category', key: 'schoolCategoryCodeLabel', sortable: false },
  { title: 'Type', key: 'facilityTypeCodeLabel', sortable: false }
]

const filteredSchools = ref(schools)
const search = ref('')
const expanded = ref([])
const transformedSchools = ref(schools)

const searchSchools = async () => {
  // Prepare simple payload with raw values
  const req = {
    // Pass the raw arrays directly
    jurisdiction: selectedJurisdiction.value,
    type: selectedType.value,

    // Pagination & Sorting
    pageNumber: currentPage.value !== 0 ? currentPage.value - 1 : currentPage.value,
    pageSize: itemsPerPage,
    sort: itemsSort.value
  }

  try {
    // Call the service (which now accepts simple params)
    const searchresults = await SchoolService.searchSchools(req)

    filteredSchools.value = searchresults.data?.content
    transformedSchools.value = filteredSchools.value.map((item: any) => {
      const { ...rest } = item
      return {
        ...rest,
        schoolCategoryCodeLabel: appStore.getCategoryCodeLabel(item.schoolCategoryCode),
        facilityTypeCodeLabel: appStore.getFacilityCodeLabel(item.facilityTypeCode),
        grades: appStore.mapSchoolGradesToLabels(item.grades)
      }
    })
    results.value = searchresults.data.totalElements
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
      <v-container id="main">
        <DisplayAlert class="mx-4 mx-md-0" />
        <v-row no-gutters class="mx-4 mx-md-0">
          <v-col cols="11">
            <h1>Find Schools</h1>
          </v-col>
          <v-col cols="11" md="3" class="pr-md-2">
            <v-select
              v-model="selectedJurisdiction"
              :items="jurisdictions"
              item-title="label"
              item-value="schoolCategoryCode"
              label="Category"
              multiple
            ></v-select>
          </v-col>
          <v-col cols="11" md="3" class="pl-md-2">
            <v-select
              v-model="selectedType"
              item-title="label"
              item-value="facilityTypeCode"
              :items="types"
              label="Types"
              multiple
            ></v-select>
          </v-col>
          <v-col cols="3"
            ><v-btn
              icon="mdi-magnify"
              color="primary"
              variant="flat"
              rounded="lg"
              size="large"
              @click="searchSchools"
              class="text-none text-subtle-1 ml-md-4"
          /></v-col>
          <v-spacer class="d-block d-md-none" />
          <v-col cols="3" md="11">
            <v-btn @click="resetFilters" variant="outlined" color="primary" class="text-none"
              >Reset</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
    <v-sheet>
      <!-- Search Results Table -->

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
      >
        <template v-slot:item.displayName="{ item }">
          <a :href="`/school/${item.schoolId}`">{{ item.displayName }}</a>
        </template>
        <template v-slot:expanded-row="{ item }">
          <tr>
            <td :colspan="headers.length" style="padding-left: 48px">
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
                      v-if="appStore.getDistrictByDistrictId(item.districtId)"
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
                  <v-col v-if="item.fundingGroupCode">
                    <strong> Funding</strong><br />
                    Group: {{ item.fundingGroupCode }}<br />
                  </v-col>
                </v-row>
              </v-col>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </v-sheet>
  </div>
</template>

<style></style>
