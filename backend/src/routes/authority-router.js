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
const {appendMailingAddressDetailsAndRemoveAddresses, rearrangeAndRelabelObjectProperties} = require("../components/utils.js")
//Batch Routes
router.get("/all-mailing/:type", checkToken, getAllAuthorityMailing);
router.get("/:id", checkToken, getAuthority);
//router.get("/all-contacts", checkToken, getAllAuthorityContacts);


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

async function getAllAuthorityMailing(req, res) {
  const {type} = req.params

 const params = [
  {
    condition: null,
    searchCriteriaList: [
      {
        key: "closedDate",
        operation: "eq",
        value: null,
        valueType: "STRING",
        condition: "AND",
      },
      {
        key: "authorityTypeCode",
        operation: "eq",
        value: type,
        valueType: "STRING",
        condition: "AND",
      }      
    ]
  }]
  const jsonString = JSON.stringify(params);
  const encodedParams = encodeURIComponent(jsonString);
  const url = await `${config.get(
    "server:instituteAPIURL"
  )}/institute/authority/paginated?pageSize=1000&sort[authorityNumber]=ASC&searchCriteriaList=${encodedParams}`
  try {
    const authorityResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    const propertyOrder = [
      { property: "authorityNumber", label: "Number" },
      { property: "displayName", label: "Name" },
      { property: "mailingAddressLine1", label: "Address" },
      { property: "mailingAddressLine2", label: "Address Line 2" },
      { property: "mailingCity", label: "City" },
      { property: "mailingProvinceCode", label: "Province" },
      { property: "mailingPostal", label: "Postal Code" },
      { property: "phoneNumber", label: "Phone Number" },
      { property: "faxNumber", label: "Fax" },
      { property: "email", label: "Email" },
      { property: "authorityTypeCode", label: "Type" },
      { property: "closedDate", label: "Closed" },

    ];

    authorityResponse.data.content.forEach(appendMailingAddressDetailsAndRemoveAddresses);
  //   const includedFields = ['createUser', 'updateUser', 'districtContactTypeCode', 'label', 'description'];
  //   let content = normalizeJsonObject(districtContactResponse.data.content, contactTypeCodes.codesList.districtContactTypeCodes, 'districtContactTypeCode', (info) => info.publiclyAvailable === true, includedFields);
  //   content = normalizeJsonObject(content, districtList, 'districtId', null, ['displayName', 'districtNumber']);    
  //   content = sortJSONByDistrictNumber(content)
  authorityResponse.data.content.forEach((currentElement, index, array) => {
      const rearrangedElement = rearrangeAndRelabelObjectProperties(currentElement, propertyOrder);
      array[index] = rearrangedElement;
    });

   
    res.json(authorityResponse.data.content);
    //res.json(districtContactsReorderedAndRelabeled );
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
  }
}
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
