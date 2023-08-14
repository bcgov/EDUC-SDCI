<template>
  <v-row>
    <v-dialog v-model="dialog" width="1000">
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props"> Contacts by Type </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Contacts by Type</span>
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedContactType"
            label="Select a Contact by Type"
            :items="appStore.getAllDistrictContactTypeCodesLabel"
            :item-title="appStore.getAllDistrictContactTypeCodesLabel"
            :item-value="appStore.getAllDistrictContactTypeCodesLabel"
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green-darken-1" variant="text" @click="dialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { ref, reactive, computed } from 'vue'
const selectedContactType = ref('')
const appStore = useAppStore()
const dialog = ref(false)
</script>
