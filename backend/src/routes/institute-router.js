const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");

const axios = require("axios");
const { checkToken } = require("../components/auth");

const cacheService = require("../components/cache-service");
const {
  getGradeCodes,
  getFundingGroupCodes,
  getCategoryCodes,
  getFacilityCodes,
  getAddressTypeCodes,
  getOffshoreSchoolList,
  getSchoolList,
  getAuthorityList,
  getDistrictList,
  getContactTypeCodes,
} = cacheService;

router.get("/contact-type-codes", checkToken, getContactTypeCodes);
router.get("/grade-codes", checkToken, getGradeCodes);
router.get("/offshore-school/list", checkToken, getOffshoreSchoolList);
router.get("/school/list", checkToken, getSchoolList);
router.get("/authority/list", checkToken, getAuthorityList);
router.get("/district/list", checkToken, getDistrictList);
router.get("/funding-group-codes", checkToken, getFundingGroupCodes);
router.get("/category-codes", checkToken, getCategoryCodes);
router.get("/facility-codes", checkToken, getFacilityCodes);
router.get("/address-type-codes", checkToken, getAddressTypeCodes);

module.exports = router;
