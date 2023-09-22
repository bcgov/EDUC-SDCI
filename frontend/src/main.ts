import './assets/main.css'
import '@bcgov/bc-sans/css/BCSans.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as labsComponents from 'vuetify/labs/components'

// material design icons for vuetify
import { aliases, mdi } from "vuetify/iconsets/mdi"
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router/index'

// define custom theme
const bcGovTheme: ThemeDefinition = {
    dark: false,
    colors: {
        background: '#F9F9F9',
        surface: '#FFFFFF',
        primary: '#38598A',
        secondary: '#7490BA',
        bcGovBlue: '#003366',
        bcGovGold: '#FCBA19',
        error: '#D8292F',
        success: '#2E8540',
        warning: '#FFCC51',
        debug: '#C582FF',
    }
}

const vuetify = createVuetify({
    components: {
        ...components,
        ...labsComponents,
      },
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        }},
    theme: {
        defaultTheme: 'bcGovTheme',
        themes: {bcGovTheme,}
    }})
const app = createApp(App)


app.use(vuetify)
app.use(createPinia())
app.use(router)

app.mount('#app')
