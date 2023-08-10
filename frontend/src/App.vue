<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, onBeforeMount, onMounted } from 'vue'
import { useAppStore } from './stores/app'
import Header from './components/Header.vue'

const data = ref([]) // Placeholder for the received data
const appStore = useAppStore()

onBeforeMount(async () => {
  await appStore.setDistricts()
  console.log('districts loaded')
  await appStore.setAuthorities()
  console.log('Independent Authorities loaded')
  await appStore.setSchoolList()
  console.log('school list loaded')
  await appStore.setDistrictContactTypeCodes()
  console.log('district contact type codes loaded')
})
</script>

<template>
  <v-app id="app">
    <!-- TODO: System banner (think ENV banner?) component here? -->
    <Header />
    <!-- TODO: SnackBar component: notifications to user, successful download for example -->
    <v-main>
      <RouterView />
    </v-main>
    <!-- TODO: Footer -->
  </v-app>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
