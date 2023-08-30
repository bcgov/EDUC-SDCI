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
          <span v-if="schoolData.value.grades">Grades {{ schoolData.value.grades }}</span
          ><br />
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
<script setup>
import { reactive, onMounted, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import InstituteService from '@/Services/InstituteService'
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
const schoolData = reactive({ value: {} })
const filteredContacts = ref([])
const filteredAddresses = reactive({ value: {} })
const districtInfo = reactive({ value: {} })
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
  const selectedSchoolId = route.params.schoolId
  try {
    const response = await InstituteService.getSchool(selectedSchoolId)
    schoolData.value = response.data
    if (schoolData.value.districtId) {
      districtInfo.value = appStore.getDistrictByDistrictId(String(schoolData.value.districtId))
    }
    if (response.data) {
      if (response.data.addresses.length > 0) {
        filteredAddresses.value = response.data.addresses[0]
      }
    }
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
    if (schoolData.value) {
      if (schoolData.value.grades.length > 0) {
        schoolData.value.grades = appStore.extractGradeCodes(schoolData.value.grades)
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
