const NodeCache = require("node-cache");
const listCache = new NodeCache({ stdTTL: 21600 });
//const schoolCache = new NodeCache({ stdTTL: 21600 });
const codeCache = new NodeCache({ stdTTL: 21600 });
const fileCache = new NodeCache({ stdTTL: 39600 });
const Ioredis = require("ioredis");

const config = require("../config/index");
const redisHost = 'localhost';
const redisPort = 6379;

const schoolCache = new Ioredis({
  host: redisHost,
  port: redisPort,
});


module.exports = {
    listCache,schoolCache,codeCache, fileCache
  };