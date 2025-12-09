"use strict";

const cacheService = require("./cache-service");

async function getDistrictList(_req, res) {
  const districtList = cacheService.getActiveDistricts();
  return res.status(200).json(districtList ? districtList : []);
}

async function getDistrict(req, res) {
  try {
    const { id } = req.params;
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

module.exports = {
  getDistrictList,
  getDistrict,
};
