const express = require("express");
const router = express.Router();

const { checkToken } = require("../components/auth");
const { getSchoolBySchoolID, getSchoolList } = require("../components/school");

router.get("/schools-list", checkToken, getSchoolList);
router.get("/:schoolId", checkToken, getSchoolBySchoolID);

module.exports = router;
