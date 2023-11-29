<script setup lang="ts">
import DistrictSelect from '../components/DistrictSelect.vue'
import AuthoritySelect from '../components/AuthoritySelect.vue'
import OffshoreSelect from '../components/OffshoreSelect.vue'
import SchoolSelect from '../components/SchoolSelect.vue'
</script>

<template>
  <v-container fluid class="pa-0">
    <v-col no-gutters>
      <v-row>
        <v-col class="pa-0">
          <SchoolSelect />
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="8" md="4" class="d-flex py-6">
          <DistrictSelect />
        </v-col>

        <v-col cols="8" md="4" class="d-flex py-6">
          <AuthoritySelect />
        </v-col>

        <v-col cols="8" md="4" class="d-flex py-6">
          <OffshoreSelect />
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>
