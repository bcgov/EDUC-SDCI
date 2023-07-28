<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { useSanitizeURL } from '@/composables/string'

const appStore = useAppStore()

const selectedDistrict = ref('') // placeholder
function goToDistrict() {
  //console.log(selectedDistrict.value.districtId)
  router.push({
    name: 'district',
    params: {
      districtNumber: useSanitizeURL(String(selectedDistrict.value?.districtNumber)),
      displayName: useSanitizeURL(String(selectedDistrict.value?.displayName))
      //districtId: String(selectedDistrict.value?.districtId)
    }
  })
}
</script>

<template>
  <v-container fluid>
    <h2>District Information</h2>
    <v-row no-gutters justify="space-between">
      <v-col class="mr-6">
        <v-autocomplete
          v-model="selectedDistrict"
          label="Select a District"
          :items="appStore.getDistrictList"
          :item-title="(item) => (item ? item.districtNumber + ' - ' + item.displayName : '')"
          :item-value="(item) => item"
        ></v-autocomplete>
        <v-btn class="text-none text-subtitle-1" variant="flat" @click="goToDistrict"
          >View District Info</v-btn
        >
      </v-col>
      <v-col class="ml-6">
        <v-btn class="text-none text-subtitle-1 ma-1" variant="flat"
          ><template v-slot:prepend> <v-icon icon="mdi-download" /></template> Mailing for All
          Districts</v-btn
        >
        <v-btn class="text-none text-subtitle-1 ma-1" variant="flat"
          ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Contacts for All
          Districts</v-btn
        >
        <v-btn class="text-none text-subtitle-1 ma-1" variant="flat"
          ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Contacts by
          Type</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>
