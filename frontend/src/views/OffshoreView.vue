<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const appStore = useAppStore()
const { offshoreSchools } = storeToRefs(appStore)
</script>

<template>
  <div>
    <v-sheet style="z-index: 100; position: relative" elevation="2" class="py-6 full-width">
      <v-row no-gutters justify="space-between">
        <v-spacer />
        <v-col cols="6">
          <h2 class="mt-3 mb-2">Offshore Schools</h2>
          <v-row>
            <v-spacer />
            <v-col
              ><v-btn block class="text-none text-subtitle-1 ma-1" variant="outlined"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Offshore School
                Representatives</v-btn
              >
              <v-btn block class="text-none text-subtitle-1 ma-1" variant="outlined"
                ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>Offshore
                Schools</v-btn
              ></v-col
            >
          </v-row>
        </v-col>
        <v-spacer />
      </v-row>
    </v-sheet>

    <ul>
      <li v-for="school in offshoreSchools" :key="school.mincode">{{ school.displayName }}</li>
    </ul>
  </div>
</template>

<style></style>
