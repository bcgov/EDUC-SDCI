const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");

const axios = require("axios");
const { checkToken } = require("../components/auth");
const { createList, addDistrictLabels } = require("../components/utils");
const { listCache } = require("../components/cache");

const schoolListFields = ["mincode", "displayName"];
//Batch Routes
router.get("/contact-type-codes", checkToken, getContactTypeCodes);
router.get("/school/list", checkToken, getSchoolList);
//router.get('/authority/list', checkToken, getAuthorityList);
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

async function getSchoolList(req, res) {
  if (await !listCache.has("schoollist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/school`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const schoolList = createList(response.data, schoolListFields);
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
        const districtList = response.data;

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
module.exports = router;
