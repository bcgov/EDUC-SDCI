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
  addFundingGroups,
  getArrayofPubliclyAvailableCodes,
  filterRemoveByField,
  filterByExpiryDate,
  getArrayofNonPubliclyAvailableCodes,
  filterByField,
  appendMailingAddressDetailsAndRemoveAddresses,
  rearrangeAndRelabelObjectProperties,
  addDistrictLabels,
  normalizeJsonObject,
  sortJSONByDistrictNumber,
  removeFieldsByCriteria,
  filterByPubliclyAvailableCodes,
} = require("../components/utils.js");

//Batch Routes
router.get("/all-contacts", checkToken, getAllDistrictContacts);
router.get("/all-mailing", checkToken, getAllDistrictMailing);
router.get("/:id", checkToken, getDistrict);

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
    updatedDistrictData.contacts.forEach((contact) => {
      const matchingType = nonPublicContactTypeCodes?.find(
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
async function getAllDistrictContacts(req, res) {
  const districtList = await listCache.get("districtlist");
  const contactTypeCodes = await listCache.get("codesList");
  const districtAddresses = await listCache.get("districtAddresses");

  let currentDate = new Date().toISOString().substring(0, 19);
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
          condition: "AND",
        },
      ],
    },
  ];
  const jsonString = JSON.stringify(params);
  const encodedParams = encodeURIComponent(jsonString);
  const url = await `${config.get(
    "server:instituteAPIURL"
  )}/institute/district/contact/paginated?pageSize=4000&searchCriteriaList=${encodedParams}`;
  try {
    const districtContactResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    const propertyOrder = [
      { property: "districtId_districtNumber", label: "District Number" },
      { property: "districtId_displayName", label: "District Name" },
      {
        property: "districtContactTypeCode_description",
        label: "District Contact",
      },
      { property: "firstName", label: "Contact First Name" },
      { property: "lastName", label: "Contact Last name" },
      { property: "jobTitle", label: "Position Title" },
      { property: "districtContactTypeCode_label", label: "Contact Type" },
      { property: "districtId_mailing_addressLine1", label: "Address Line 1" },
      { property: "districtId_mailing_addressLine2", label: "Address Line 2" },
      { property: "districtId_mailing_city", label: "City" },
      { property: "districtId_mailing_provinceCode", label: "Province" },
      { property: "districtId_mailing_postal", label: "Postal Code" },
      { property: "districtId_mailing_countryCode", label: "Country" },
      {
        property: "districtId_physical_addressLine1",
        label: "Courier Address Line 1",
      },
      {
        property: "districtId_physical_addressLine2",
        label: "Courier Address Line 2",
      },
      { property: "districtId_physical_city", label: "Courier City" },
      {
        property: "districtId_physical_provinceCode",
        label: "Courier Province",
      },
      { property: "districtId_physical_postal", label: "Courier Postal Code" },
      { property: "districtId_physical_countryCode", label: "Courier Country" },
      { property: "phoneNumber", label: "Contact Phone" },
      { property: "phoneExtension", label: "Contact Phone Extension" },
      { property: "email", label: "Contact Email" },
    ];

    const includedFields = ["districtContactTypeCode", "label", "description"];
    let content = normalizeJsonObject(
      districtContactResponse.data.content,
      contactTypeCodes.codesList.districtContactTypeCodes,
      "districtContactTypeCode",
      (info) => info.publiclyAvailable === true,
      includedFields
    );
    content = normalizeJsonObject(
      content,
      districtAddresses,
      "districtId",
      null,
      [
        "mailing_addressLine1",
        "mailing_addressLine2",
        "mailing_city",
        "mailing_postal",
        "mailing_provinceCode",
        "mailing_countryCode",
        "mailing_districtAddressId",
        "mailing_districtId",
        "physical_addressLine1",
        "physical_addressLine2",
        "physical_city",
        "physical_postal",
        "physical_provinceCode",
        "physical_countryCode",
      ]
    );
    content = normalizeJsonObject(content, districtList, "districtId", null, [
      "displayName",
      "districtNumber",
    ]);
    content = filterByPubliclyAvailableCodes(
      content,
      "districtContactTypeCode",
      getArrayofPubliclyAvailableCodes(
        contactTypeCodes.codesList.districtContactTypeCodes,
        "districtContactTypeCode"
      )
    );
    content = filterByExpiryDate(content);

    let filteredData = filterByField(content, "districtId_districtNumber", [
      "",
    ]);
    filteredData.forEach((currentElement, index, array) => {
      const rearrangedElement = rearrangeAndRelabelObjectProperties(
        currentElement,
        propertyOrder
      );
      array[index] = rearrangedElement;
    });
    let sortedData = sortJSONByDistrictNumber(filteredData);
    res.json(sortedData);
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
  }
}

