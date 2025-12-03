const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");

const axios = require("axios");
const { checkToken } = require("../components/auth");
const { getDistrictList } = require("../components/district");
const { getSchoolList } = require("../components/school");
const { getOffshoreSchoolList } = require("../components/offshore");
const { getAuthorityList } = require("../components/authority");

const {
  getAddressTypeCodes,
  getFacilityCodes,
  getContactTypeCodes,
  getGradeCodes,
  getFundingGroupCodes,
  getCategoryCodes,
} = require("../components/code");

//move to code.js
router.get("/contact-type-codes", checkToken, getContactTypeCodes);
router.get("/grade-codes", checkToken, getGradeCodes);
router.get("/funding-group-codes", checkToken, getFundingGroupCodes);
router.get("/category-codes", checkToken, getCategoryCodes);
router.get("/facility-codes", checkToken, getFacilityCodes);
router.get("/address-type-codes", checkToken, getAddressTypeCodes);

//move to offshore.js?
router.get("/offshore-school/list", checkToken, getOffshoreSchoolList);

//move to school.js
router.get("/school/list", checkToken, getSchoolList);

//move to district.js

router.get("/district/list", checkToken, getDistrictList);

module.exports = router;
