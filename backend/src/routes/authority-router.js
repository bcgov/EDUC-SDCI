const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");
const cacheService = require("../components/cache-service.js");
const { checkToken } = require("../components/auth");
const {
  appendMailingAddressDetailsAndRemoveAddresses,
  rearrangeAndRelabelObjectProperties,
  sortByProperty,
} = require("../components/utils.js");

// Batch Routes
router.get("/:id", checkToken, getAuthority);

async function getAuthority(req, res) {
  try {
    const { id } = req.params;

    const authorityData = await cacheService.getAuthorityByAuthorityID(id);
    const authoritySchools = await cacheService.getAuthoritySchools(id);

    const authorityJSON = {
      authorityData,
      authoritySchools,
    };

    res.json(authorityJSON);
    log.info(`Authority details fetched for ID ${id}`);
  } catch (e) {
    log.error(
      "getAuthority Error:",
      e.response ? e.response.status : e.message
    );
    res.status(500).json({ error: "Failed to fetch authority data" });
  }
}

module.exports = router;
