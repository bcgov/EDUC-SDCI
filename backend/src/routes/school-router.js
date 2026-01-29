const express = require("express");
const router = express.Router();

const { checkToken } = require("../components/auth");
const { getSchoolBySchoolID, getSchoolList } = require("../components/school");
const {
  getOffshoreSchoolList,
  getOffshoreSchoolRepresentatives,
} = require("../components/offshore");

router.get("/schools-list", checkToken, getSchoolList);
router.get("/offshore-schools-list", checkToken, getOffshoreSchoolList);
router.get(
  "/offshore-representatives",
  checkToken,
  getOffshoreSchoolRepresentatives,
);
router.get("/:schoolId", checkToken, getSchoolBySchoolID);

module.exports = router;
