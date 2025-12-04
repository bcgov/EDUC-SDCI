const express = require("express");
const router = express.Router();
const { checkToken } = require("../components/auth");
const { getDistrictList } = require("../components/district");
const cacheService = require("../components/cache-service");

router.get("/list", checkToken, getDistrictList);
router.get("/:id", checkToken, getDistrict);

async function getDistrict(req, res) {
  try {
    const { id } = req.params;

    // If getDistrictByDistrictID returns a promise, await it
    const districtJSON = await cacheService.getDistrictByDistrictID(id);
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
