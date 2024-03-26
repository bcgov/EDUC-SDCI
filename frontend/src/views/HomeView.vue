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
      <v-row justify="center" class="pa-2 pa-md-0">
        <v-col cols="12" md="4" class="d-flex py-md-6 pa-2 px-md-3">
          <DistrictSelect />
        </v-col>

        <v-col cols="12" md="4" class="d-flex py-md-6 pa-2 px-md-3">
          <AuthoritySelect />
        </v-col>

        <v-col cols="12" md="4" class="d-flex py-md-6 pa-2 px-md-3">
          <OffshoreSelect />
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>
