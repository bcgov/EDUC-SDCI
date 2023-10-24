<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import InstituteService from '@/services/InstituteService'
import { useAppStore } from '@/stores/app'
import type { School, Grade } from '@/types/types.d.ts'
import * as jsonexport from 'jsonexport/dist'
import {
  distNumberFromMincode,
  formatPhoneNumber,
  transformContactForDownload
} from '@/utils/common'
import DisplayAddress from '@/components/common/DisplayAddress.vue'
import { useSanitizeURL } from '@/composables/string'
const appStore = useAppStore()

// props
const districtInfo = reactive<any>({ value: {} })
const downloadContacts = ref<any>([])
const filteredContacts = ref<any>([])
const filteredAddresses = reactive<any>({ value: {} })
const headers = [
  { title: 'Contact', key: 'jobTitle' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Extension', key: 'phoneExtension' },
  { title: 'Fax', key: 'faxNumber' },
  { title: 'Email', key: 'email' }
]
const schoolData = reactive({ value: {} as School })

// functions
const downloadCSV = () => {
  jsonexport(downloadContacts.value, function (err: any, csv: any) {
    if (err) return console.error(err)
    appStore.exportCSV(csv)
  })
}

// loading component
onBeforeMount(async () => {
  const route = useRoute()
  const selectedSchoolId: string | string[] = route.params.schoolId
  try {
    const response = await InstituteService.getSchool(selectedSchoolId as string)
    schoolData.value = response.data
    console.log(schoolData.value)

    //add the missing labels
    const filteredGrades = appStore.compareSchoolGrades(
      appStore.getGradeByGradeCodes,
      schoolData.value.grades
    )
    //extract only the labels
    const filteredGradesLabels = appStore.extractGradeLabels(filteredGrades)
    //setting district name and number
    if (schoolData.value.districtId) {
      districtInfo.value = appStore.getDistrictByDistrictId(String(schoolData.value.districtId))
    }
    //setting school address
    if (response.data) {
      if (response.data.addresses.length > 0) {
        filteredAddresses.value = response.data.addresses[0]
      }
    }
    //setting school contacts
    if (response.data) {
      if (response.data.contacts.length > 0) {
        filteredContacts.value = response.data.contacts
        filteredContacts.value[0].districtNumber = distNumberFromMincode(response.data.mincode)
        filteredContacts.value[0].displayName = response.data.displayName
        filteredContacts.value[0].schoolCategoryCode = response.data.schoolCategoryCode
        filteredContacts.value[0].facilityTypeCode = response.data.facilityTypeCode
        filteredContacts.value[0].mincode = response.data.mincode
        filteredContacts.value[0].phoneNumber = response.data.phoneNumber
        filteredContacts.value[0].phoneExtension = response.data.phoneExtension
        filteredContacts.value[0].email = response.data.email
        filteredContacts.value[0].faxNumber = response.data.faxNumber
        filteredContacts.value[0].addressLine1 = response.data.addresses[0].addressLine1
        filteredContacts.value[0].addressLine2 = response.data.addresses[0].addressLine2
        filteredContacts.value[0].city = response.data.addresses[0].city
        filteredContacts.value[0].provinceCode = response.data.addresses[0].provinceCode
        filteredContacts.value[0].countryCode = response.data.addresses[0].countryCode
        filteredContacts.value[0].postal = response.data.addresses[0].postal
        filteredContacts.value[0].grades = filteredGradesLabels
        downloadContacts.value = transformContactForDownload(filteredContacts.value)
      }
    }
  } catch (error) {
    console.error(error)
  }
})

function goToDistrict() {
  router.push({
    name: 'district',
    params: {
      districtNumber: useSanitizeURL(String(districtInfo.value?.districtNumber)),
      displayName: useSanitizeURL(String(districtInfo.value?.displayName))
    }
  })
}
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[{ title: 'Home', href: '/' }, 'School', schoolData.value.displayName]"
    ></v-breadcrumbs>

    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-spacer />
        <v-col cols="6">
          <v-row v-if="schoolData.value" no-gutters justify="space-between">
            <v-col>
              <v-row>
                <h1 class="mt-3 mb-2">
                  {{ schoolData.value.displayName }} - {{ schoolData.value.mincode }}
                </h1>
              </v-row>
              <v-row>
                <a
                  :href="`/district/${useSanitizeURL(
                    String(districtInfo.value?.districtNumber)
                  )}-${useSanitizeURL(String(districtInfo.value?.displayName))}`"
                >
                  District {{ districtInfo.value.districtNumber }} -
                  {{ districtInfo.value.displayName }}
                </a>
              </v-row>
              <v-row>
                <v-col class="pl-0">
                  <p>
                    <strong>Phone:</strong> {{ formatPhoneNumber(schoolData.value.phoneNumber) }}
                  </p>
                  <p><strong>Fax:</strong> {{ formatPhoneNumber(schoolData.value.faxNumber) }}</p>
                  <p>
                    <strong>Email: </strong>
                    <a :href="'mailto:' + schoolData.value?.email">
                      {{ schoolData.value.email }}
                    </a>
                  </p>
                </v-col>
                <v-col v-for="item in schoolData.value.addresses" :key="item.addressTypeCode">
                  <DisplayAddress v-bind="item" />
                </v-col>
                <v-col
                  ><v-btn
                    block
                    class="text-none text-subtitle-1 ma-1"
                    @click="downloadCSV"
                    :disabled="!schoolData.value"
                    ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>School
                    Info</v-btn
                  ></v-col
                >
              </v-row>
            </v-col>
          </v-row>
        </v-col>
        <v-spacer />
      </v-row>
    </v-sheet>
    <v-card class="fill-screen-height" width="100%" v-if="schoolData.value">
      <!-- DISPLAY GRADES -->
      <!-- <v-chip
        label
        v-for="schoolGrade in schoolData.value.grades"
        :key="schoolGrade.schoolGradeCode"
      >
        {{
          appStore.getGradeByGradeCodes
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .find((grade) => schoolGrade.schoolGradeCode == grade.schoolGradeCode)?.label
        }}
      </v-chip> -->

      <!-- <v-card-item>
        <v-card-title v-if="schoolData.value.displayName">
          {{ schoolData.value.displayName }} - {{ schoolData.value.mincode }}</v-card-title
        >
        District: {{ districtInfo.value.districtNumber }} - {{ districtInfo.value.displayName }}

        <v-card-subtitle> -->
      <!-- School type info. -->
      <!-- <span v-if="schoolData.value.facilityTypeCode"
            >{{ schoolData.value.facilityTypeCode }} SCHOOL<br
          /></span>
          <div v-if="schoolData.value.grades">
            Grades:
            <span v-for="item in schoolData.value.grades" :key="item.schoolGradeCode"
              >{{ item.schoolGradeCode }},</span
            >
          </div>
          <br />
          <span v-if="schoolData.value.schoolCategoryCode"
            >{{ schoolData.value.schoolCategoryCode }} SCHOOL</span
          >
        </v-card-subtitle>
      </v-card-item> -->
      <h2>School Contacts</h2>
      <v-card-text>
        <v-data-table-virtual
          :headers="headers"
          :items="filteredContacts"
          class="elevation-1"
          item-value="name"
        ></v-data-table-virtual>
      </v-card-text>

      <h2>Grades</h2>
      <div label v-for="grade in appStore.getGradeByGradeCodes" :key="grade.schoolGradeCode">
        {{
          schoolData.value.grades.find(
            (schoolGrade: Grade) => schoolGrade.schoolGradeCode == grade.schoolGradeCode
          )
            ? grade.label
            : undefined
        }}
      </div>
    </v-card>
    <pre>{{ schoolData.value }}</pre>
  </div>
</template>
