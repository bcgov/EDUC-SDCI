<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import router from '@/router'
import { useSanitizeURL } from '@'

const appStore = useAppStore()
const { districts } = storeToRefs(appStore)
console.log(appStore.districtNumberNameOnly)

const selectedDistrict = ref('') // placeholder
function goToDistrict() {
  //console.log(selectedDistrict.value.districtId)
  router.push({
    name: 'district',
    params: {
      districtNumber: String(selectedDistrict.value?.districtNumber),
      displayName: String(selectedDistrict.value?.displayName).toLowerCase()
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
          :items="appStore.districtNumberNameOnly"
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
