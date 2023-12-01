<script setup lang="ts">
import DistrictSelect from '../components/DistrictSelect.vue'
import AuthoritySelect from '../components/AuthoritySelect.vue'
import OffshoreSelect from '../components/OffshoreSelect.vue'
import SchoolSelect from '../components/SchoolSelect.vue'
</script>

<template>
  <div>
    <!-- <v-breadcrumbs
      bg-color="primary"
      class="breadcrumbs"
      :items="[{ title: 'Home', href: '/' }]"
    ></v-breadcrumbs> -->
    <v-col no-gutters>
      <v-row>
        <SchoolSelect />
      </v-row>
      <v-row no-gutters>
        <v-col class="d-flex align-stretch ma-2">
          <DistrictSelect />
        </v-col>

        <v-col class="d-flex align-stretch ma-2">
          <AuthoritySelect />
        </v-col>

        <v-col class="d-flex align-stretch ma-2">
          <OffshoreSelect />
        </v-col>
      </v-row>
    </v-col>
  </div>
</template>
