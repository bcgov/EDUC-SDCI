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
const {appendMailingAddressDetailsAndRemoveAddresses, rearrangeAndRelabelObjectProperties, addDistrictLabels, normalizeJsonObject, sortJSONByDistrictNumber} = require("../components/utils.js")

//Batch Routes
router.get("/all-contacts", checkToken, getAllDistrictContacts);
router.get("/all-mailing", checkToken, getAllDistrictMailing);
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

async function getDistrictCodes(req) {
  if (!listCache.has("districtCodesList")) {
    const url = `${config.get(
      "server:instituteAPIURL"
    )}/institute/district-contact-type-codes`; // Update the URL according to your API endpoint
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
function getNonPublicContactTypeCodes(contactTypes) {
  const nonPublicContactTypeCodes = [];

  for (const contactType of contactTypes) {
    if (!contactType.publiclyAvailable) {
      nonPublicContactTypeCodes.push(contactType.districtContactTypeCode);
    }
  }

  return nonPublicContactTypeCodes;
}
function addContactTypeLabels(districtDataResponse, nonPublicContactTypeCodes) {

  const updatedDistrictData = { ...districtDataResponse };
  if (
    updatedDistrictData.contacts &&
    Array.isArray(updatedDistrictData.contacts)
  ) {
    updatedDistrictData.contacts.forEach(contact => {
      const matchingType = nonPublicContactTypeCodes.find(
        codeObj => codeObj.districtContactTypeCode === contact.districtContactTypeCode
      );

      if (matchingType) {
        contact.label = matchingType.label;
      } else {
        
      }
    });
  }

  return updatedDistrictData;
}
function removeContacts(districtDataResponse, nonPublicContactTypeCodes) {
  const updatedDistrictData = { ...districtDataResponse };

  if (
    updatedDistrictData.contacts &&
    Array.isArray(updatedDistrictData.contacts)
  ) {
    updatedDistrictData.contacts = updatedDistrictData.contacts.filter(
      (contact) => {
        return !nonPublicContactTypeCodes.includes(
          contact.districtContactTypeCode
        );
      }
    );
  }

  return updatedDistrictData;
}
async function getAllDistrictContacts(req, res) {
  const districtList = await listCache.get("districtlist")
  const contactTypeCodes= await listCache.get("codesList")
  const url = await `${config.get(
    "server:instituteAPIURL"
  )}/institute/district/contact/paginated?pageSize=4000`
  try {
    const districtContactResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    const propertyOrder = [
      { property: "displayName", label: "District Name" },
      { property: "districtNumber", label: "District Number" },
      { property: "districtContactTypeCode", label: "District Contact" },
      { property: "description", label: "Contact Description" },
      { property: "firstName", label: "Contact First Name" },
      { property: "lastName", label: "Contact Last name" },
      { property: "jobTitle", label: "Position Title" },
      { property: "phoneNumber", label: "Contact Phone" },
      { property: "phoneExtension", label: "Contact Phone Extension" },
      { property: "email", label: "Contact Email" },
    ];

    //let content = addDistrictLabels(districtContactResponse.data,districtList);

    const includedFields = ['createUser', 'updateUser', 'districtContactTypeCode', 'label', 'description'];
    let content = normalizeJsonObject(districtContactResponse.data.content, contactTypeCodes.codesList.districtContactTypeCodes, 'districtContactTypeCode', (info) => info.publiclyAvailable === true, includedFields);
    content = normalizeJsonObject(content, districtList, 'districtId', null, ['displayName', 'districtNumber']);    
    content = sortJSONByDistrictNumber(content)
    content.forEach((currentElement, index, array) => {
      const rearrangedElement = rearrangeAndRelabelObjectProperties(currentElement, propertyOrder);
      array[index] = rearrangedElement;
    });
    res.json(content);
    //res.json(districtContactsReorderedAndRelabeled );
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
  }
}


async function getAllDistrictMailing(req, res) {
  const districtList = await listCache.get("districtlist")
  const contactTypeCodes= await listCache.get("codesList")

  const propertyOrder = [
    { property: "displayName", label: "District Name" },
    { property: "districtNumber", label: "districtNumber" },
    { property: "mailingAddressLine1", label: "Address Line 1" },
    { property: "mailingAddressLine2", label: "Address Line 2" },
    { property: "mailingCity", label: "City" },
    { property: "mailingPostal", label: "Postal" },
    { property: "mailingProvinceCode", label: "Province" },
    { property: "mailingCountryCode", label: "Country" },

    { property: "physicalAddressLine1", label: "Courier Address Line 1" },
    { property: "physicalAddressLine2", label: "Courier Address Line 2" },
    { property: "physicalCity", label: "Courier City" },
    { property: "physicalPostal", label: "Courier Postal" },
    { property: "physicalProvinceCode", label: "Courier Province" },
    { property: "physicalCountryCode", label: "Courier Country" },    
    { property: "districtRegionCode", label: "Courier Region" },
    { property: "phoneNumber", label: "Phone" },
    { property: "faxNumber", label: "Fax" },
    { property: "email", label: "Email" },
    { property: "website", label: "Website" },
    
  ];

 const params = [
  {
    condition: null,
    searchCriteriaList: [
      {
        key: "districtStatusCode",
        operation: "eq",
        value: "ACTIVE",
        valueType: "STRING",
        condition: "AND",
      },
    ],
  }]
  const jsonString = JSON.stringify(params);
  const encodedParams = encodeURIComponent(jsonString);
  const url = await `${config.get(
    "server:instituteAPIURL"
  )}/institute/district/paginated?pageSize=100&sort["districtNumber"]=ASC&searchCriteriaList=${encodedParams}`
  

  try {
    const districtContactResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
      
    districtContactResponse.data.content.forEach(appendMailingAddressDetailsAndRemoveAddresses);
    
    
    const content = normalizeJsonObject(districtContactResponse.data.content, districtList, 'districtId', null, ['displayName', 'districtNumber']);  
    content.forEach((currentElement, index, array) => {
      const rearrangedElement = rearrangeAndRelabelObjectProperties(currentElement, propertyOrder);
      array[index] = rearrangedElement;
    });
    const contentByDistrict = sortJSONByDistrictNumber(content)

    res.json(contentByDistrict);
    //res.json(districtContactsReorderedAndRelabeled );
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
  }
}

//api/v1/institute/district/12342525
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
  )}/institute/school/paginated?pageNumber=0&pageSize=500&searchCriteriaList=${encodedParams}`;

  try {
    const districtDataResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    const districtSchoolsResponse = await axios.get(districtSchoolsUrl, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    const contactTypeCodes = await getDistrictCodes(req);
    const nonPublicContactTypeCodes = getNonPublicContactTypeCodes(contactTypeCodes);
    const districtDataPublic = removeContacts(
      districtDataResponse.data,
      nonPublicContactTypeCodes
    );
    const districtDataPublicWithLabels = addContactTypeLabels(
      districtDataPublic,
      contactTypeCodes
    );
  
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
