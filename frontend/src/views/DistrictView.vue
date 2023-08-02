<script setup lang="ts">
import InstituteService from '@/Services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'

const appStore = useAppStore()
const districtId = ref(null) // Initialize with null initially

const district = reactive({ value: {} })

onMounted(async () => {
  const route = useRoute()
  // Set the districtId inside the onMounted hook
  districtId.value = appStore.getDistrictByDistrictNumber(
    String(route.params.districtNumber)
  )?.districtId

  try {
    const response = await InstituteService.getDistrict(districtId.value)
    district.value = response.data
  } catch (error) {
    console.error(error)
  }

  console.log(districtId.value) // Logs the districtId after it has been set
  console.log(toValue(district)) // Logs the district object after it has been updated
})
</script>

<template>
  <div>
    Hello World, I'm DistrictView.vue!
    <pre>
    {{ district }}
    </pre>
  </div>
</template>
