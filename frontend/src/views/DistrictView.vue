<script setup lang="ts">
import InstituteService from '@/Services/InstituteService'
import { ref, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(route.params.districtId)
const district = ref({})

InstituteService.getDistrict(String(route.params.districtId))
  .then((response) => {
    district.value = response.data
  })
  .catch((error) => {
    console.error(error)
  })
console.log(district)

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
