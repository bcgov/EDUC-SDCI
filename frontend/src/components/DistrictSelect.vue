<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import router from '@/router'

const appStore = useAppStore()
const { districts } = storeToRefs(appStore)

const selectedDistrict = ref({}) // placeholder
function goToDistrict() {
  //console.log(selectedDistrict.value.districtId)
  router.push({
    name: 'district',
    params: {
      // districtNumber: String(selectedDistrict.value?.districtNumber),
      districtId: String(selectedDistrict.value?.districtId)
    }
  })
}
</script>

<template>
  <div>
    <!-- {{ districts }} -->
    <!-- <v-autocomplete
      v-model="selectedDistrict"
      label="Select a District"
      :items="districts"
      item-title="displayName"
      item-value="districtId"
      @update:modelValue="goToDistrict"
    >
      <template v-slot:selection="{ props, item }"
        ><v-list-item
          v-bind="props"
          :title="`${item?.raw?.districtNumber} - ${item?.raw?.displayName}`"
        ></v-list-item
      ></template>
      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :title="`${item?.raw?.districtNumber} - ${item?.raw?.displayName}`"
        ></v-list-item>
      </template>
    </v-autocomplete> -->
    <v-autocomplete
      v-model="selectedDistrict"
      label="Select a District"
      :items="districts"
      :item-title="(item) => (item ? item.districtNumber + ' - ' + item.displayName : '')"
      :item-value="(item) => item"
      @update:modelValue="goToDistrict"
    ></v-autocomplete>
  </div>
</template>
