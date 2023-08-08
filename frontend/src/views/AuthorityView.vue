<script setup lang="ts">
import InstituteService from '@/Services/InstituteService'
import { ref, reactive, onMounted, computed, toValue } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'

const appStore = useAppStore()
const authorityId = ref(null) // Initialize with null initially

const authority = reactive({ value: {} })

onMounted(async () => {
  const route = useRoute()
  authorityId.value = appStore.getAuthorityByAuthorityNumber(
    String(route.params.authorityNumber)
  )?.independentAuthorityId

  console.log(authorityId.value)

  try {
    const response = await InstituteService.getAuthority(authorityId.value)
    authority.value = response.data
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div>
    Hello World, I'm AuthorityView.vue!
    <pre>
      {{ authority }}
    </pre>
  </div>
</template>
