const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const NodeCache = require("node-cache");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { checkToken } = require("../components/auth");
const { listCache } = require("../components/cache");
const {
  getDistrictCodes,
  getNonPublicContactTypeCodes,
  removeContacts,
} = require("../components/utils");
//Batch Routes
router.get("/:id", checkToken, getDistrict);

async function removeItemsFromDistrictDataResponse(response, itemsToRemove) {
  if (response && response.data) {
    const newData = { ...response.data };

    if (itemsToRemove && Array.isArray(itemsToRemove)) {
      itemsToRemove.forEach((item) => {
        if (newData[item]) {
          delete newData[item];
        }
      });
    }

    response.data = newData;
  }
}

function addContactTypeLabels(districtDataResponse, nonPublicContactTypeCodes) {
  const updatedDistrictData = { ...districtDataResponse };
  if (
    updatedDistrictData.contacts &&
    Array.isArray(updatedDistrictData.contacts)
  ) {
    updatedDistrictData.contacts.forEach((contact) => {
      const matchingType = nonPublicContactTypeCodes.find(
        (codeObj) =>
          codeObj.districtContactTypeCode === contact.districtContactTypeCode
      );

      if (matchingType) {
        contact.label = matchingType.label;
      } else {
      }
    });
  }

  return updatedDistrictData;
}

async function getDistrict(req, res) {
  const { id } = req.params;

  const params = [
    {
      condition: null,
      searchCriteriaList: [
        {
          key: "districtID",
          operation: "eq",
          value: id,
          valueType: "UUID",
          condition: "AND",
        },
      ],
    },
  ];

  const jsonString = JSON.stringify(params);
  const encodedParams = encodeURIComponent(jsonString);

  const url = `${config.get(
    "server:instituteAPIURL"
  )}/institute/district/${id}`;
  const districtSchoolsUrl = `${config.get(
    "server:instituteAPIURL"
  )}/institute/school/paginated?pageNumber=0&pageSize=100&searchCriteriaList=${encodedParams}`;

  try {
    const districtDataResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    const districtSchoolsResponse = await axios.get(districtSchoolsUrl, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });

    const contactTypeCodes = await getDistrictCodes(req);
    const nonPublicContactTypeCodes =
      getNonPublicContactTypeCodes(contactTypeCodes);

    const districtDataPublic = removeContacts(
      districtDataResponse.data,
      nonPublicContactTypeCodes
    );
    const districtDataPublicWithLabels = addContactTypeLabels(
      districtDataPublic,
      contactTypeCodes
    );
    // console.log(districtDataPublic);
    const districtJSON = {
      districtData: districtDataPublicWithLabels,
      districtSchools: districtSchoolsResponse.data.content,
    };

    res.json(districtJSON);
    log.info(req.url);
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
  }
}
module.exports = router;
