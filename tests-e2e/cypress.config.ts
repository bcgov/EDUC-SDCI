
import {defineConfig} from "cypress";

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  video: false,
  screenshotOnRunFailure: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  defaultCommandTimeout: 5000,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL_SECRET || ''
  }
})