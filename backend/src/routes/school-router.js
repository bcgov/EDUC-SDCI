const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");

const { checkToken } = require("../components/auth");
const cacheService = require("../components/cache-service");
const { getSchoolBySchoolID } = require("../components/school");

//Batch Routes
router.get("/:schoolId", checkToken, getSchool);

async function getSchool(req, res) {
  const response = getSchoolBySchoolID(req, res);
  return response;
}

module.exports = router;
