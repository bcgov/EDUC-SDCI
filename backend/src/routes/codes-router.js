const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");
const { checkToken } = require("../components/auth");

const {
  getAddressTypeCodes,
  getFacilityCodes,
  getContactTypeCodes,
  getGradeCodes,
  getFundingGroupCodes,
  getCategoryCodes,
} = require("../components/code");

router.get("/contact-type-codes", checkToken, getContactTypeCodes);
router.get("/grade-codes", checkToken, getGradeCodes);
router.get("/funding-group-codes", checkToken, getFundingGroupCodes);
router.get("/category-codes", checkToken, getCategoryCodes);
router.get("/facility-codes", checkToken, getFacilityCodes);
router.get("/address-type-codes", checkToken, getAddressTypeCodes);

module.exports = router;
