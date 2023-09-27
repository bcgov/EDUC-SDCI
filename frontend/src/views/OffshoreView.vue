<script setup lang="ts">
import { reactive, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import InstituteService from '@/services/InstituteService'
import { useAppStore } from '@/stores/app'
import type { School } from '@/types/types.d.ts'
const appStore = useAppStore()
const offshoreSchoolData = reactive({ value: {} as School })
const filteredContacts = ref<any>([])
const filteredAddresses = reactive<any>({ value: {} })
const districtInfo = reactive<any>({ value: {} })
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
  const selectedoffshoreId: string | string[] = route.params.offshoreId
  try {
    const response = await InstituteService.getSchool(selectedoffshoreId as string)
    offshoreSchoolData.value = response.data
    //setting district name and number
    if (offshoreSchoolData.value.districtId) {
      districtInfo.value = appStore.getDistrictByDistrictId(
        String(offshoreSchoolData.value.districtId)
      )
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
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div>
    <v-card width="100%" v-if="offshoreSchoolData.value">
      <v-card-item>
        <v-card-title v-if="offshoreSchoolData.value.displayName">
          {{ offshoreSchoolData.value.displayName }} -
          {{ offshoreSchoolData.value.mincode }}</v-card-title
        >
        District: {{ districtInfo.value.districtNumber }} - {{ districtInfo.value.displayName }}

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
          <span v-if="offshoreSchoolData.value.facilityTypeCode"
            >{{ offshoreSchoolData.value.facilityTypeCode }} SCHOOL<br
          /></span>
          <div v-if="offshoreSchoolData.value.grades">
            Grades:
            <span v-for="item in offshoreSchoolData.value.grades" :key="item.schoolGradeCode"
              >{{ item.schoolGradeCode }},</span
            >
          </div>
          <br />
          <span v-if="offshoreSchoolData.value.schoolCategoryCode"
            >{{ offshoreSchoolData.value.schoolCategoryCode }} SCHOOL</span
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
