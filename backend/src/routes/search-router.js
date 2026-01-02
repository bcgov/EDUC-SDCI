const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");
const cacheService = require("../components/cache-service");
const { checkToken } = require("../components/auth");
const {
  addFundingGroups,
  addDistrictLabels,
} = require("../components/utils.js");

router.get("/schools/paginated", checkToken, getSchoolSearchResults);
router.get(
  "/districts/contact/paginated",
  checkToken,
  getDistrictContactSearchResults
);
router.get(
  "/district-contacts/:type",
  checkToken,
  getDistrictContactSearchResults2
);

// async function getSchoolSearchResults(req, res) {
//   const fundingGroups = cacheService.getFundingGroupCodes(req, res);
//   const encodedSearchCriteriaList = encodeURIComponent(
//     req.query?.searchCriteriaList || ""
//   );
//   const url = `${config.get(
//     "server:instituteAPIURL"
//   )}/institute/school/paginated?pageSize=${req.query?.pageSize}&pageNumber=${
//     req.query?.pageNumber
//   }&searchCriteriaList=${encodedSearchCriteriaList}`;

//   axios
//     .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
//     .then((response) => {
//       const results = response.data.content;
//       const resultsWithFundingGroups = addFundingGroups(results, fundingGroups);
//       // Remove the 'contacts' array from each object
//       const cleanedResults = resultsWithFundingGroups.map(
//         ({ notes, contacts, ...rest }) => rest
//       );

//       response.data.content = cleanedResults;

//       res.json(response.data);
//     })
//     .catch((e) => {
//       log.error("getData Error", e.response ? e.response.status : e.message);
//     });
// }
async function getSchoolSearchResults(req, res) {
  try {
    const fundingGroups = cacheService.getFundingGroupCodes(req, res);

    // Search Logic Here
    // ---------------------------------------------
    let currentDate = new Date().toISOString().substring(0, 19);

    const criteriaParams = [
      {
        condition: null,
        searchCriteriaList: [],
      },
    ];

    // Handle Jurisdiction (schoolCategoryCode)
    if (req.query.jurisdiction) {
      // Split string back into array to check length
      const jurisdictionList = req.query.jurisdiction.split(",");

      criteriaParams[0].searchCriteriaList.push({
        key: "schoolCategoryCode",
        operation: jurisdictionList.length > 1 ? "in" : "eq",
        value: req.query.jurisdiction, // Already comma-separated from frontend
        valueType: "STRING",
        condition: "AND",
      });
    }

    // Handle Type (facilityTypeCode)
    if (req.query.type) {
      criteriaParams[0].searchCriteriaList.push({
        key: "facilityTypeCode",
        operation: "in", // Your frontend logic always used 'in' for type
        value: req.query.type,
        valueType: "STRING",
        condition: "AND",
      });
    }

    // Always filter for OPEN schools (moved from frontend)
    criteriaParams[0].searchCriteriaList.push({
      key: "openedDate",
      operation: "lte",
      value: currentDate,
      valueType: "DATE_TIME",
      condition: "AND",
    });

    criteriaParams[0].searchCriteriaList.push({
      key: "closedDate",
      operation: "eq",
      value: null,
      valueType: "STRING",
      condition: "AND",
    });
    // ---------------------------------------------

    // Encode parameters for the downstream API
    const jsonString = JSON.stringify(criteriaParams);
    const encodedSearchCriteriaList = encodeURIComponent(jsonString);

    // Construct URL
    let downstreamUrl = `${config.get(
      "server:instituteAPIURL"
    )}/institute/school/paginated?pageSize=${req.query.pageSize}&pageNumber=${
      req.query.pageNumber
    }&searchCriteriaList=${encodedSearchCriteriaList}`;

    // Handle Sort
    // Note: Express parses "sort[key]=val" into an object req.query.sort = { key: val }
    if (req.query.sort) {
      // assuming downstream takes &sort[col]=DIR
      for (const [key, order] of Object.entries(req.query.sort)) {
        downstreamUrl += `&sort[${key}]=${order}`;
      }
    }

    // Call API
    const response = await axios.get(downstreamUrl, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });

    // Process Response (same as before)
    const results = response.data.content;
    const resultsWithFundingGroups = addFundingGroups(results, fundingGroups);

    const cleanedResults = resultsWithFundingGroups.map(
      ({ notes, contacts, ...rest }) => rest
    );

    response.data.content = cleanedResults;
    res.json(response.data);
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
        res.json(jsonData);
      } else {
        res.json(response.data);
      }
    })
    .catch((e) => {
      log.error("getData Error", e.response ? e.response.status : e.message);
    });
}

async function getDistrictContactSearchResults2(req, res) {
  try {
    const type = req.params?.type;
    const pageSize = req.query?.pageSize || 1000;
    const pageNumber = req.query?.pageNumber || 0;
    const sortField = req.query?.sortField;
    const sortOrder = req.query?.sortOrder;

    const currentDate = new Date().toISOString().substring(0, 19);
    // Build a single-group search criteria list (matches frontend shape)
    // criteria order: expiryDate eq null (OR), expiryDate gte now (OR),
    // effectiveDate lte now (AND), districtContactTypeCode eq type (AND)

    const params = [
      {
        condition: "AND",
        searchCriteriaList: [
          {
            key: "expiryDate",
            operation: "eq",
            value: null,
            valueType: "STRING",
            condition: "OR",
          },
          {
            key: "expiryDate",
            operation: "gte",
            value: currentDate,
            valueType: "DATE_TIME",
            condition: "OR",
          },
        ],
      },
      {
        condition: "AND",
        searchCriteriaList: [
          {
            key: "effectiveDate",
            operation: "lte",
            value: currentDate,
            valueType: "DATE_TIME",
            condition: null,
          },
        ],
      },
      {
        condition: "AND",
        searchCriteriaList: [
          {
            key: "districtContactTypeCode",
            operation: "eq",
            value: type,
            valueType: "STRING",
            condition: null,
          },
        ],
      },
    ];

    const encodedSearchCriteriaList = encodeURIComponent(
      JSON.stringify(params)
    );

    let url = `${config.get(
      "server:instituteAPIURL"
    )}/institute/district/contact/paginated?pageSize=${pageSize}&pageNumber=${pageNumber}&searchCriteriaList=${encodedSearchCriteriaList}`;
    if (sortField && sortOrder) {
      url += `&sort[${sortField}]=${sortOrder}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });

    let jsonData = response.data;

    jsonData = addDistrictLabels(jsonData, cacheService.getActiveDistricts());

    // Sort results by districtNumber ascending (numeric when possible)
    if (Array.isArray(jsonData.content)) {
      jsonData.content.sort((a, b) => {
        const aNum = Number(a.districtNumber);
        const bNum = Number(b.districtNumber);
        if (!Number.isFinite(aNum) || !Number.isFinite(bNum)) {
          return String(a.districtNumber).localeCompare(
            String(b.districtNumber)
          );
        }
        return aNum - bNum;
      });
    }

    // Filter out entries with missing/invalid districtNumber
    jsonData.content = jsonData.content.filter(
      (contact) =>
        contact.districtNumber !== undefined &&
        contact.districtNumber !== "" &&
        contact.districtNumber !== null
    );

    res.json(jsonData);
  } catch (e) {
    log.error(
      "getDistrictContactSearchResults2 Error",
      e.response ? e.response.status : e.message
    );
    res
      .status(500)
      .json({ error: "Failed to fetch district contact search results" });
  }
}

module.exports = router;
