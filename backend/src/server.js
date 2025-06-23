'use strict';

const config = require('./config/index');
const http = require('http');
const log = require('./components/logger');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

/**
 * Get port from environment and store in Express.
 */
const port = config.get('server:port');

const server = http.createServer(app);


const cacheService = require('./components/cache-service');

async function bootstrapCache() {
  try {
    // Load district data
    await cacheService.loadAllDistrictsToMap();
    log.info('Loaded district data to memory');
    // Load funding codes
    await cacheService.loadFundingCodes();
    log.info('Loaded grade codes to memory');
    // Load grade codes
    await cacheService.loadGradeCodes();
    log.info('Loaded grade codes to memory');
    
    // Load school data
    await cacheService.loadAllSchoolsToMap();
    log.info('Loaded school data to memory');

    // Add schools to districts
    cacheService.addSchoolsToDistricts();

    // Load address type codes
    await cacheService.loadAddressTypeCodes();
    log.info('Loaded address type codes to memory');

    // Load school category codes
    await cacheService.loadSchoolCategoryCodes();
    log.info('Loaded category codes to memory');


    // Load facility codes
    await cacheService.loadFacilityCodes();
    log.info('Loaded facility codes to memory');

    //Create Files for download
    await cacheService.createSchoolFiles();
    log.info('Created school files');
    await cacheService.createDistrictFiles();
    log.info('Created district files');
    
  } catch (error) {
    log.error('Error during cache bootstrapping:', error);
  }
}

// Start the cache initialization
bootstrapCache();

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const portNum = parseInt(val, 10);

  if (isNaN(portNum)) {
    // named pipe
    return val;
  }

  if (portNum >= 0) {
    // port number
    return portNum;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  log.info('Listening on ' + bind);
}
process.on('SIGINT',() => {
  server.close(() => {
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
  });
});

//exports are purely for testing
module.exports = {
  normalizePort,
  onError,
  onListening,
  server
};
