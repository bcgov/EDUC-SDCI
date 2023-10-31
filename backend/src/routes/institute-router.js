const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");

const axios = require("axios");
const { checkToken } = require("../components/auth");
const { createList, addDistrictLabels, districtNumberSort, isAllowedSchoolCategory } = require("../components/utils");
const { listCache } = require("../components/cache");

const schoolListOptions = { fields: ["mincode", "displayName", "schoolId"], fieldToInclude: "closedDate", valueToInclude: null, sortField: "mincode" };
const districtListOptions = { fields: ["displayName", "districtId","districtNumber"] ,fieldToInclude: "districtStatusCode", valueToInclude: "ACTIVE", sortField: "districtNumber"};
const authorityListOptions = { fields: ["displayName", "authorityNumber","independentAuthorityId"], fieldToInclude: "closedDate", valueToInclude: null, sortField: "authorityNumber" };
const openSchoolListOptions = { fields: [
  "schoolId",
  "districtId",
  "mincode",
  "schoolNumber",
  "faxNumber",
  "phoneNumber",
  "email",
  "website",
  "displayName",
  "schoolCategoryCode",
  "facilityTypeCode",
  "openedDate",
  "closedDate",
  "districtNumber"
],fieldToInclude: "closedDate", valueToInclude: null, sortField: "mincode" };

//Batch Routes
router.get("/contact-type-codes", checkToken, getContactTypeCodes);
router.get("/grade-codes", checkToken, getGradeCodes);
router.get("/offshore-school/list", checkToken, getOffshoreSchoolList);
// router.get("/school", checkToken, getOpenSchools);
router.get("/school/list", checkToken, getSchoolList);
router.get("/authority/list", checkToken, getAuthorityList);
router.get("/district/list", checkToken, getDistrictList);
router.get("/district/contact/*", checkToken, getDistrictContactsAPI);
router.get("/*", checkToken, getInstituteAPI);

async function getContactTypeCodes(req, res) {
  if (await !listCache.has("codesList")) {
    console.log("GETTING NEW SCHOOL LIST");

    //const codes = [];

    try {
      const authorityContactTypeCodesResponse = await axios.get(
        `${config.get(
          "server:instituteAPIURL"
        )}/institute/authority-contact-type-codes`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );

      const districtContactTypeCodesResponse = await axios.get(
        `${config.get(
          "server:instituteAPIURL"
        )}/institute/district-contact-type-codes`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );

      const schoolContactTypeCodesResponse = await axios.get(
        `${config.get(
          "server:instituteAPIURL"
        )}/institute/school-contact-type-codes`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );

      const codes = {
        authorityContactTypeCodes: authorityContactTypeCodesResponse.data,
        districtContactTypeCodes: districtContactTypeCodesResponse.data,
        schoolContactTypeCodes: schoolContactTypeCodesResponse.data,
      };

      res.json(codes);
      listCache.set("codesList", { codesList: codes });
      log.info(req.url);
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("getSchoolsList Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
    listCache.set("codesList", codes);
  } else {
    console.log("USING SCHOOL LIST CACHE");
    const cachedCodeList = await listCache.get("codesList");
    res.json(cachedCodeList);
  }
}
async function getOffshoreSchoolList(req, res) {

  if (await !listCache.has("offshoreschoollist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/school/paginated?pageSize=100&pageNumber=0&searchCriteriaList=%5B%7B%22condition%22%3Anull%2C%22searchCriteriaList%22%3A%5B%7B%22key%22%3A%22schoolCategoryCode%22%2C%22operation%22%3A%22eq%22%2C%22value%22%3A%22OFFSHORE%22%2C%22valueType%22%3A%22STRING%22%2C%22condition%22%3A%22AND%22%7D%2C%7B%22key%22%3A%22openedDate%22%2C%22operation%22%3A%22lte%22%2C%22value%22%3A%222023-09-27T17%3A57%3A46%22%2C%22valueType%22%3A%22DATE_TIME%22%2C%22condition%22%3A%22AND%22%7D%2C%7B%22key%22%3A%22closedDate%22%2C%22operation%22%3A%22eq%22%2C%22value%22%3Anull%2C%22valueType%22%3A%22STRING%22%2C%22condition%22%3A%22AND%22%7D%5D%7D%5D`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const offshoreSchoolList = response.data.content;
        res.json(offshoreSchoolList);
        listCache.set("offshoreschoollist", offshoreSchoolList);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getSchoolsList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const offshoreSchoolList = await listCache.get("offshoreschoollist");
    res.json(offshoreSchoolList);
  }
}
async function getAuthorityList(req, res) {

  if (await !listCache.has("authoritylist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/authority`;
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const authorityList = createList(response.data, authorityListOptions);
        
        res.json(authorityList);
        listCache.set("authoritylist", authorityList);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "authorityList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const authorityList = await listCache.get("authoritylist");
    res.json(authorityList);
  }
}
async function getOpenSchools(req, res) {
   

  if (await !listCache.has("openschoollist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/school`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const openSchoolList = createList(response.data, openSchoolListOptions);
        res.json(openSchoolList);
        listCache.set("openschoollist", openSchoolList);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getSchoolsList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const openSchoolList = await listCache.get("openschoollist");
    res.json(openSchoolList);
  }
}
async function getSchoolList(req, res) {
  if (await !listCache.has("schoollist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/school`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const schoolList = createList(response.data, schoolListOptions);
        res.json(schoolList);
        listCache.set("schoollist", schoolList);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getSchoolsList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const schoolList = await listCache.get("schoollist");
    res.json(schoolList);
  }
}
async function getDistrictList(req, res) {
  if (await !listCache.has("districtlist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/district`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        //const districtList = response.data;
        const districtList = createList(response.data, districtListOptions);
        listCache.set("districtlist", districtList);
        res.json(districtList);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getDistrictList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const districtList = await listCache.get("districtlist");
    res.json(districtList);
  }
}
async function getInstituteAPI(req, res) {
  const url = `${config.get("server:instituteAPIURL")}/institute` + req.url;

  axios
    .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
    .then((response) => {
      res.json(response.data);
      log.info(req.url);
    })
    .catch((e) => {
      log.error("getData Error", e.response ? e.response.status : e.message);
    });
}

async function getDistrictContactsAPI(req, res) {
  const url = `${config.get("server:instituteAPIURL")}/institute` + req.url;

  const districtList = await listCache.get("districtlist");

  axios
    .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
    .then((response) => {
      if (req.url.includes("/district/contact/paginated")) {
        const jsonData = addDistrictLabels(response.data, districtList);
        res.json(jsonData);
      } else {
        res.json(response.data);
      }
    })
    .catch((e) => {
      log.error("getData Error", e.response ? e.response.status : e.message);
    });
}

async function getGradeCodes(req, res) {
  if (await !codeCache.has("gradelist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/grade-codes`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        //const districtList = response.data;
        const gradeCodes = response.data;
        codeCache.set("gradelist", gradeList);
        res.json(gradeCodes);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getDistrictList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const gradeList = await codeCache.get("gradelist");
    res.json(gradeList);
  }
}
module.exports = router;
