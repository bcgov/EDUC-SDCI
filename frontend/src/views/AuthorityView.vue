<script setup lang="ts">
import InstituteService from '@/services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import { formatPhoneNumber } from '@/utils/common'

import type { Authority } from '@/types/types.d.ts'

// import common components
import DisplayAddress from '@/components/common/DisplayAddress.vue'

const appStore = useAppStore()
const authorityId = ref<any>(null) // Initialize with null initially

const authority = reactive({ value: {} as Authority }) // cast to Authority type
const filteredContacts = ref<any>([])
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

onMounted(async () => {
  const route = useRoute()
  authorityId.value = appStore.getAuthorityByAuthorityNumber(
    String(route.params.authorityNumber)
  )?.independentAuthorityId

  try {
    const response = await InstituteService.getAuthority(authorityId.value)
    authority.value = response.data
    // console.log(authority.value)
    filteredContacts.value = {
      authorityNumber: authority.value?.authorityData?.authorityNumber,
      authorityTypeCode: authority.value?.authorityData?.authorityTypeCode,
      displayName: authority.value?.authorityData?.displayName,
      addressLine1: authority.value?.authorityData?.addresses[0]?.addressLine1,
      addressLine2: authority.value?.authorityData?.addresses[0]?.addressLine2,
      city: authority.value?.authorityData?.addresses[0]?.city,
      postal: authority.value?.authorityData?.addresses[0]?.postal,
      addressTypeCode: authority.value?.authorityData?.addresses[0]?.addressTypeCode,
      provinceCode: authority.value?.authorityData?.addresses[0]?.provinceCode,
      countryCode: authority.value?.authorityData?.addresses[0]?.countryCode,
      firstName: authority.value?.authorityData?.contacts[0]?.firstName,
      lastName: authority.value?.authorityData?.contacts[0]?.lastName,
      email: authority.value?.authorityData?.email,
      faxNumber: authority.value?.authorityData?.faxNumber,
      phoneNumber: authority.value?.authorityData?.phoneNumber,
      openedDate: authority.value?.authorityData?.openedDate,
      closedDate: authority.value?.authorityData?.closedDate
    }
    console.log(filteredContacts.value)
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
          <h1 class="mt-3 mb-2">
            {{ authority.value.authorityData?.authorityNumber }} -
            {{ authority.value.authorityData?.displayName }}
          </h1>
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
              <p>
                <strong>Email: </strong>
                <a :href="'mailto:' + authority.value.authorityData?.email">{{
                  authority.value.authorityData?.email
                }}</a>
              </p>
            </v-col>
            <v-col
              v-for="item in authority.value.authorityData.addresses"
              :key="item.addressTypeCode"
            >
              <DisplayAddress v-bind="item" />
            </v-col>
            <v-col>
              <v-btn block class="text-none text-subtitle-1 ma-1"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Authority
                Contacts</v-btn
              >
              <!-- <v-btn block class="text-none text-subtitle-1 ma-1"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Authority
                Schools</v-btn
              > -->
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
