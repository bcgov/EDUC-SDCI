"use strict";

const log = require("./logger");
const config = require("../config");
const HttpStatus = require("http-status-codes");
const { LocalDate, DateTimeFormatter } = require("@js-joda/core");
const cacheService = require("./cache-service");

async function getDistrictList(_req, res) {
  const districtList = cacheService.getActiveDistricts();
  return res.status(200).json(districtList ? districtList : []);
}

module.exports = {
  getDistrictList,
};
