<script setup lang="ts">
import InstituteService from '@/services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import { formatPhoneNumber } from '@/utils/common'
import jsonexport from 'jsonexport/dist'
import type { Authority, School, Address } from '@/types/types.d.ts'
import { useSanitizeURL } from '@/composables/string'

// import common components
import DisplayAddress from '@/components/common/DisplayAddress.vue'
import DisplayAlert from '@/components/common/DisplayAlert.vue'

const appStore = useAppStore()
const authorityId = ref<any>(null) // Initialize with null initially

const authority = reactive({ value: {} as Authority }) // cast to Authority type
const schools = ref<any>([])
const contacts = ref<any>([])
const downloadContacts = ref<any>([])
const filteredContacts = ref<any>([])
const filteredSchools = ref<any>([])
const tabOptions = {
  contacts: 1,
  schools: 2
}

const tab = ref(tabOptions.contacts) // Default to contacts tab

const contactHeaders = [
  { title: 'Contact Type', key: 'authorityContactTypeCode' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
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
function downloadAuthorityContacts() {
  jsonexport(downloadContacts.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}
function downloadAuthoritySchools() {
  jsonexport(filteredSchools.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}
const transformContactForDownload = (inputData: any): {} => {
  return inputData.map((item: any) => ({
    'Authority Number': item.authorityNumber,
    'Display Name': item.displayName,
    'Authority Contact Type': appStore.getAuthorityContactTypeCodeLabel(
      item.authorityContactTypeCode
    ),
    'First Name': item.firstName,
    'Last Name': item.lastName,
    Email: item.email,
    'Phone Number': item.phoneNumber,
    'Phone Extension': item.phoneExtension,
    'Alternate Phone Number': item.alternatePhoneNumber,
    'Alternate Phone Extension': item.alternatePhoneExtension,
    'Mailing Address': item.mailingAddress,
    'Mailing Address City': item.mailingAddressCity,
    'Mailing Address Line2': item.mailingAddressLine2,
    'Mailing Address Postal Code': item.mailingAddressPostalCode,
    'Mailing Address Province': item.mailingAddressProvince,
    'Physical Address': item.physicalAddress,
    'Physical Address City': item.physicalAddressCity,
    'Physical Address Line2': item.physicalAddressLine2,
    'Physical Address Postal Code': item.physicalAddressPostalCode,
    'Physical Address Province': item.physicalAddressProvince
  }))
}
onMounted(async () => {
  const route = useRoute()
  authorityId.value = appStore.getAuthorityByAuthorityNumber(
    String(route.params.authorityNumber)
  )?.independentAuthorityId

  try {
    const response = await InstituteService.getAuthority(authorityId.value)
    authority.value = response.data
    schools.value = response.data?.authoritySchools
    contacts.value = response.data?.authorityData?.contacts
    //Change Auth School date for DL
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

    filteredSchools.value = transformedSchoolData.map((item: any) => {
      return {
        'Authority Number': authority.value?.authorityData?.authorityNumber,
        Mincode: item.mincode,
        'Display Name': item.displayName,
        'Contact Role': item.contacts?.jobTitle,
        'Contact First Name': item.contacts?.firstName,
        'Contact Last Name': item.contacts?.lastName,
        'Contact Phone Number': item.contacts?.phoneNumber,
        'Contact Phone Extension': item.contacts?.phoneExtension,
        'School Email': item.email,
        'Mailing Address': item.mailingAddress?.addressLine1,
        'Mailing Address Line2': item.mailingAddress?.addressLine2,
        'Mailing Address City': item.mailingAddress?.city,
        'Mailing Address Province': item.mailingAddress?.provinceCode,
        'Mailing Address PostalCode': item.mailingAddress?.postal,
        'Physical Address': item.physicalAddress?.addressLine1,
        'Physical Address Line2': item.physicalAddress?.addressLine2,
        'Physical Address City': item.physicalAddress?.city,
        'Physical Address Province': item.physicalAddress?.provinceCode,
        'Physical Address PostalCode': item.physicalAddress?.postal,
        'Facility Type Code': appStore.getFacilityCodeLabel(item.facilityTypeCode),
        'School Category Code': appStore.getCategoryCodeLabel(item.schoolCategoryCode),
        'Phone Number': item.phoneNumber,
        Fax: item.faxNumber,
        Website: item.website
      }
    })

    //Change Auth Contacts data for DL
    if (contacts?.value?.length > 0) {
      for (let i = 0; i < contacts?.value?.length; i++) {
        filteredContacts.value = response.data?.authorityData?.contacts
        filteredContacts.value[i].authorityNumber = authority.value?.authorityData?.authorityNumber
        filteredContacts.value[i].displayName = authority.value.authorityData?.displayName
        filteredContacts.value[i].mailingAddress =
          authority.value.authorityData.addresses[1]?.addressLine1
        filteredContacts.value[i].mailingAddressLine2 =
          authority.value.authorityData.addresses[1]?.addressLine2
        filteredContacts.value[i].mailingAddressCity =
          authority.value.authorityData.addresses[1]?.city
        filteredContacts.value[i].mailingAddressProvince =
          authority.value.authorityData.addresses[1]?.provinceCode
        filteredContacts.value[i].mailingAddressPostalCode =
          authority.value.authorityData.addresses[1]?.postal
        filteredContacts.value[i].physicalAddress =
          authority.value.authorityData.addresses[0]?.addressLine1
        filteredContacts.value[i].physicalAddressLine2 =
          authority.value.authorityData.addresses[0]?.addressLine2
        filteredContacts.value[i].physicalAddressCity =
          authority.value.authorityData.addresses[0]?.city
        filteredContacts.value[i].physicalAddressProvince =
          authority.value.authorityData.addresses[0]?.provinceCode
        filteredContacts.value[i].physicalAddressPostalCode =
          authority.value.authorityData.addresses[0]?.postal
      }
      downloadContacts.value = transformContactForDownload(filteredContacts.value)
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[
        { title: 'Home', href: '/' },
        'Authority',
        authority.value.authorityData?.authorityNumber +
          ' ' +
          authority.value.authorityData?.displayName
      ]"
    ></v-breadcrumbs>
    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-container id="main">
        <DisplayAlert class="mx-4 mx-md-0" />
        <v-row no-gutters justify="space-between" class="pa-4 pa-md-0">
          <v-col cols="11" md="auto">
            <h1 class="mt-3 mb-2">
              <span>
                {{ authority.value.authorityData?.authorityNumber }}
              </span>
              <span class="d-none d-md-inline"> - </span>
              <span class="d-block d-md-inline institute-name">
                {{ authority.value.authorityData?.displayName }}
              </span>
            </h1>
            <v-row v-if="authority.value.authorityData">
              <v-col cols="11" md="auto">
                <p>
                  <strong>Phone:</strong>
                  {{ formatPhoneNumber(authority.value.authorityData?.phoneNumber) }}
                </p>
                <p>
                  <strong>Fax:</strong>
                  {{ formatPhoneNumber(authority.value.authorityData?.faxNumber) }}
                </p>
                <p>
                  <strong>Email: </strong>
                  <a :href="'mailto:' + authority.value.authorityData?.email">{{
                    authority.value.authorityData?.email
                  }}</a>
                </p>
              </v-col>
              <v-col
                cols="11"
                md="auto"
                v-for="item in authority.value.authorityData.addresses"
                :key="item.addressTypeCode"
              >
                <DisplayAddress v-bind="item" />
              </v-col>
              <v-col cols="11" md="4">
                <v-btn
                  variant="text"
                  class="text-none text-subtitle-1 ma-1 v-btn-align-left"
                  @click="downloadAuthorityContacts()"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download
                  Authority Contacts (CSV)</v-btn
                >
                <v-btn
                  variant="text"
                  class="text-none text-subtitle-1 ma-1 v-btn-align-left"
                  @click="downloadAuthoritySchools()"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Download
                  Authority Schools (CSV)</v-btn
                >
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
    <!-- END Authority Info Header Block -->
    <v-sheet class="pa-6">
      <v-tabs v-model="tab">
        <v-tab :value="tabOptions.contacts">
          Authority Contacts
          <v-chip color="bcGovBlue" size="small" class="ml-1" variant="tonal">{{
            authority.value?.authorityData?.contacts.length
          }}</v-chip></v-tab
        >
        <v-tab :value="tabOptions.schools">
          Authority Schools
          <v-chip color="bcGovBlue" size="small" class="ml-1" variant="tonal">{{
            authority.value.authoritySchools?.length
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
              :items="authority.value.authorityData?.contacts"
              :search="contactSearch"
              :sort-by="[{ key: 'authorityContactTypeCode', order: 'asc' }]"
            >
              <template v-slot:item.authorityContactTypeCode="{ item }">
                {{ appStore.getAuthorityContactTypeCodeLabel(item.authorityContactTypeCode) }}
              </template>

              <template v-slot:item.email="{ item }">
                <a :href="`mailto:${item.email}`">{{ item.email }}</a>
              </template>

              <template v-slot:item.phoneNumber="{ item }">
                {{ formatPhoneNumber(item.phoneNumber) }}
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
              :items="authority.value.authoritySchools"
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
                {{ formatPhoneNumber(item.phoneNumber) }}
              </template>

              <template v-slot:item.faxNumber="{ item }">
                {{ formatPhoneNumber(item.faxNumber) }}
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-sheet>
  </div>
</template>
