<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import { reactive, onBeforeMount, ref } from 'vue'
import DisplayAddress from '@/components/common/DisplayAddress.vue'
const appStore = useAppStore()
const { offshoreSchools } = storeToRefs(appStore)
const schoolSearch = ref('')
const schoolHeaders = [
  { title: 'School Code', key: 'mincode' },
  { title: 'Name', key: 'displayName' },
  { title: 'Address', key: 'addresses' },
  { title: 'Contact', key: 'contact' }
]
const headers = ref([
  {
    text: 'Name',
    value: 'schoolDisplayName'
  }
  // Add more header objects for additional columns
])
</script>

<template>
  <div>
    <v-breadcrumbs
      class="breadcrumbs"
      bg-color="white"
      :items="[{ title: 'Home', href: '/' }, 'Offshore Schools']"
    ></v-breadcrumbs>
    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-spacer />
        <v-col cols="6">
          <h2 class="mt-3 mb-2">Offshore Schools</h2>
          <v-row>
            <v-spacer />
            <v-col
              ><v-btn block class="text-none text-subtitle-1 ma-1"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Offshore School
                Representatives</v-btn
              >
              <v-btn block class="text-none text-subtitle-1 ma-1"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Offshore
                Schools</v-btn
              ></v-col
            >
          </v-row>
        </v-col>
        <v-spacer />
      </v-row>
    </v-sheet>

    <v-container>
      <v-text-field
        v-model="schoolSearch"
        append-icon="mdi-magnify"
        label="Filter Offshore School"
        single-line
        hide-details
      ></v-text-field>
      <v-data-table
        :headers="schoolHeaders"
        :hide-default-footer="true"
        items-per-page="50"
        :items="offshoreSchools"
        :search="schoolSearch"
      >
        <template v-slot:item.displayName="{ item }">
          <a :href="`/school/${item.schoolId}`"> {{ item.displayName }} </a>
        </template>

        <template v-slot:item.addresses="{ item }">
          <div v-for="address in item.addresses">
            <DisplayAddress v-bind="address" />
          </div>
        </template>
        <template v-slot:item.contact="{ item }">
          <strong>Phone:</strong> {{ item.phoneNumber }} <br />
          <strong>Fax:</strong> {{ item.faxNumber }} <br />
          <strong>Email:</strong> {{ item.email }}
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<style></style>

<style>
/* sizes header to align with content on desktop */
.v-toolbar__content,
.v-toolbar__extension {
  max-width: 1280px;
  padding: 0 2rem;
}
</style>
