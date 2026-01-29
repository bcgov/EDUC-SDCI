<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { formatPostalCode } from '@/utils/common'

const appStore = useAppStore()

const props = defineProps<{
  addressTypeCode: string
  addressLine1: string | null
  addressLine2?: string | null
  city: string | null
  provinceCode: string | null
  countryCode?: string | null
  postal: string | null
}>()
</script>

<template>
  <div class="pa-0">
    <p class="font-weight-bold">{{ appStore.getAddressTypeCodeLabel(addressTypeCode) }} Address</p>
    <div class="pl-2 pl-md-0">
      <p>{{ addressLine1 }}</p>
      <p>{{ addressLine2 }}</p>
      <p>{{ city }}, {{ provinceCode }}</p>
      <p>{{ postal ? formatPostalCode(postal) : '' }}</p>
    </div>
  </div>
</template>
