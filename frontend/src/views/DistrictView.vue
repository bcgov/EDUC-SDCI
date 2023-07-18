<script setup lang="ts">
import InstituteService from '@/Services/InstituteService'
import { ref, onBeforeMount } from 'vue'

const district = ref({})
const props = defineProps({
  districtId: String
  // districtNumber: String
  // displayName: String
})

console.log(props.districtId)
InstituteService.getDistrict(String(props.districtId))
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
