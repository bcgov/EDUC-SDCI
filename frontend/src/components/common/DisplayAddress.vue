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
</script>

<template>
  <div class="px-1 py-2">
    <p class="font-weight-bold">{{ appStore.getAddressTypeCodeLabel(addressTypeCode) }} Address</p>
    <p>{{ addressLine1 }}</p>
    <p>{{ addressLine2 }}</p>
    <p>{{ city }}, {{ provinceCode }}</p>
    <p>{{ formatPostalCode(postal) }}</p>
  </div>
</template>