async function getAllDistrictMailing(req, res) {
  const districtList = await listCache.get("districtlist");
  const contactTypeCodes = await listCache.get("codesList");

  const propertyOrder = [
    { property: "districtId_districtNumber", label: "District Number" },
    { property: "districtId_displayName", label: "District Name" },
    { property: "mailingAddressLine1", label: "Address Line 1" },
    { property: "mailingAddressLine2", label: "Address Line 2" },
    { property: "mailingCity", label: "City" },
    { property: "mailingProvinceCode", label: "Province" },
    { property: "mailingPostal", label: "Postal Code" },
    { property: "mailingCountryCode", label: "Country" },
    { property: "physicalAddressLine1", label: "Courier Address Line 1" },
    { property: "physicalAddressLine2", label: "Courier Address Line 2" },
    { property: "physicalCity", label: "Courier City" },
    { property: "physicalProvinceCode", label: "Courier Province" },
    { property: "physicalPostal", label: "Courier Postal Code" },
    { property: "physicalCountryCode", label: "Courier Country" },
    { property: "website", label: "Web Address" },
    { property: "phoneNumber", label: "Phone" },
    { property: "faxNumber", label: "Fax" },
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
    },
  ];
  const jsonString = JSON.stringify(params);
  const encodedParams = encodeURIComponent(jsonString);
  const url = await `${config.get(
    "server:instituteAPIURL"
  )}/institute/district/paginated?pageSize=100&sort["districtNumber"]=ASC&searchCriteriaList=${encodedParams}`;

  try {
    const districtContactResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });

    districtContactResponse.data.content.forEach(
      appendMailingAddressDetailsAndRemoveAddresses
    );

    const contentWithDistrictLabels = normalizeJsonObject(
      districtContactResponse.data.content,
      districtList,
      "districtId",
      null,
      ["displayName", "districtNumber"]
    );
    let content = filterByField(
      contentWithDistrictLabels,
      "districtId_districtNumber",
      [""]
    );
    content.forEach((currentElement, index, array) => {
      const rearrangedElement = rearrangeAndRelabelObjectProperties(
        currentElement,
        propertyOrder
      );
      array[index] = rearrangedElement;
    });
    const contentByDistrict = sortJSONByDistrictNumber(content);

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
        {
          key: "closedDate",
          operation: "eq",
          value: null,
          valueType: "STRING",
          condition: "AND",
        },
        {
          key: "schoolCategoryCode",
          operation: "neq",
          value: "FED_BAND",
          valueType: "STRING",
          condition: "AND",
        },
        {
          key: "facilityTypeCode",
          operation: "neq",
          value: "SUMMER",
          valueType: "STRING",
          condition: "AND",
        },
        {
          key: "facilityTypeCode",
          operation: "neq",
          value: "POST_SEC",
          valueType: "STRING",
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
    const schoolCategoryCodes = await listCache.get("categoryCodes");
    const facilityCodes = await listCache.get("facilityCodes");
    const fundingGroups = await listCache.get("fundingGroups");
    const districtContactCodeTypes = await listCache.get("codesList");
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
    districtDataPublicWithLabels.contacts = filterByPubliclyAvailableCodes(
      districtDataPublicWithLabels.contacts,
      "districtContactTypeCode",
      getArrayofPubliclyAvailableCodes(
        districtContactCodeTypes.codesList.districtContactTypeCodes,
        "districtContactTypeCode"
      )
    );
    districtDataPublicWithLabels.contacts = filterByExpiryDate(
      districtDataPublicWithLabels.contacts
    );

    districtSchoolsResponse.data.content = normalizeJsonObject(
      districtSchoolsResponse.data.content,
      schoolCategoryCodes,
      "schoolCategoryCode",
      null,
      ["label", "description"]
    );
    districtSchoolsResponse.data.content = normalizeJsonObject(
      districtSchoolsResponse.data.content,
      facilityCodes,
      "faciltyTypeCode",
      null,
      ["label", "description"]
    );
    districtSchoolsResponse.data.content = addFundingGroups(
      districtSchoolsResponse.data.content,
      fundingGroups
    );

    const today = new Date();
    const filteredSchoolsResponse = districtSchoolsResponse.data.content.filter(
      (obj) => {
        // if openedDate is a valid date is less than today, keep the object
        const openedDate = new Date(obj.openedDate);

        // If closedDate is a valid date greater than today, keep the object
        const closedDate = new Date(obj.closedDate);

        // return obj IF closedDate does not exist OR is after than current date
        // AND openedDate exists AND is before current date
        return (
          (!obj.closedDate || closedDate > today) &&
          obj.openedDate &&
          openedDate < today
        );
      }
    );
    const districtJSON = {
      districtData: districtDataPublicWithLabels,
      districtSchools: filteredSchoolsResponse,
    };

    res.json(districtJSON);
    log.info(req.url);
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
  }
}
module.exports = router;
