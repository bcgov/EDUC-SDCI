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


//Create Cache for schools
const cacheService = require('./components/cache-service');
cacheService.loadAllSchoolsToMap().then(() => {
  log.info('Loaded school data to memory');
}).catch((e) => {
  log.error('Error loading schoolsMap during boot .', e);
});
//Create Cache for districts
cacheService.loadAllDistrictsToMap().then(() => {
  log.info('Loaded district data to memory');
}).catch((e) => {
  log.error('Error loading districtssMap during boot .', e);
});
//Create Cache for address type codes.
cacheService.loadAddressTypeCodes().then(() => {
  log.info('Loaded address type codes to memory');
}).catch((e) => {
  log.error('Error loading address type codes during boot .', e);
});

//Create Cache for category codes.
cacheService.loadSchoolCategoryCodes().then(() => {
  log.info('Loaded category codes to memory');
}).catch((e) => {
  log.error('Error loading category codes during boot .', e);
});
//Create Cache for Grade Codes.
cacheService.loadGradeCodes().then(() => {
  log.info('Loaded grade codes to memory');
}).catch((e) => {
  log.error('Error loading grade codes during boot .', e);
});
//Create Cache for facility codes.
cacheService.loadFacilityCodes().then(() => {
  log.info('Loaded facility codes to memory');
}).catch((e) => {
  log.error('Error loading facility codes during boot .', e);
});

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
