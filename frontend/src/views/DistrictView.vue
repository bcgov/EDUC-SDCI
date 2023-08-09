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
    const response = await InstituteService.getDistrictView(districtId.value)
    district.value = response.data
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div>
    <pre>
    {{ district }}
    </pre>
  </div>
</template>
