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
    {{ selectedDistrict }}
    <v-row no-gutters>
      <v-col>
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
      <v-col> </v-col>
    </v-row>
  </v-container>
</template>
