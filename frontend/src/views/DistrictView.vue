<script setup lang="ts">
import InstituteService from '@/Services/InstituteService'
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const route = useRoute()
const appStore = useAppStore()
const district = ref({})
const districtId = computed(
  () => appStore.getDistrictByDistrictNumber(String(route.params.districtNumber))?.districtId
)

console.log(districtId.value)
InstituteService.getDistrict(districtId.value)
  .then((response) => {
    district.value = response.data
  })
  .catch((error) => {
    console.error(error)
  })

// onBeforeMount(() => {
//   district = InstituteService.getDistrict(route.params.districtId)
// })
</script>

<template>
  <div>
    Hello World, I'm DistrictView.vue!
    <pre>
    {{ district }}
    </pre>
  </div>
</template>
