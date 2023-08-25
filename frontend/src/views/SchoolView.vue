<template>
  <div>
    <h1>District XXX - District name <br /></h1>
    <v-card width="100%" v-if="schoolData.value">
      <v-card-item>
        <v-card-title v-if="schoolData.value.displayName">
          {{ schoolData.value.displayName }} - {{ schoolData.value.mincode }}</v-card-title
        >
        <v-card-subtitle>
          <!-- School Address -->
          <div v-if="schoolData.value.addresses > 0">
            {{ schoolData.value.addresses[0].addressLine1 }}<br />
            <span v-if="schoolData.value.addresses[0].addressLine2"
              >{{ schoolData.value.addresses[0].addressLine2 }}<br
            /></span>
            {{ schoolData.value.addresses[0].city }},
            {{ schoolData.value.addresses[0].provinceCode }},
            {{ schoolData.value.addresses[0].postal }}
          </div>
          <br />
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
import { reactive, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import InstituteService from '@/Services/InstituteService'
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
const schoolData = reactive({ value: {} })
const filteredContacts = ref([])
const headers = [
  { title: 'Contact', key: 'jobTitle' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Phone', key: 'phoneNumber' },
  { title: 'Extension', key: 'phoneExtension' },
  { title: 'Fax', key: 'faxNumber' },
  { title: 'Email', key: 'email' }
]
onMounted(async () => {
  const route = useRoute()
  const selectedSchoolId = route.params.schoolId
  try {
    const response = await InstituteService.getSchool(selectedSchoolId)
    schoolData.value = response.data
    if (response.data) {
      if (response.data.contacts.length > 0) {
        filteredContacts.value = response.data.contacts
        filteredContacts.value[0].phoneNumber = response.data.phoneNumber
        filteredContacts.value[0].phoneExtension = response.data.phoneExtension
        filteredContacts.value[0].email = response.data.email
        filteredContacts.value[0].faxNumber = response.data.faxNumber
        console.log(filteredContacts.value)
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
