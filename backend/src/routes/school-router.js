const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");

const { checkToken } = require("../components/auth");
const cacheService = require("../components/cache-service");
const { getSchoolBySchoolID, getSchoolList } = require("../components/school");

router.get("/list", checkToken, getSchoolList);
router.get("/:schoolId", checkToken, getSchoolBySchoolID);

module.exports = router;
