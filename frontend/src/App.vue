<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, onBeforeMount, onMounted } from 'vue'
import { useAppStore } from './stores/app'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const data = ref([]) // Placeholder for the received data
const appStore = useAppStore()

onBeforeMount(async () => {
  await appStore.setCodes() //calls /create-cache
  await appStore.setDistricts()
  await appStore.setAuthorityList()
  await appStore.setSchoolList()
  await appStore.setOffshoreSchoolList()
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
    <Footer />
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
  #app {
    width: 1280px;
    padding: 0 2rem;
  }
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
