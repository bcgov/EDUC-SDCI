<script setup lang="ts">
import InstituteService from '@/services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import router from '@/router'
import { formatPhoneNumber, transformContactForDownload } from '@/utils/common'
import type { District, School, Grade, Address, Contact } from '@/types/types.d.ts'
import * as jsonexport from 'jsonexport/dist'
import { useSanitizeURL } from '@/composables/string'
// import common components
import DisplayAddress from '@/components/common/DisplayAddress.vue'
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
  { title: 'Contact Type', key: 'districtContactTypeCode' },
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
// functions
function goToSchool(displayName, mincode, id) {
  console.log(displayName)
  console.log(mincode)
  console.log(id)
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
  districtId.value =
    appStore.getDistrictByDistrictNumber(String(route.params.districtNumber))?.districtId ?? null
  // get district data
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
          districtNumber: response.data.districtData.districtNumber,
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
      filteredContacts.value = contacts.value.map((item: any) => {
        return {
          districtNumber: response.data.districtData?.districtNumber,
          displayName: response.data.districtData?.displayName,
          jobTitle: item.jobTitle,
          firstName: item.firstName,
          lastName: item.lastName,
          phoneNumber: item.phoneNumber,
          phoneExtension: item.phoneExtension,
          alternatePhoneNumber: item.alternatePhoneNumber,
          alternatePhoneExtension: item.alternatePhoneExtension,
          email: item.email,
          mailingAddress: response.data.districtData?.addresses[0].addressLine1,
          mailingCity: response.data.districtData?.addresses[0].city,
          mailingProvince: response.data.districtData?.addresses[0].provinceCode,
          mailingPostalCode: response.data.districtData?.addresses[0].postal,
          districtPhone: response.data.districtData?.phoneNumber,
          districtFax: response.data.districtData?.faxNumber,
          website: response.data.districtData?.website
        }
      })
    }
  } catch (error) {
    console.error(error)
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
    <v-spacer />
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
      <v-row no-gutters justify="space-between">
        <!-- <v-spacer />
        <v-col cols="6"> -->
        <v-row v-if="district.value.districtData" no-gutters justify="space-between">
          <v-col>
            <h1 class="mt-3 mb-2">
              {{ district.value.districtData?.districtNumber }} -
              {{ district.value.districtData?.displayName }}
            </h1>
            <p>
              <strong>Phone:</strong>
              {{ formatPhoneNumber(district.value.districtData?.phoneNumber) }}
            </p>
            <p>
              <strong>Fax:</strong>
              {{ formatPhoneNumber(district.value.districtData?.faxNumber) }}
            </p>
            <p><strong>Email:</strong> {{ district.value.districtData?.email }}</p>
            <p>
              <a :href="district.value.districtData?.website">{{
                district.value.districtData?.website
              }}</a>
            </p>
          </v-col>

          <v-col v-for="item in district.value.districtData.addresses" :key="item.addressTypeCode">
            <h1>&nbsp;</h1>
            <DisplayAddress v-bind="item" />
          </v-col>

          <v-col>
            <h1>&nbsp;</h1>
            <v-btn block class="text-none text-subtitle-1 ma-1" @click="downloadDistrictContacts"
              ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>District
              Contacts</v-btn
            >
            <v-btn block class="text-none text-subtitle-1 ma-1" @click="downloadDistrictSchools"
              ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>District
              Schools</v-btn
            >
          </v-col>
        </v-row>
        <!-- </v-col>
        <v-spacer /> -->
      </v-row>
    </v-sheet>
    <!-- END DISTRICT HEADER INFO -->

    <v-sheet class="pa-6">
      <v-tabs v-model="tab">
        <v-tab :value="tabOptions.contacts"> District Contacts </v-tab>
        <v-tab :value="tabOptions.schools">
          District Schools ({{ district.value.districtData?.contacts.length }})
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
            >
              <template v-slot:item.firstName="{ item }">
                {{ item.firstName }} {{ item.lastName }}
              </template>

              <template v-slot:item.email="{ item }">
                <a :href="`mailto:${item.email}`">{{ item.email }}</a>
              </template>

              <template v-slot:item.districtContactTypeCode="{ item }">
                {{ appStore.getDistrictContactTypeCodeLabel(item.districtContactTypeCode) }}
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
              :items="district.value.districtSchools"
              :search="schoolSearch"
            >
              <template v-slot:item.displayName="{ item }">
                <a
                  @click="
                    goToSchool(item.columns.displayName, item.columns.mincode, item.raw.schoolId)
                  "
                  >{{ item.columns.displayName }} {{ item.columns.schoolId }}</a
                >
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
