'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = process.env.NODE_ENV || 'local';
nconf.argv()
  .env()
  .file({ file: path.join(__dirname, `${env}.json`) });

//injects environment variables into the json file
nconf.overrides({
  environment: env,

  server: {
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: 8080
  }
});
nconf.defaults({
  environment: env,
  server: {
    frontend: process.env.SERVER_FRONTEND,
    backend: process.env.SERVER_FRONTEND + '/api',
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: 8080,
    session: {
      maxAge: +process.env.SESSION_MAX_AGE
    },
    instituteAPIURL: process.env.INSTITUTE_API_URL,
    schoolsAPIURL: process.env.SCHOOLS_API_URL,
    instituteAPITokenExpiry: process.env.INSTITUTE_API_EXPIRY,
    clearFilesKey: process.env.CLEAR_FILES_KEY
  },
  oidc: {
    clientId: process.env.SOAM_CLIENT_ID,
    clientSecret: process.env.SOAM_CLIENT_SECRET,
    discovery: process.env.SOAM_DISCOVERY,
    tokenEndpoint: process.env.SOAM_TOKEN_URL
  },
});
module.exports = nconf;
