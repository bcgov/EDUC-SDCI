<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const props = defineProps<{
  addressTypeCode: String
  addressLine1: String
  addressLine2: String
  city: String
  provinceCode: String
  countryCode?: String
  postal: String
}>()

console.log('address component - ', props)

// TODO: Move to common utils file
function formatPostal(postal) {
  return postal?.toUpperCase().replace(/(...)/, '$1')
}
</script>

<template>
  <div class="px-1 py-2">
    <p class="font-weight-bold">
      {{ appStore.getAddressTypeCodeLabel(props.addressTypeCode) }} Address
    </p>
    <p class="text-capitalize">{{ addressLine1?.toLowerCase() }}</p>
    <p class="text-capitalize">{{ addressLine2?.toLowerCase() }}</p>
    <p class="text-capitalize">{{ city?.toLowerCase() }}, {{ provinceCode }}</p>
    <p>{{ formatPostal(postal) }}</p>
  </div>
</template>
