const NodeCache = require("node-cache");
const listCache = new NodeCache({ stdTTL: 21600 });
const schoolCache = new NodeCache({ stdTTL: 21600 });
const codeCache = new NodeCache({ stdTTL: 21600 });
const fileCache = new NodeCache({ stdTTL: 39600 }); 

module.exports = {
    listCache,schoolCache,codeCache, fileCache
  };