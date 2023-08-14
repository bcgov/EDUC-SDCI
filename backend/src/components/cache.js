const NodeCache = require("node-cache");
const listCache = new NodeCache({ stdTTL: 21600 });

module.exports = {
    listCache
  };