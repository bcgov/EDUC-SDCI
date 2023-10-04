<script setup lang="ts">
import DistrictSelect from '../components/DistrictSelect.vue'
import AuthoritySelect from '../components/AuthoritySelect.vue'
import OffshoreSelect from '../components/OffshoreSelect.vue'
import SchoolSelect from '../components/SchoolSelect.vue'
</script>

<template>
  <v-breadcrumbs bg-color="primary" class="breadcrumbs" :items="[{title: 'Home', href:'/'}]"></v-breadcrumbs>
  <div>
    <SchoolSelect />
    <DistrictSelect />
    <AuthoritySelect />
    <OffshoreSelect />
  </div>
</template>
