const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");

const { checkToken } = require("../components/auth");
const cacheService = require("../components/cache-service");

//Batch Routes

router.get("/all-contacts/:schoolCategory", checkToken, getAllSchools);
router.get("/:schoolId", checkToken, getSchool);

async function getSchool(req, res) {
  const { schoolId } = req.params;
  const response = cacheService.getSchoolBySchoolID(req, res);
  return response;
}

async function getAllSchools(req, res) {
  const { schoolCategory } = req.params;
  return res.json([]);
}

module.exports = router;
