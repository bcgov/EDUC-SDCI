const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const NodeCache = require("node-cache");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { checkToken } = require("../components/auth");
const cacheService = require("../components/cache-service");
const {
  addFundingGroups,
  addDistrictLabels,
} = require("../components/utils.js");
//Batch Routes
router.get("/schools/paginated", checkToken, getSchoolSearchResults);
router.get(
  "/districts/contact/paginated",
  checkToken,
  getDistrictContactSearchResults
);

async function getSchoolSearchResults(req, res) {
  const fundingGroups = cacheService.getFundingGroupCodes(req, res);
  const encodedSearchCriteriaList = encodeURIComponent(
    req.query?.searchCriteriaList || ""
  );
  const url = `${config.get(
    "server:instituteAPIURL"
  )}/institute/school/paginated?pageSize=${req.query?.pageSize}&pageNumber=${
    req.query?.pageNumber
  }&searchCriteriaList=${encodedSearchCriteriaList}`;

  axios
    .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
    .then((response) => {
      const results = response.data.content;
      const resultsWithFundingGroups = addFundingGroups(results, fundingGroups);

      // Remove the 'contacts' array from each object
      const cleanedResults = resultsWithFundingGroups.map(
        ({ notes, contacts, ...rest }) => rest
      );

      response.data.content = cleanedResults;

      res.json(response.data);
    })
    .catch((e) => {
      log.error("getData Error", e.response ? e.response.status : e.message);
    });
}
async function getDistrictContactSearchResults(req, res) {
  const encodedSearchCriteriaList = encodeURIComponent(
    req.query?.searchCriteriaList || ""
  );
  const url = `${config.get(
    "server:instituteAPIURL"
  )}/institute/district/contact/paginated?pageSize=${
    req.query?.pageSize
  }&pageNumber=${
    req.query?.pageNumber
  }&searchCriteriaList=${encodedSearchCriteriaList}`;

  // // Get valid districtContactTypeCode values
  const validTypeCodes = cacheService.getContactTypeCodes();

  axios
    .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
    .then((response) => {
      if (req.url.includes("/districts/contact/paginated")) {
        let jsonData = response.data;

        jsonData = addDistrictLabels(
          response.data,
          cacheService.getActiveDistricts()
        );

        // Filter out entries with missing/invalid districtNumber
        jsonData.content = jsonData.content.filter(
          (contact) =>
            contact.districtNumber !== undefined &&
            contact.districtNumber !== "" &&
            contact.districtNumber !== null
        );

        // Keep only contacts with valid districtContactTypeCode
        console.log(validTypeCodes);
        // jsonData.content = jsonData.content.filter((contact) =>
        //   validTypeCodes.includes(contact.districtContactTypeCode)
        // );

        res.json(jsonData);
      } else {
        res.json(response.data);
      }
    })
    .catch((e) => {
      log.error("getData Error", e.response ? e.response.status : e.message);
    });
}

module.exports = router;
