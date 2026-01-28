const express = require("express");
const router = express.Router();
const cacheService = require("../components/cache-service");
const { checkToken } = require("../components/auth");
const { getDistrictList, getDistrict } = require("../components/district");

router.get("/school-districts-list", checkToken, getDistrictList);
router.get("/:id", checkToken, getDistrict);

module.exports = router;
