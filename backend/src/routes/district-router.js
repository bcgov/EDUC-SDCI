const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const NodeCache = require("node-cache");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { checkToken } = require("../components/auth");
const cacheService = require("../components/cache-service");

router.get("/:id", checkToken, getDistrict);

async function getDistrict(req, res) {
  try {
    const { id } = req.params;

    // If getDistrictByDistrictID returns a promise, await it
    const districtJSON = await cacheService.getDistrictByDistrictID(id);

    // Wrap the response
    res.json({ districtData: districtJSON });
  } catch (e) {
    console.error(
      "getDistrict Error:",
      e.response ? e.response.status : e.message
    );
    res.status(500).json({ error: "Failed to get district data" });
  }
}

module.exports = router;
