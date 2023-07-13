<script>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import InstituteService from './services/InstituteService'
import { useAppStore } from './stores/app'

export default {
  setup() {
    const data = ref([]) // Placeholder for the received data
    const appStore = useAppStore()

    const getDistricts = () => {
      InstituteService.getDistricts()
        .then((response) => {
          // Handle the response data
          appStore.setDistricts(response.data)
        })
        .catch((error) => {
          // Handle the error
          console.error(error)
        })
    }
    const getSchools = () => {
      InstituteService.getSchools()
        .then((response) => {
          console.log('getting schools')
          // Handle the response data
          appStore.setSchools(response.data)
        })
        .catch((error) => {
          // Handle the error
          console.error(error)
        })
    }

    // Call the getDistricts function when the component is mounted
    onMounted(() => {
      getDistricts()
      //getSchools()
    })

    return {
      data,
      getDistricts,
      getSchools
    }
  }
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/search">School Search</RouterLink>
        <RouterLink to="/school">School</RouterLink>
        <RouterLink to="/district-81770c47-b1aa-44b1-d732-7e1c1b809389">District</RouterLink>
        <RouterLink to="/authority">Authority</RouterLink>
        <RouterLink to="/list-districts">List Districts</RouterLink>
        <RouterLink to="/list-schools">List Schools</RouterLink>
      </nav>
    </div>
  </header>
  <RouterView />
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
