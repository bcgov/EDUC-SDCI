<script setup lang="ts">
import InstituteService from '@/Services/InstituteService'
import { ref, reactive, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'

const route = useRoute()
const appStore = useAppStore()
const districtId = ref(
  appStore.getDistrictByDistrictNumber(String(route.params.districtNumber))?.districtId
)

const district = reactive({ value: {} })
console.log(districtId.value)

InstituteService.getDistrict(districtId.value)
  .then((response) => {
    district.value = response.data
  })
  .catch((error) => {
    console.error(error)
  })

console.log(toValue(district))
</script>

<template>
  <div>
    Hello World, I'm DistrictView.vue!
    <pre>
    {{ district }}
    </pre>
  </div>
</template>
