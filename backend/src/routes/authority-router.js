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

//Batch Routes
router.get("/:id", checkToken, getAuthority);

// async function removeItemsFromDistrictDataResponse(response, itemsToRemove) {
//   if (response && response.data) {
//     const newData = { ...response.data };

//     if (itemsToRemove && Array.isArray(itemsToRemove)) {
//       itemsToRemove.forEach(item => {
//         if (newData[item]) {
//           delete newData[item];
//         }
//       });
//     }

//     response.data = newData;
//   }
// }

async function getDistrictCodes(req) {
  if (!listCache.has("districtCodesList")) {
    const url = `${config.get(
      "server:instituteAPIURL"
    )}/institute/authority-contact-type-codes`; // Update the URL according to your API endpoint
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${req.accessToken}` },
      });
      const districtCodeList = response.data;
      listCache.set("districtCodesList", districtCodeList);
      return districtCodeList;
    } catch (e) {
      log.error(
        "getDistrictList Error",
        e.response ? e.response.status : e.message
      );
    }
  } else {
    const districtCodeList = await listCache.get("districtCodesList");
    return districtCodeList;
  }
}
// function getNonPublicContactTypeCodes(contactTypes) {

//   const nonPublicContactTypeCodes = [];

//   for (const contactType of contactTypes) {
//     if (!contactType.publiclyAvailable) {
//       nonPublicContactTypeCodes.push(contactType.districtContactTypeCode);
//     }
//   }

//   return nonPublicContactTypeCodes;
// }
// function removeContacts(districtDataResponse, nonPublicContactTypeCodes) {
//   const updatedDistrictData = { ...districtDataResponse };

//   if (updatedDistrictData.contacts && Array.isArray(updatedDistrictData.contacts)) {
//     updatedDistrictData.contacts = updatedDistrictData.contacts.filter(contact => {
//       return !nonPublicContactTypeCodes.includes(contact.districtContactTypeCode);
//     });
//   }

//   return updatedDistrictData;
// }
//api/v1/institute/district/12342525
async function getAuthority(req, res) {
  const { id } = req.params;
  const params = [
    {
      condition: null,
      searchCriteriaList: [
        {
          key: "independentAuthorityId",
          operation: "eq",
          value: id, // Convert id to a string
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
  )}/institute/authority/${id}`;
  const authoritySchoolsUrl = `${config.get(
    "server:instituteAPIURL"
  )}/institute/school/paginated?pageNumber=0&pageSize=10&searchCriteriaList=${encodedParams}`;

  try {
    const authorityDataResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });

    const authoritySchoolsResponse = await axios.get(authoritySchoolsUrl, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    // const contactTypeCodes = await getDistrictCodes(req)
    // const nonPublicContactTypeCodes = getNonPublicContactTypeCodes(contactTypeCodes)
    // const districtDataPublic =  removeContacts(districtDataResponse.data,nonPublicContactTypeCodes)
    const authorityJSON = {
      authorityData: authorityDataResponse.data,
      authoritySchools: authoritySchoolsResponse.data.content,
    };

    res.json(authorityJSON);
    log.info(req.url);
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
  }
}
module.exports = router;
