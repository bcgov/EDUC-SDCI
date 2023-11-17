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
const {appendMailingAddressDetailsAndRemoveAddresses, rearrangeAndRelabelObjectProperties, sortByProperty} = require("../components/utils.js")
//Batch Routes
router.get("/*", checkToken, getSearchResults)
async function getSearchResults(req, res) {

  const url = `${config.get("server:instituteAPIURL")}`+ req.url;
  axios
    .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
    .then((response) => {
      res.json(response.data);
    })
    .catch((e) => {
      log.error("getData Error", e.response ? e.response.status : e.message);
    });
}


module.exports = router;
