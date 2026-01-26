const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const cacheService = require("../components/cache-service.js");
const { getAuthorityList } = require("../components/authority.js");
const { checkToken } = require("../components/auth");

router.get("/independent-authorities-list", checkToken, getAuthorityList);
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
  } catch (e) {
    log.error(
      "getAuthority Error:",
      e.response ? e.response.status : e.message
    );
    res.status(500).json({ error: "Failed to fetch authority data" });
  }
}

module.exports = router;
