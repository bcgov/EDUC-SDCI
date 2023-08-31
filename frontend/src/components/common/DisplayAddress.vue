<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { formatPostalCode } from '@/utils/common'

const appStore = useAppStore()

const props = defineProps<{
  addressTypeCode: string
  addressLine1: string
  addressLine2: string
  city: string
  provinceCode: string
  countryCode?: string
  postal: string
}>()

// TODO: Move to common utils file
// function formatPostal(postal) {
//   return postal?.toUpperCase().replace(/(...)/, '$1')
// }
</script>

<template>
  <div class="px-1 py-2">
    <p class="font-weight-bold">
      {{ appStore.getAddressTypeCodeLabel(props.addressTypeCode) }} Address
    </p>
    <p class="text-capitalize">{{ addressLine1?.toLowerCase() }}</p>
    <p class="text-capitalize">{{ addressLine2?.toLowerCase() }}</p>
    <p class="text-capitalize">{{ city?.toLowerCase() }}, {{ provinceCode }}</p>
    <p>{{ formatPostalCode(postal) }}</p>
  </div>
</template>
