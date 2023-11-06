<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { useSanitizeURL } from '@/composables/string'
import ContactTypeModal from '@/components/ContactTypeModel.vue'

import type { ListDistrict } from '@/types/types'
import type { Ref } from 'vue'

const appStore = useAppStore()

const selectedDistrict: Ref<ListDistrict | null> = ref(null)

function goToDistrict() {
  if (selectedDistrict.value?.displayName) {
    router.push({
      name: 'district',
      params: {
        districtNumber: useSanitizeURL(String(selectedDistrict.value?.districtNumber)),
        displayName: useSanitizeURL(String(selectedDistrict.value?.displayName))
      }
    })
  }
}

function downloadDistrictsMailing() {
  alert('TODO - implement mailing download for all districts')
}
</script>

<template>
  <v-card class="px-6 py-4 mt-5">
    <h2 class="mb-5">School Districts</h2>
    <v-row no-gutters justify="space-between">
      <v-col class="ma-1">
        <v-row>
          <v-autocomplete
            v-model="selectedDistrict"
            label="Select a District"
            :items="appStore.getDistrictList"
            :item-title="
              (item) => (item?.districtNumber ? item.districtNumber + ' - ' + item.displayName : '')
            "
            :item-value="(item) => item"
            class="selectDistrictInput w-75"
          ></v-autocomplete>
          <v-btn
            icon="mdi-magnify"
            color="primary"
            variant="flat"
            rounded="lg"
            size="large"
            @click="goToDistrict"
            class="v-btn-align-left text-none text-subtitle-1 ml-3"
          />
        </v-row>
        <v-row>
          <ContactTypeModal></ContactTypeModal>
          <v-btn
            variant="text"
            block
            class="v-btn-align-left text-none text-subtitle-1 my-1"
            @click="downloadDistrictsMailing"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template>Mailing for All
            Districts (CSV)</v-btn
          >
          <v-btn
            href="/api/v1/download/csv/institute/district/contact/paginated?pageSize=200&pageNumber=0&filepath=exceldistrictcontacts"
            variant="text"
            class="v-btn-align-left text-none text-subtitle-1 my-1"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>

            Contacts for All Districts (CSV)</v-btn
          >
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
