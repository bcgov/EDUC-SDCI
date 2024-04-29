<script setup lang="ts">
import InstituteService from '@/services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import router from '@/router'
import { formatPhoneNumber, isValidDistrictNumber } from '@/utils/common'
import type { District, School, Grade, Address, Contact } from '@/types/types.d.ts'
import jsonexport from 'jsonexport/dist'
import { useSanitizeURL } from '@/composables/string'
// import common components
import DisplayAddress from '@/components/common/DisplayAddress.vue'
import DisplayAlert from '@/components/common/DisplayAlert.vue'

const appStore = useAppStore()
const districtId = ref<string | null>(null) // Initialize with null initially
const district = reactive({ value: {} as District })
const schools = ref<any>([])
const contacts = ref<any>([])
const filteredContacts = ref<any>([])
const filteredSchools = ref<any>([])
// const downloadContacts = ref<any>([])
const tabOptions = {
  contacts: 1,
  schools: 2
}
const tab = ref(tabOptions.contacts) // Default to contacts tab
const contactHeaders = [
  { title: 'Role', key: 'jobTitle' },
  { title: 'Contact', key: 'label' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Extension', key: 'phoneExtension' },
  { title: 'Email', key: 'email' }
]
const schoolHeaders = [
  { title: 'School Name', key: 'displayName' },
  { title: 'Mincode', key: 'mincode' },
  { title: 'Category', key: 'schoolCategoryCode' },
  { title: 'Type', key: 'facilityTypeCode' },
  //{ title: 'Grades', key: ''},
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Fax', key: 'faxNumber' },
  { title: 'Email', key: 'email' },
  { title: 'Website', key: 'website' }
]

const schoolSearch = ref('')
const contactSearch = ref('')
//sorting
// const contactSortBy = [{ key: 'label', order: 'asc' }]
// const schoolSortBy = [{ key: 'mincode', order: 'asc' }]
// functions
function goToSchool(displayName: string, mincode: string, id: string) {
  router.push({
    name: 'school',
    params: {
      displayName: useSanitizeURL(String(displayName)),
      schoolNumber: useSanitizeURL(String(mincode)),
      schoolId: id
    }
  })
}
function downloadDistrictContacts() {
  jsonexport(filteredContacts.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}
function downloadDistrictSchools() {
  jsonexport(filteredSchools.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}

onMounted(async () => {
  const route = useRoute()
  // Set the districtId inside the onMounted hook; null if districtId not found
  if (isValidDistrictNumber(String(route.params.districtNumber))) {
    districtId.value =
      appStore.getDistrictByDistrictNumber(String(route.params.districtNumber))?.districtId ?? null
  }
  // get district data
  if (!!districtId.value) {
    try {
      const response = await InstituteService.getDistrictView(districtId.value as string)
      if (response.data?.districtData?.contacts) {
        district.value = response.data
        contacts.value = response.data?.districtData?.contacts
        schools.value = district.value?.districtSchools

        //Change School date for DL
        const transformedSchoolData = schools.value.map((school: School) => {
          const { contacts, addresses, ...rest } = school
          const transformedContacts = contacts.map(({ schoolContactTypeCode, ...contactRest }) => ({
            schoolContactTypeCode,
            ...contactRest
          }))
          const physicalAddress = addresses.find(
            (address: Address) => address?.addressTypeCode === 'PHYSICAL'
          )
          const mailingAddress = addresses.find(
            (address: Address) => address?.addressTypeCode === 'MAILING'
          )
          return {
            ...rest,
            contacts: transformedContacts.reduce((acc, contact) => ({ ...acc, ...contact }), {}),
            physicalAddress: physicalAddress,
            mailingAddress: mailingAddress,
            grades: [],
            neighborhoodLearning: [],
            schoolMove: []
          }
        })
        //Change School data for DL
        filteredSchools.value = transformedSchoolData.map((item: any) => {
          return {
            'District Number': response.data.districtData.districtNumber,
            Mincode: item.mincode,
            'Display Name': item.displayName,
            'Mailing Address': item.mailingAddress?.addressLine1,
            'Mailing Address Line2': item.mailingAddress?.addressLine2,
            'Mailing Address City': item.mailingAddress?.city,
            'Mailing Address Province': item.mailingAddress?.provinceCode,
            'Mailing Address PostalCode': item.mailingAddress?.postal,
            'Physical Address': item.physicalAddress?.addressLine1,
            'Physical Address Line2': item.physicalAddress?.addressLine2,
            'Physical Address City': item.physicalAddress?.city,
            'Physical Address Province': item.physicalAddress?.provinceCode,
            'Physical Address Postal Code': item.physicalAddress?.postal,
            Role: item.contacts?.jobTitle,
            'Contact First Name': item.contacts?.firstName,
            'Contact Last Name': item.contacts?.lastName,
            'Contact Phone Extension': item.contacts?.phoneExtension,
            'Contact Phone Number': item.contacts?.phoneNumber,
            'Facility Type Code': appStore.getFacilityCodeLabel(item.facilityTypeCode),
            'School Category Code': appStore.getCategoryCodeLabel(item.schoolCategoryCode),
            'Phone Number': item.phoneNumber,
            Fax: item.faxNumber,
            Email: item.email,
            Website: item.website,
            'Group Classification Primary K-3': item.primaryK3,
            'Group Classification Elementary 4-7 EU': item.elementary47,
            'Group Classification Junior Secondary 8-10 SU': item.juniorSecondary810,
            'Group Classification Senior Secondary 11-12': item.seniorSecondary1112
          }
        })
        filteredContacts.value = contacts.value.map((item: any) => {
          return {
            'District Number': response.data.districtData?.districtNumber,
            'District Name': response.data.districtData?.displayName,
            'Contact Type': item.label,
            'Job Title': item.jobTitle,
            'First Name': item.firstName,
            'Last Name': item.lastName,
            'Phone Number': item.phoneNumber,
            'Phone Extension': item.phoneExtension,
            'Alternate Phone Number': item.alternatePhoneNumber,
            'Alternate Phone Extension': item.alternatePhoneExtension,
            Email: item.email,
            'Mailing Address': response.data.districtData?.addresses[0].addressLine1,
            'Mailing City': response.data.districtData?.addresses[0].city,
            'Mailing Province': response.data.districtData?.addresses[0].provinceCode,
            'Mailing Postal Code': response.data.districtData?.addresses[0].postal,
            'District Phone': response.data.districtData?.phoneNumber,
            'District Fax': response.data.districtData?.faxNumber,
            Website: response.data.districtData?.website
          }
        })
      }
    } catch (error) {
      console.error(error)
    }
  }
  // get district contact type codes
  // try {
  //   const response = await InstituteService.getDistrictContactTypeCodes()
  //   districtContactTypeCodes.value = response.data
  // } catch (error) {
  //   console.error(error)
  // }
})
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[
        { title: 'Home', href: '/' },
        'District',
        district.value.districtData?.districtNumber + ' ' + district.value.districtData?.displayName
      ]"
    ></v-breadcrumbs>

    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-container id="main">
        <DisplayAlert class="mx-4 mx-lg-0" />
        <v-row no-gutters justify="space-between" class="pa-4 pa-md-5 pa-lg-0">
          <v-col cols="12" v-if="district.value.districtData">
            <v-row no-gutters justify="space-between">
              <v-col>
                <h1 class="mt-1 mt-md-3 mb-6 mb-md-2">
                  <span class="d-inline d-md-none">District </span>
                  <span>
                    {{ district.value.districtData?.districtNumber }}
                  </span>
                  <span class="d-none d-md-inline"> - </span>
                  <span class="d-block d-md-inline institute-name">
                    {{ district.value.districtData?.displayName }}
                  </span>
                </h1>
              </v-col>
            </v-row>
            <v-row no-gutters justify="space-between">
              <v-col cols="11" md="auto" class="mb-4">
                <p v-if="district.value.districtData?.phoneNumber">
                  <strong>Phone:</strong>
                  {{ formatPhoneNumber(district.value.districtData?.phoneNumber) }}
                </p>
                <p v-if="district.value.districtData?.faxNumber">
                  <strong>Fax:</strong>
                  {{ formatPhoneNumber(district.value.districtData?.faxNumber) }}
                </p>
                <p v-if="district.value.districtData?.email">
                  <strong>Email: </strong
                  ><a :href="'mailto:' + district.value.districtData?.email">{{
                    district.value.districtData?.email
                  }}</a>
                </p>
                <p>
                  <a :href="district.value.districtData?.website">{{
                    district.value.districtData?.website
                  }}</a>
                </p>
              </v-col>

              <v-col
                cols="11"
                md="auto"
                v-for="item in district.value.districtData.addresses"
                :key="item.addressTypeCode"
              >
                <DisplayAddress v-bind="item" class="mb-3" />
              </v-col>

              <v-col cols="11" md="4" class="pa-0 pa-md-3">
                <v-btn
                  variant="text"
                  class="text-none text-subtitle-1 ma-1 v-btn-align-left"
                  @click="downloadDistrictContacts"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download
                  District Contacts (CSV)</v-btn
                >
                <v-btn
                  variant="text"
                  class="text-none text-subtitle-1 ma-1 v-btn-align-left"
                  @click="downloadDistrictSchools"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download
                  District Schools (CSV)</v-btn
                >
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
    <!-- END DISTRICT HEADER INFO -->

    <v-sheet class="pa-6">
      <v-tabs v-model="tab">
        <v-tab :value="tabOptions.contacts">
          District Contacts
          <v-chip color="bcGovBlue" size="small" class="ml-1" variant="tonal">{{
            district.value.districtData?.contacts.length
          }}</v-chip>
        </v-tab>
        <v-tab :value="tabOptions.schools">
          District Schools
          <v-chip color="bcGovBlue" size="small" class="ml-1" variant="tonal">{{
            district.value.districtSchools?.length
          }}</v-chip>
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <!-- District Contacts tab contents -->
          <v-window-item :value="tabOptions.contacts">
            <v-text-field
              v-model="contactSearch"
              append-icon="mdi-magnify"
              label="Filter District Contacts"
              single-line
              hide-details
            ></v-text-field>
            <v-data-table
              items-per-page="-1"
              :headers="contactHeaders"
              :items="district.value.districtData?.contacts"
              :search="contactSearch"
              :sort-by="[{ key: 'label', order: 'asc' }]"
            >
              <template v-slot:item.email="{ item }">
                <a :href="`mailto:${item.email}`">{{ item.email }}</a>
              </template>

              <template v-slot:item.phoneNumber="{ item }">
                <div style="min-width: 125px">
                  {{ formatPhoneNumber(item.phoneNumber) }}
                </div>
              </template>
            </v-data-table>
          </v-window-item>
          <!-- District Schools tab contents -->
          <v-window-item :value="tabOptions.schools">
            <v-text-field
              v-model="schoolSearch"
              append-icon="mdi-magnify"
              label="Filter District Schools"
              single-line
              hide-details
            ></v-text-field>
            <v-data-table
              items-per-page="-1"
              :headers="schoolHeaders"
              :items="district.value.districtSchools"
              :search="schoolSearch"
              :sort-by="[{ key: 'mincode', order: 'asc' }]"
            >
              <template v-slot:item.displayName="{ item }">
                <a @click="goToSchool(item.displayName, item.mincode, item.schoolId)">{{
                  item.displayName
                }}</a>
              </template>
              <template v-slot:item.schoolCategoryCode="{ item }">
                {{ appStore.getCategoryCodeLabel(item.schoolCategoryCode) }}
              </template>

              <template v-slot:item.facilityTypeCode="{ item }">
                {{ appStore.getFacilityCodeLabel(item.facilityTypeCode) }}
              </template>

              <template v-slot:item.email="{ item }">
                <a :href="`mailto:${item.email}`">{{ item.email }}</a>
              </template>

              <template v-slot:item.website="{ item }">
                <a :href="item.website">{{ item.website }}</a>
              </template>

              <template v-slot:item.phoneNumber="{ item }">
                <div style="min-width: 125px">
                  <!-- Adjust the min-width value as needed -->
                  {{ formatPhoneNumber(item.phoneNumber) }}
                </div>
              </template>

              <template v-slot:item.faxNumber="{ item }">
                <div style="min-width: 125px">
                  {{ formatPhoneNumber(item.faxNumber) }}
                </div>
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-sheet>
  </div>
</template>
