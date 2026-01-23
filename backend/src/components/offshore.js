"use strict";

const log = require("./logger");
const cacheService = require("./cache-service");

async function getOffshoreSchoolList(req, res) {
  try {
    const offshoreSchoolList = cacheService.getOffshoreSchools();
    res.json(offshoreSchoolList);
  } catch (e) {
    log.error(
      "getOffshoreSchoolsList Error",
      e.response ? e.response.status : e.message,
    );
    res.status(500).json({ error: "Failed to fetch offshore school list" });
  }
}
async function getOffshoreSchoolRepresentatives(req, res) {
  try {
    const offshoreSchoolRepresentatives =
      cacheService.getOffshoreSchoolRepresentatives();
    res.json(offshoreSchoolRepresentatives);
  } catch (e) {
    log.error(
      "getOffshoreSchoolsList Error",
      e.response ? e.response.status : e.message,
    );
    res
      .status(500)
      .json({ error: "Failed to fetch offshore school representatives" });
  }
}

module.exports = {
  getOffshoreSchoolList,
  getOffshoreSchoolRepresentatives,
};
