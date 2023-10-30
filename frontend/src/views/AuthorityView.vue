<script setup lang="ts">
import InstituteService from '@/services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import { formatPhoneNumber } from '@/utils/common'
import * as jsonexport from 'jsonexport/dist'
import type { Authority, School, Address } from '@/types/types.d.ts'

// import common components
import DisplayAddress from '@/components/common/DisplayAddress.vue'

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
  { title: 'Name', key: 'firstName' },
  { title: 'Title/Roll', key: 'jobTitle' },
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
    authorityNumber: item.authorityNumber,
    displayName: item.displayName,
    authorityContactTypeCode: item.authorityContactTypeCode,
    firstName: item.firstName,
    lastName: item.lastName,
    email: item.email,
    phoneNumber: item.phoneNumber,
    phoneExtension: item.phoneExtension,
    alternatePhoneNumber: item.alternatePhoneNumber,
    alternatePhoneExtension: item.alternatePhoneExtension,
    mailingAddress: item.mailingAddress,
    mailingAddressCity: item.mailingAddressCity,
    mailingAddressLine2: item.mailingAddressLine2,
    mailingAddressPostalCode: item.mailingAddressPostalCode,
    mailingAddressProvince: item.mailingAddressProvince,
    physicalAddress: item.physicalAddress,
    physicalAddressCity: item.physicalAddressCity,
    physicalAddressLine2: item.physicalAddressLine2,
    physicalAddressPostalCode: item.physicalAddressPostalCode,
    physicalAddressProvince: item.physicalAddressProvince
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
        authorityNumber: authority.value?.authorityData?.authorityNumber,
        displayName: item.displayName,
        mincode: item.mincode,
        facilityTypeCode: item.facilityTypeCode,
        contactJobTitle: item.contacts?.jobTitle,
        contactFirstName: item.contacts?.firstName,
        contactLastName: item.contacts?.lastName,
        contactPhoneExtension: item.contacts?.phoneExtension,
        contactPhoneNumber: item.contacts?.phoneNumber,
        schoolEmail: item.email,
        mailingAddress: item.mailingAddress?.addressLine1,
        mailingAddressLine2: item.mailingAddress?.addressLine2,
        mailingAddressCity: item.mailingAddress?.city,
        mailingAddressProvince: item.mailingAddress?.provinceCode,
        mailingAddressPostalCode: item.mailingAddress?.postal,
        physicalAddress: item.physicalAddress?.addressLine1,
        physicalAddressLine2: item.physicalAddress?.addressLine2,
        physicalAddressCity: item.physicalAddress?.city,
        physicalAddressProvince: item.physicalAddress?.provinceCode,
        physicalAddressPostalCode: item.physicalAddress?.postal,
        districtPhoneNumber: item.phoneNumber,
        districtFax: item.faxNumber,
        districtWebsite: item.website,
        schoolCategoryCode: item.schoolCategoryCode,
        schoolOrganizationCode: item.schoolOrganizationCode,
        schoolReportingRequirementCode: item.schoolReportingRequirementCode
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
      <v-row no-gutters justify="space-between">
        <v-spacer />
        <v-col cols="6">
          <h2 class="mt-3 mb-2">
            {{ authority.value.authorityData?.authorityNumber }} -
            {{ authority.value.authorityData?.displayName }}
          </h2>
          <v-row v-if="authority.value.authorityData">
            <v-col>
              <p>
                <strong>Phone:</strong>
                {{ formatPhoneNumber(authority.value.authorityData?.phoneNumber) }}
              </p>
              <p>
                <strong>Fax:</strong>
                {{ formatPhoneNumber(authority.value.authorityData?.faxNumber) }}
              </p>
              <p><strong>Email:</strong> {{ authority.value.authorityData?.email }}</p>
            </v-col>
            <v-col
              v-for="item in authority.value.authorityData.addresses"
              :key="item.addressTypeCode"
            >
              <DisplayAddress v-bind="item" />
            </v-col>
            <v-col>
              <v-btn
                block
                class="text-none text-subtitle-1 ma-1"
                @click="downloadAuthorityContacts()"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Authority
                Contacts</v-btn
              >
              <v-btn
                block
                class="text-none text-subtitle-1 ma-1"
                @click="downloadAuthoritySchools()"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Authority
                Schools</v-btn
              >
            </v-col>
          </v-row>
        </v-col>
        <v-spacer />
      </v-row>
    </v-sheet>
    <!-- END Authority Info Header Block -->
    <v-sheet class="pa-6">
      <v-tabs v-model="tab">
        <v-tab :value="tabOptions.contacts"> Authority Contacts </v-tab>
        <v-tab :value="tabOptions.schools">
          Authority Schools ({{ authority.value.authoritySchools?.length }} )
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
            >
              <template v-slot:item.firstName="{ item }">
                {{ item.columns.firstName }} {{ item.columns.lastName }}
              </template>

              <template v-slot:item.email="{ item }">
                <a :href="`mailto:${item.columns.email}`">{{ item.columns.email }}</a>
              </template>

              <template v-slot:item.districtContactTypeCode="{ item }">
                {{ appStore.getDistrictContactTypeCodeLabel(item.columns.districtContactTypeCode) }}
              </template>

              <template v-slot:item.phoneNumber="{ item }">
                {{ formatPhoneNumber(item.columns.phoneNumber) }}
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
            >
              <template v-slot:item.schoolCategoryCode="{ item }">
                {{ appStore.getCategoryCodeLabel(item.columns.schoolCategoryCode) }}
              </template>

              <template v-slot:item.facilityTypeCode="{ item }">
                {{ appStore.getFacilityCodeLabel(item.columns.facilityTypeCode) }}
              </template>

              <template v-slot:item.email="{ item }">
                <a :href="`mailto:${item.columns.email}`">{{ item.columns.email }}</a>
              </template>

              <template v-slot:item.website="{ item }">
                <a :href="item.columns.website">{{ item.columns.website }}</a>
              </template>

              <template v-slot:item.phoneNumber="{ item }">
                {{ formatPhoneNumber(item.columns.phoneNumber) }}
              </template>

              <template v-slot:item.faxNumber="{ item }">
                {{ formatPhoneNumber(item.columns.faxNumber) }}
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-sheet>
  </div>
</template>
