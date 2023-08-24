<script setup lang="ts"></script>

<template>
  <v-app-bar>
    <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> -->
    <a href="https://www2.gov.bc.ca/">
      <img
        alt="B.C. Government Logo"
        class="logo"
        src="@/assets/images/bc-gov-logo.svg"
        width="125"
        height="125"
      />
    </a>
    <h1>BC School & District Contact Information</h1>
    <!-- TODO: Move to DEBUG component? Links are temporary until we build out our views.-->
    <template v-slot:extension>
      <div>
        <RouterLink class="mx-2" to="/">Home</RouterLink>
        <RouterLink class="mx-2" to="/search">School Search</RouterLink>
        <RouterLink class="mx-2" to="/school">School</RouterLink>
        <RouterLink class="mx-2" to="/offshore">Offshore</RouterLink>
        <RouterLink class="mx-2" to="/list-districts">List Districts</RouterLink>
        <RouterLink class="mx-2" to="/list-schools">List Schools</RouterLink>
      </div>
    </template>
  </v-app-bar>
</template>

<style>
/* sizes header to align with content on desktop */
.v-toolbar__content,
.v-toolbar__extension {
  max-width: 1280px;
  padding: 0 2rem;
}
</style>
