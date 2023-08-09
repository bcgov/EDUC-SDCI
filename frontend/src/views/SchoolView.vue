<template>
  <h1>Selected school data</h1>
  <div>{{ schoolData.value }}</div>
</template>
<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import InstituteService from '@/Services/InstituteService'

const schoolData = reactive({ value: {} })
onMounted(async () => {
  const route = useRoute()
  const selectedSchoolId = route.params.schoolId

  try {
    const response = await InstituteService.getSchool(selectedSchoolId)
    schoolData.value = response.data
  } catch (error) {
    console.error(error)
  }
})
</script>
<style></style>
