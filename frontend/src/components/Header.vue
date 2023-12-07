<script setup lang="ts"></script>

<template>
  <v-app-bar class="justify-end">
    <a href="https://www2.gov.bc.ca/" class="">
      <img
        alt="B.C. Government Logo"
        class="logo"
        src="@/assets/images/bc-gov-logo.svg"
        width="200"
        height="125"
      />
    </a>
    <v-divider class="mx-3 d-none d-md-inline-flex" inset vertical />
    <h1 class="d-none d-md-block">BC School & District Contact Information</h1>
  </v-app-bar>
</template>

<style>
/* sizes header to align with content on desktop */
.v-toolbar__content,
.v-toolbar__extension {
  justify-content: start;
  max-width: 1280px;
}
</style>
