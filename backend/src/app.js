
const config = require('./config/index');
const log = require('./components/logger');
const dotenv = require('dotenv');
const express = require("express");
const axios = require("axios");
const cors = require('cors');
const NodeCache = require("node-cache");
const apiRouter = express.Router();
const instituteRouter = require('./routes/institute-router');
const app = express();
app.use(express.static('public'));
app.use(cors());

app.use(/(\/api)?/, apiRouter);

//institute Router
apiRouter.use('/v1/institute', instituteRouter);


//Handle 500 error
app.use((err, _req, res, next) => {
  res?.redirect(config?.get('server:frontend') + '/error?message=500_internal_error');
  next();
});

// Handle 404 error
app.use((_req, res) => {
  res.redirect(config?.get('server:frontend') + '/error?message=404_Page_Not_Found');
});

// Prevent unhandled errors from crashing application
process.on('unhandledRejection', err => {
});
module.exports = app;
