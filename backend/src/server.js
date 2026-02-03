// NATS and Institute message handler
const NATS = require("./messaging/message-pub-sub");
const InstituteMessageHandler = require("./messaging/handlers/institute-update-handler");

// Initialize NATS and subscribe to the topic when the app starts
NATS.init().then(() => {
  InstituteMessageHandler.subscribe();
  Z;
});
("use strict");

const config = require("./config/index");
const http = require("http");
const log = require("./components/logger");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");

/**
 * Get port from environment and store in Express.
 */
const port = config.get("server:port");

const server = http.createServer(app);

const cacheService = require("./components/cache-service");

async function bootstrapCache() {
  try {
    await cacheService.loadCache();
  } catch (error) {
    log.error("Error during cache bootstrapping:", error);
  }
}

// Start the cache initialization
bootstrapCache();

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

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
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  log.info("Listening on " + bind);
}
process.on("SIGINT", () => {
  server.close(() => {});
});

process.on("SIGTERM", () => {
  server.close(() => {});
});

//exports are purely for testing
module.exports = {
  normalizePort,
  onError,
  onListening,
  server,
};
