<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { ref } from 'vue'

const appStore = useAppStore()
// used for open and close modal
const dialog = ref(false)
// varibles used for search
</script>
<template>
  <v-dialog v-model="dialog" max-width="500">
    <template v-slot:activator="{ props }">
      <v-btn
        block
        variant="outlined"
        color="bcGovBlue"
        class="text-none text-subtitle-1 my-1"
        v-bind="props"
      >
        Download Schools Info
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card title="School Information Downloads">
        <v-card-actions>
          <v-column class="pl-3">
            <v-row class="pt-2">
              <v-col class="py-1 my-0"
                ><v-btn
                  href="/api/v1/download/csv/school/all-contacts/PUBLIC?filepath=publicschoolcontacts"
                  block
                  class="v-btn-align-left text-none text-subtitle-1 my-1"
                  @click="dialog = false"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template> Public
                  Schools (CSV)</v-btn
                ></v-col
              >
            </v-row>
            <v-row>
              <v-col class="py-1 my-0">
                <v-btn
                  href="/api/v1/download/csv/school/all-contacts/INDEPEND?filepath=independentschoolcontacts"
                  block
                  style="text-align: left"
                  class="v-btn-align-left text-left text-none text-subtitle-1 my-1"
                  @click="dialog = false"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template>

                  Independent Schools (CSV)</v-btn
                ></v-col
              >
            </v-row>
            <v-row>
              <v-col class="py-1 my-0">
                <v-btn
                  href="/api/v1/download/csv/school/all-contacts/ALL?filepath=allschoolcontacts"
                  block
                  class="v-btn-align-left text-left text-none text-subtitle-1 my-1"
                  @click="dialog = false"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template> All Schools
                  (CSV)</v-btn
                ></v-col
              >
            </v-row>
            <v-row>
              <v-col class="py-1 my-0">
                <v-btn
                  href="/api/v1/download/csv/school/all-contacts/ALLMAILING?filepath=allschoolmailing"
                  block
                  class="v-btn-align-left text-left text-none text-subtitle-1 my-1"
                  @click="dialog = false"
                  ><template v-slot:prepend> <v-icon icon="mdi-download" /> </template> Mailing for
                  All Schools (CSV)</v-btn
                >
              </v-col>
            </v-row>
          </v-column>
        </v-card-actions>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="dialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
