<template>
  <div class="about">
    <h1>Districts</h1>
    <p>App.vue on start up accesses the institute api and store the response using pinia.
    ListDistricts.vue uses the stored response from pinia store</p>
    <p style="float:left; height: 200px; width:300px overflow: scroll">
      <ul>
        <li v-for="district in districts" :key="district.districtId">{{ district.displayName }}</li>
      </ul>
      <button @click="handleButtonClick">Export to CSV</button>
    </p>
  </div>
</template>
<script>

import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

export default {
  setup() {
    const appStore = useAppStore()
    const { districts } = storeToRefs(appStore);

    function handleButtonClick() {
      const test = appStore.convertToCSV(appStore.getDistrictList)
      appStore.exportCSV(test)
      console.log('Button clicked!');
    }
    return {
      districts,
      handleButtonClick
    }
  }
}
</script>
<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
