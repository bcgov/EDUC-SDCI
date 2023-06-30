<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const districts = appStore.getDistricts
const selectedDistrict = ref({}) // placeholder
</script>

<template>
  <div>
    <select v-model="selectedDistrict">
      <!-- inline object literal -->
      <option
        v-for="district in districts"
        :key="district.districtId"
        :value="district.districtNumber"
      >
        {{ `${district.districtNumber} - ${district.displayName}` }}
      </option>
    </select>

    {{ selectedDistrict }}
  </div>
</template>
