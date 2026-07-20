"use strict";

const cacheService = require("./cache-service");

async function getDistrictList(_req, res) {
  try {
    const districtList = cacheService.getActiveDistricts() || [];

    const filteredList = districtList.map((d) => ({
      districtId: d.districtId,
      displayName: d.displayName,
      districtNumber: d.districtNumber,
    }));

    return res.status(200).json(filteredList);
  } catch (err) {
    console.error("Error in getDistrictList:", err);
    return res.status(500).send("Internal server error");
  }
}

async function getDistrict(req, res) {
  try {
    const { id } = req.params;
    const districtJSON = await cacheService.getDistrictByDistrictID(id);
    if (districtJSON?.districtSchools) {
      districtJSON.districtSchools = districtJSON.districtSchools.filter(
        (school) => !["INDEPEND"].includes(school.schoolCategoryCode),
      );
    }
    res.json({ districtData: districtJSON });
  } catch (e) {
    console.error(
      "getDistrict Error:",
      e.response ? e.response.status : e.message,
    );
    res.status(500).json({ error: "Failed to get district data" });
  }
}

module.exports = {
  getDistrictList,
  getDistrict,
};
