const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const NodeCache = require("node-cache");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { checkToken } = require("../components/auth");
const { listCache } = require("../components/cache");
const {addFundingGroups, appendMailingAddressDetailsAndRemoveAddresses, rearrangeAndRelabelObjectProperties, sortByProperty} = require("../components/utils.js")
//Batch Routes
router.get("/*", checkToken, getSearchResults)
async function getSearchResults(req, res) {
  const fundingGroups = await listCache.get("fundingGroups")
  const url = `${config.get("server:instituteAPIURL")}/api/v1`+ req.url;
  axios
    .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
    .then((response) => {
      const results = response.data.content;
      const resultsWithFundingGroups = addFundingGroups(results, fundingGroups);
      response.data.content = resultsWithFundingGroups; 
      res.json(response.data);
    })
    .catch((e) => {
      log.error("getData Error", e.response ? e.response.status : e.message);
    });
}


module.exports = router;
