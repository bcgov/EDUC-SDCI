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
        //districtId: String(selectedDistrict.value?.districtId)
      }
    })
  }
}

function downloadDistrictsMailing() {
  alert('TODO - implement mailing download for all districts')
}
</script>

<template>
  <v-container fluid>
    <v-card class="pa-6">
      <h2 class="mb-3">District Information</h2>
      <v-row no-gutters justify="space-between">
        <v-col class="mr-6">
          <v-autocomplete
            v-model="selectedDistrict"
            label="Select a District"
            :items="appStore.getDistrictList"
            :item-title="
              (item) => (item?.districtNumber ? item.districtNumber + ' - ' + item.displayName : '')
            "
            :item-value="(item) => item"
          ></v-autocomplete>
          <v-btn
            color="primary"
            class="text-none text-subtitle-1"
            variant="flat"
            @click="goToDistrict"
            >View District Info</v-btn
          >
        </v-col>
        <v-spacer />
        <v-col class="ml-6" cols="4">
          <v-btn
            block
            class="text-none text-subtitle-1 ma-1"
            variant="outlined"
            @click="downloadDistrictsMailing"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /></template> Mailing for All
            Districts</v-btn
          >
          <v-btn block class="text-none text-subtitle-1 ma-1" variant="outlined"
            ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>
            <a
              href="/api/v1/download/excel/institute/district/contact/paginated?pageSize=100&pageNumber=0&filepath=exceldistrictcontacts"
            >
              Contacts for All Districts</a
            ></v-btn
          >
          <!-- <v-btn class="text-none text-subtitle-1 ma-1" variant="flat"
          ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Contacts by
          Type</v-btn
        > -->
          <ContactTypeModal></ContactTypeModal>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
