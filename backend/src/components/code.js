"use strict";
const { logApiError, errorResponse } = require("./utils");
const cacheService = require("./cache-service");
const _ = require("lodash");

async function getAddressTypeCodes(_req, res) {
  try {
    let addressTypeCodes = cacheService.getAddressTypeCodes();
    return res.status(200).json(addressTypeCodes ? addressTypeCodes : []);
  } catch (e) {
    logApiError(
      e,
      "getAddressTypeCodes",
      "Error occurred while attempting to GET address type codes."
    );
    return errorResponse(res);
  }
}
async function getContactTypeCodes(_req, res) {
  try {
    let contactTypeCodes = cacheService.getContactTypeCodes();
    return res.status(200).json(contactTypeCodes ? contactTypeCodes : []);
  } catch (e) {
    logApiError(
      e,
      "contactTypeCodes",
      "Error occurred while attempting to GET address type codes."
    );
    return errorResponse(res);
  }
}

async function getGradeCodes(_req, res) {
  try {
    let gradeCodes = cacheService.getGradeCodes();
    return res.status(200).json(gradeCodes ? gradeCodes : []);
  } catch (e) {
    logApiError(
      e,
      "getGradeCodes",
      "Error occurred while attempting to GET grade codes."
    );
    return errorResponse(res);
  }
}

async function getFundingGroupCodes(_req, res) {
  try {
    let fundingGroupCodes = cacheService.getFundingGroupCodes();
    return res.status(200).json(fundingGroupCodes ? fundingGroupCodes : []);
  } catch (e) {
    logApiError(
      e,
      "fundingGroupCodes",
      "Error occurred while attempting to GET funding Group codes."
    );
    return errorResponse(res);
  }
}

async function getFacilityCodes(_req, res) {
  try {
    let facilityCodes = cacheService.getFacilityCodes();
    return res.status(200).json(facilityCodes ? facilityCodes : []);
  } catch (e) {
    logApiError(
      e,
      "getFacilityCodes",
      "Error occurred while attempting to GET facility codes."
    );
    return errorResponse(res);
  }
}
async function getCategoryCodes(_req, res) {
  try {
    let categoryCodes = cacheService.getCategoryCodes();
    return res.status(200).json(categoryCodes ? categoryCodes : []);
  } catch (e) {
    logApiError(
      e,
      "getCategoryCodes",
      "Error occurred while attempting to GET category codes."
    );
    return errorResponse(res);
  }
}

module.exports = {
  getAddressTypeCodes,
  getContactTypeCodes,
  getGradeCodes,
  getFundingGroupCodes,
  getFacilityCodes,
  getCategoryCodes,
};
