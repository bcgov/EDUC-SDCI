<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import DistrictSelect from '../components/DistrictSelect.vue'
import AuthoritySelect from '../components/AuthoritySelect.vue'
</script>

<template>
  <div>
    <DistrictSelect />
    <AuthoritySelect />
    <TheWelcome />
  </div>
</template>
