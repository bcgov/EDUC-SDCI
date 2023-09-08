<template>
  <div>
    <h1>{{ districtInfo.value.districtNumber }} - {{ districtInfo.value.displayName }} <br /></h1>
    <v-card width="100%" v-if="schoolData.value">
      <v-card-item>
        <v-card-title v-if="schoolData.value.displayName">
          {{ schoolData.value.displayName }} - {{ schoolData.value.mincode }}</v-card-title
        >
        <v-card-subtitle>
          <!-- School Address -->
          <div v-if="filteredAddresses.value != 'N/A'">
            <span v-if="filteredAddresses.value.addressLine1"
              >{{ filteredAddresses.value.addressLine1 }}<br
            /></span>
            <span v-if="filteredAddresses.value.addressLine2"
              >{{ filteredAddresses.value.addressLine2 }}<br
            /></span>
            <span v-if="filteredAddresses.value.city">{{ filteredAddresses.value.city }}</span
            >,
            <span v-if="filteredAddresses.value.provinceCode"
              >{{ filteredAddresses.value.provinceCode }},</span
            >
            <span v-if="filteredAddresses.value.postal">{{ filteredAddresses.value.postal }}</span>
          </div>
          <!-- School type info. -->
          <span v-if="schoolData.value.facilityTypeCode"
            >{{ schoolData.value.facilityTypeCode }} SCHOOL<br
          /></span>
          <div v-if="schoolData.value.grades">
            Grades: <span v-for="item in schoolData.value.grades" :key="item.id">{{ item }},</span>
          </div>
          <br />
          <span v-if="schoolData.value.schoolCategoryCode"
            >{{ schoolData.value.schoolCategoryCode }} SCHOOL</span
          >
        </v-card-subtitle>
      </v-card-item>
      <v-card-text>
        <v-data-table-virtual
          :headers="headers"
          :items="filteredContacts"
          class="elevation-1"
          item-value="name"
        ></v-data-table-virtual>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { reactive, onMounted, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import InstituteService from '@/services/InstituteService'
import { useAppStore } from '@/stores/app'
//import type { School } from '@/types/types.d.ts'
const appStore = useAppStore()
const schoolData = reactive<any>({ value: {} })
const filteredContacts = ref<any>([])
const filteredAddresses = reactive<any>({ value: {} })
const districtInfo = reactive<any>({ value: {} })
const grades = reactive<any>([])
const headers = [
  { title: 'Contact', key: 'jobTitle' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Extension', key: 'phoneExtension' },
  { title: 'Fax', key: 'faxNumber' },
  { title: 'Email', key: 'email' }
]
onBeforeMount(async () => {
  const route = useRoute()
  const selectedSchoolId: string | string[] = route.params.schoolId
  try {
    const response = await InstituteService.getSchool(selectedSchoolId as string)
    schoolData.value = response.data
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
        filteredContacts.value[0].phoneNumber = response.data.phoneNumber
        filteredContacts.value[0].phoneExtension = response.data.phoneExtension
        filteredContacts.value[0].email = response.data.email
        filteredContacts.value[0].faxNumber = response.data.faxNumber
      }
    }
    // Formats the grades
    if (response.data) {
      if (response.data.grades.length > 0) {
        grades.value = appStore.getGradeByGradeCodes
        for (const obj1 of appStore.getGradeByGradeCodes) {
          const index = schoolData.value.grades.findIndex(
            (obj2: any) => obj2.schoolGradeCode === obj1.schoolGradeCode
          )
          if (index !== -1) {
            schoolData.value.grades[index] = obj1.label
          }
        }
      } else {
        schoolData.value.grades = '- N/A'
      }
    }
  } catch (error) {
    console.error(error)
  }
})
</script>
<style></style>
