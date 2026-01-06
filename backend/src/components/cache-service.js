"use strict";
const config = require("../config/index");
const log = require("../components/logger");
const { auth } = require("../components/auth");
const {
  utils,
  addFundingGroups,
  appendMailingAddressDetailsAndRemoveAddresses,
  sortJSONByKey,
} = require("../components/utils");

const retry = require("async-retry");
const { generateSchoolObject, isSchoolActive } = require("./schoolUtils");
const {
  generateDistrictObject,
  isDistrictActive,
  isBCDistrict,
  generateAuthorityObject,
  isAuthorityActive,
} = require("./districtUtils");
const { isActiveDateRange } = require("../util/dateUtils");
const jsonExport = require("jsonexport");
const path = require("path");
const fs = require("fs");
const {
  EXCLUDED_FACILITY_TYPES,
  EXCLUDED_SCHOOL_CATEGORY_CODES,
} = require("../util/constants");

let schoolMap = new Map();
let schools = [];
let districts = [];
let districtsMap = new Map();
let districtsNumber_ID_Map = new Map();
let districtID_Name_Map = new Map();
let authorities = [];
let authoritiesMap = new Map();
let activeAuthorities = [];
let mincode_school_ID_Map = new Map();
let activeSchools = [];
let activeDistricts = [];
let addressTypeCodes = [];
let schoolCategoryCodes = [];
let contactTypeCodes = {};
let facilityCodes = [];
let gradeCodes = [];
let fundingGroups = [];

const cacheService = {
  async loadAllSchoolsToMap() {
    await retry(
      async () => {
        schools = []; // reset the value.
        schoolMap.clear(); // reset the value.
        mincode_school_ID_Map.clear();
        activeSchools = [];

        const data = await auth.getApiCredentials(
          config.get("oidc:clientId"),
          config.get("oidc:clientSecret"),
          "client_credentials",
          "profile openid"
        ); // get the tokens first to make api calls.
        const schoolsResponse = await utils.getData(
          data.accessToken,
          `${config.get(
            "server:instituteAPIURL"
          )}/institute/school/paginated?pageSize=800`
        );
        const schoolsData = schoolsResponse.content;
        // remove contacts that are not publiclyAvailable

        const schoolsWithPubliclyAvailableContacts = schoolsData
          .filter((school) => {
            return facilityCodes.some(
              (fc) => fc.facilityTypeCode === school.facilityTypeCode
            );
          })
          .map((school) => {
            return {
              ...school,
              contacts: (school.contacts || [])
                .filter((contact) => {
                  // find the matching contact code object
                  const match =
                    contactTypeCodes.codesList.schoolContactTypeCodes.find(
                      (codeObj) =>
                        codeObj.schoolContactTypeCode ===
                          contact.schoolContactTypeCode &&
                        codeObj.publiclyAvailable === true
                    );
                  // only keep contacts with a publiclyAvailable code

                  return !!match;
                })
                .map((contact) => {
                  const match =
                    contactTypeCodes.codesList.schoolContactTypeCodes.find(
                      (codeObj) =>
                        codeObj.schoolContactTypeCode ===
                        contact.schoolContactTypeCode
                    );
                  return {
                    ...contact,
                    schoolContactTypeCode_label: match ? match.label : null,
                    schoolContactTypeCode_description: match
                      ? match.description
                      : null,
                  };
                }),
            };
          });

        const schoolsToLoadToCache = [
          ...schoolsWithPubliclyAvailableContacts,
        ].sort((a, b) => a.mincode.localeCompare(b.mincode));
        if (schoolsToLoadToCache && schoolsToLoadToCache.length > 0) {
          for (const school of schoolsToLoadToCache) {
            let schoolObject = generateSchoolObject(school, gradeCodes);

            if (isSchoolActive(schoolObject)) {
              schoolObject.districtNumber = this.getDistrictNumber(
                school.districtId
              );
              //add fundingGroups to school

              schoolObject = addFundingGroups(schoolObject);

              schoolMap.set(schoolObject.schoolId, schoolObject);
              mincode_school_ID_Map.set(
                schoolObject.mincode,
                schoolObject.schoolId
              );
              schools.push(schoolObject);
              activeSchools.push(schoolObject);
            }
          }
        }
        log.info(`Loaded ${schoolMap.size} schools.`);
        log.info(`Loaded ${activeSchools.length} active schools.`);
      },
      {
        retries: 10,
      }
    );
  },
  async loadAddressTypeCodes() {
    await retry(
      async () => {
        // if anything throws, we retry
        const data = await auth.getApiCredentials(
          config.get("oidc:clientId"),
          config.get("oidc:clientSecret"),
          "client_credentials",
          "profile openid"
        ); // get the tokens first to make api calls.
        const addressTypeCodesResponse = await utils.getData(
          data.accessToken,
          `${config.get("server:instituteAPIURL")}/institute/address-type-codes`
        );
        addressTypeCodes = []; // reset the value.
        if (addressTypeCodesResponse && addressTypeCodesResponse.length > 0) {
          addressTypeCodes = addressTypeCodesResponse;
        }
        log.info(`Loaded ${addressTypeCodes.length} address type codes.`);
      },
      {
        retries: 10,
      }
    );
  },
  async loadSchoolCategoryCodes() {
    await retry(
      async () => {
        // Get API access token
        const data = await auth.getApiCredentials(
          config.get("oidc:clientId"),
          config.get("oidc:clientSecret"),
          "client_credentials",
          "profile openid"
        );

        // Fetch category codes from the API
        const categoryCodesResponse = await utils.getData(
          data.accessToken,
          `${config.get("server:instituteAPIURL")}/institute/category-codes`
        );

        // Reset and filter the category codes
        schoolCategoryCodes = [];

        if (
          Array.isArray(categoryCodesResponse) &&
          categoryCodesResponse.length > 0
        ) {
          // Filter out unwanted codes and keep only currently active ones
          schoolCategoryCodes = categoryCodesResponse.filter((code) => {
            // Exclude unwanted school category codes
            if (
              EXCLUDED_SCHOOL_CATEGORY_CODES.includes(code.schoolCategoryCode)
            ) {
              return false;
            }
            // Only include codes active based on effective and expiry dates
            return isActiveDateRange(code.effectiveDate, code.expiryDate);
          });
        }
        log.info(`Loaded ${schoolCategoryCodes.length} school category codes.`);
      },
      {
        retries: 10,
      }
    );
  },
  async loadFacilityCodes() {
    await retry(
      async () => {
        const accessToken = (
          await auth.getApiCredentials(
            config.get("oidc:clientId"),
            config.get("oidc:clientSecret"),
            "client_credentials",
            "profile openid"
          )
        )?.accessToken;

        if (!accessToken) {
          throw new Error("Failed to retrieve access token.");
        }
        const url = `${config.get(
          "server:instituteAPIURL"
        )}/institute/facility-codes`;
        const response = await utils.getData(accessToken, url);

        facilityCodes = (Array.isArray(response) ? response : []).filter(
          (code) => !EXCLUDED_FACILITY_TYPES.includes(code.facilityTypeCode)
        );

        log.info(
          `Loaded ${facilityCodes.length} facility codes (after filtering).`
        );
      },
      {
        retries: 10,
      }
    );
  },
  async loadGradeCodes() {
    await retry(
      async () => {
        // if anything throws, we retry
        const data = await auth.getApiCredentials(
          config.get("oidc:clientId"),
          config.get("oidc:clientSecret"),
          "client_credentials",
          "profile openid"
        ); // get the tokens first to make api calls.
        const gradeCodesResponse = await utils.getData(
          data.accessToken,
          `${config.get("server:instituteAPIURL")}/institute/grade-codes`
        );
        gradeCodes = []; // reset the value.
        if (gradeCodesResponse && gradeCodesResponse.length > 0) {
          gradeCodes = gradeCodesResponse;
        }
        log.info(`Loaded ${gradeCodes.length} grade codes.`);
      },
      {
        retries: 10,
      }
    );
  },
  async loadContactTypeCodes() {
    await retry(
      async () => {
        const data = await auth.getApiCredentials(
          config.get("oidc:clientId"),
          config.get("oidc:clientSecret"),
          "client_credentials",
          "profile openid"
        ); // get the tokens first to make api calls.
        const schoolContactTypeCodesResponse = await utils.getData(
          data.accessToken,
          `${config.get(
            "server:instituteAPIURL"
          )}/institute/school-contact-type-codes`
        );
        const districtContactTypeCodesResponse = await utils.getData(
          data.accessToken,
          `${config.get(
            "server:instituteAPIURL"
          )}/institute/district-contact-type-codes`
        );
        const authorityContactTypeCodesResponse = await utils.getData(
          data.accessToken,
          `${config.get(
            "server:instituteAPIURL"
          )}/institute/authority-contact-type-codes`
        );

        let schoolContactTypeCodes;
        let districtContactTypeCodes;
        let authorityContactTypeCodes;

        if (
          schoolContactTypeCodesResponse &&
          schoolContactTypeCodesResponse.length > 0
        ) {
          schoolContactTypeCodes = schoolContactTypeCodesResponse.filter(
            (code) => code.publiclyAvailable === true
          );
        }

        if (
          districtContactTypeCodesResponse &&
          districtContactTypeCodesResponse.length > 0
        ) {
          districtContactTypeCodes = districtContactTypeCodesResponse.filter(
            (code) => code.publiclyAvailable === true
          );
        }
        if (
          authorityContactTypeCodesResponse &&
          authorityContactTypeCodesResponse.length > 0
        ) {
          authorityContactTypeCodes = authorityContactTypeCodesResponse.filter(
            (code) => code.publiclyAvailable === true
          );
        }

        contactTypeCodes = {
          codesList: {
            authorityContactTypeCodes: authorityContactTypeCodes,
            districtContactTypeCodes: districtContactTypeCodes,
            schoolContactTypeCodes: schoolContactTypeCodes,
          },
        };
        log.info(`Loaded contact type codes.`);
      },
      {
        retries: 10,
      }
    );
  },
  async createAuthorityMailingFile() {
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
            value: "INDEPENDNT",
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
    )}/institute/authority/paginated?pageSize=10&sort[authorityNumber]=ASC&searchCriteriaList=${encodedParams}`;

    try {
      const data = await auth.getApiCredentials(
        config.get("oidc:clientId"),
        config.get("oidc:clientSecret"),
        "client_credentials",
        "profile openid"
      ); // get the tokens first to make api calls.
      const authorityResponse = await utils.getData(data.accessToken, url);

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
      ];

      authorityResponse.content.forEach(
        appendMailingAddressDetailsAndRemoveAddresses
      );

      // 🔥 No rearrangeAndRelabelObjectProperties needed
      authorityResponse.content = authorityResponse.content.map((item) => {
        const result = {};
        propertyOrder.forEach(({ property, label }) => {
          result[label] = item[property] ?? "";
        });
        return result;
      });
      const FILE_STORAGE_DIR = path.join(__dirname, "../..", "public");
      const filePathPublic = path.join(
        FILE_STORAGE_DIR,
        "authorityMailing.csv"
      );

      await this.writeCSVToFile(authorityResponse.content, filePathPublic);
    } catch (e) {
      log.error(
        "getAllAuthorityMailing Error:",
        e.response ? e.response.status : e.message
      );
      console.log(e);
    }
  },
  async createOffshoreFile() {
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
            value: "OFFSHORE",
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
    )}/institute/authority/paginated?pageSize=10&sort[authorityNumber]=ASC&searchCriteriaList=${encodedParams}`;

    try {
      const data = await auth.getApiCredentials(
        config.get("oidc:clientId"),
        config.get("oidc:clientSecret"),
        "client_credentials",
        "profile openid"
      ); // get the tokens first to make api calls.
      const authorityResponse = await utils.getData(data.accessToken, url);

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
      ];

      authorityResponse.content.forEach(
        appendMailingAddressDetailsAndRemoveAddresses
      );

      // 🔥 No rearrangeAndRelabelObjectProperties needed
      authorityResponse.content = authorityResponse.content.map((item) => {
        const result = {};
        propertyOrder.forEach(({ property, label }) => {
          result[label] = item[property] ?? "";
        });
        return result;
      });
      const FILE_STORAGE_DIR = path.join(__dirname, "../..", "public");
      const filePathPublic = path.join(
        FILE_STORAGE_DIR,
        "offshoreschoolrepresentatives.csv"
      );

      await this.writeCSVToFile(authorityResponse.content, filePathPublic);
    } catch (e) {
      log.error(
        "getAllAuthorityMailing Error:",
        e.response ? e.response.status : e.message
      );
      console.log(e);
    }
  },
  getFundingGroupCodes() {
    return fundingGroups ? fundingGroups : [];
  },
  getGradeCodes() {
    return gradeCodes ? gradeCodes : [];
  },
  getFacilityCodes() {
    return facilityCodes ? facilityCodes : [];
  },
  getCategoryCodes() {
    return schoolCategoryCodes ? schoolCategoryCodes : [];
  },
  getContactTypeCodes() {
    return contactTypeCodes ? contactTypeCodes : [];
  },
  getAddressTypeCodes() {
    return addressTypeCodes ? addressTypeCodes : [];
  },
  getDistrictNumber(districtId) {
    const district = districtsMap.get(districtId);
    return district ? district.districtNumber : "N/A";
  },

  getDistrictByDistrictID(id) {
    const district = districtsMap.get(id);
    return district || null; // always return a value
  },

  getDistrictContactLabel(districtContactTypeCode) {
    const codeList =
      contactTypeCodes?.codesList?.districtContactTypeCodes || [];
    const match = codeList.find(
      (c) => c.districtContactTypeCode === districtContactTypeCode
    );
    return match ? match.label : districtContactTypeCode;
  },
  isDistrictContactPublic(districtContactTypeCode) {
    const codeList =
      contactTypeCodes?.codesList?.districtContactTypeCodes || [];
    const match = codeList.find(
      (c) => c.districtContactTypeCode === districtContactTypeCode
    );
    return match ? !!match.publiclyAvailable : false;
  },
  async loadAllDistrictsToMap() {
    await retry(
      async () => {
        const clientId = config.get("oidc:clientId");
        const clientSecret = config.get("oidc:clientSecret");
        const instituteApiUrl = config.get("server:instituteAPIURL");

        const data = await auth.getApiCredentials(
          clientId,
          clientSecret,
          "client_credentials",
          "profile openid"
        );

        const districtsResponse = await utils.getData(
          data.accessToken,
          `${instituteApiUrl}/institute/district/paginated?pageSize=500`
        );

        // Reset collections
        districts = [];
        activeDistricts = [];
        districtsMap.clear();
        districtsNumber_ID_Map.clear();
        districtID_Name_Map.clear();

        if (districtsResponse?.content?.length > 0) {
          for (const district of districtsResponse.content) {
            const districtData = generateDistrictObject(district);

            // Only process active + BC districts
            if (isDistrictActive(districtData) && isBCDistrict(districtData)) {
              if (
                districtData.contacts &&
                Array.isArray(districtData.contacts)
              ) {
                try {
                  // Filter only public contacts and add labels
                  districtData.contacts = districtData.contacts
                    .filter((contact) =>
                      this.isDistrictContactPublic(
                        contact.districtContactTypeCode
                      )
                    )
                    .map((contact) => ({
                      ...contact,
                      districtContactLabel: this.getDistrictContactLabel(
                        contact.districtContactTypeCode
                      ),
                    }));
                } catch (error) {
                  console.error(
                    `Error processing contacts for district ${districtData.districtId}:`,
                    error
                  );
                }
              }

              // Add to maps and arrays
              districtsMap.set(district.districtId, districtData);
              districtsNumber_ID_Map.set(
                district.districtNumber,
                district.districtId
              );
              districtID_Name_Map.set(
                district.districtId,
                district.displayName
              );
              districts.push(districtData);
              activeDistricts.push(districtData);
            }
          }

          // Sort active districts by district number (padded to 3 digits)
          activeDistricts.sort((a, b) => {
            const numA = a.districtNumber.toString().padStart(3, "0");
            const numB = b.districtNumber.toString().padStart(3, "0");
            return numA.localeCompare(numB);
          });

          log.info(`Loaded ${districtsMap.size} districts.`);
          log.info(`Loaded ${activeDistricts.length} active districts.`);
        }
      },
      {
        retries: 10,
      }
    );
  },

  getDistrictSchools(districtId) {
    return Array.from(schoolMap.entries())
      .filter(([_, value]) => value.districtId === districtId)
      .map(([key, value]) => ({ key, ...value }));
  },

  getAuthoritySchools(authorityId) {
    return Array.from(schoolMap.entries())
      .filter(([_, value]) => value.independentAuthorityId === authorityId)
      .map(([key, value]) => ({ key, ...value }));
  },

  async loadAllAuthoritiesToMap() {
    try {
      await retry(
        async () => {
          const data = await auth.getApiCredentials(
            config.get("oidc:clientId"),
            config.get("oidc:clientSecret"),
            "client_credentials",
            "profile openid"
          );

          const url = `${config.get(
            "server:instituteAPIURL"
          )}/institute/authority/paginated?pageSize=5000`;
          const authoritiesResponse = await utils.getData(
            data.accessToken,
            url
          );
          // reset the value
          authorities = [];
          activeAuthorities = [];
          authoritiesMap.clear();

          if (
            authoritiesResponse.content &&
            authoritiesResponse.content.length > 0
          ) {
            for (const authority of authoritiesResponse.content) {
              const authorityData = generateAuthorityObject(authority);

              authorities.push(authorityData);
              if (isAuthorityActive(authorityData)) {
                activeAuthorities.push(authorityData);
                authoritiesMap.set(authority.independentAuthorityId, authority);
              }
            }
          }

          log.info(`Loaded ${authoritiesMap.size} authorities.`);
          log.info(`Loaded ${activeAuthorities.length} active authorities.`);
        },
        {
          retries: 10,
        }
      );
    } catch (error) {
      log.error("Error loading authorities:", error);
      console.error("Error in loadAllAuthoritiesToMap:", error);
      throw error; // rethrow so caller knows it failed
    }
  },

  async addSchoolsToDistricts() {
    await retry(
      async () => {
        try {
          for (const [districtId, districtData] of districtsMap.entries()) {
            const schools = await this.getDistrictSchools(districtId);
            districtsMap.set(districtId, {
              ...districtData, // spreads properties of districtData at top level
              districtSchools: schools,
            });
          }
        } catch (e) {
          console.error("Error adding schools to districts:", e);
          throw e;
        }
      },
      {
        retries: 10,
      }
    );
  },
  async addSchoolsToAuthorities() {
    await retry(
      async () => {
        try {
          for (const [authorityId, authorityData] of authoritiesMap.entries()) {
            const schools = await this.getAuthoritySchools(authorityId);

            authoritiesMap.set(authorityId, {
              ...authorityData, // spreads properties of districtData at top level
              authoritySchools: schools,
            });
          }
        } catch (e) {
          console.error("Error adding schools to districts:", e);
          throw e;
        }
      },
      {
        retries: 10,
      }
    );
  },

  getAuthorityList() {
    return activeAuthorities ? activeAuthorities : [];
  },

  getDistrictList() {
    return activeDistricts ? activeDistricts : [];
  },

  getAllDistrictsJSON() {
    return districts;
  },

  getActiveDistricts() {
    return activeDistricts ? activeDistricts : [];
  },
  getActiveSchools() {
    return activeSchools ? activeSchools : [];
  },
  getAuthorityByAuthorityID(authorityID) {
    return authoritiesMap.get(authorityID);
  },
  getDistrictJSONByDistrictID(districtID) {
    return districtsMap.get(districtID);
  },
  getDistrictIdByDistrictNumber(districtNumber) {
    return districtsNumber_ID_Map.get(districtNumber);
  },
  getSchoolIdByMincode(mincode) {
    return mincode_school_ID_Map.get(mincode);
  },
  getSchoolMap() {
    return schoolMap ? schoolMap : {};
  },

  async createDistrictFiles(_res, _req) {
    try {
      let districtContacts = [];

      districts.forEach((district) => {
        if (Array.isArray(district.contacts)) {
          district.contacts.forEach((contact) => {
            const contactObject = {
              districtId: district.districtId,
              districtNumber: district.districtNumber,
              name: district.displayName,
              phoneNumber: contact.phoneNumber,
              jobTitle: contact.jobTitle,
              phoneExtension: contact.phoneExtension,
              alternatePhoneNumber: contact.alternatePhoneNumber,
              alternatePhoneExtension: contact.alternatePhoneExtension,
              email: contact.email,
              firstName: contact.firstName,
              lastName: contact.lastName,
              districtContactTypeCode: contact.districtContactTypeCode,
              districtContactLabel: contact.districtContactLabel,
              mailingAddressLine1: district.mailingAddressLine1,
              mailingAddressLine2: district.mailingAddressLine2,
              mailingCity: district.mailingCity,
              mailingPostal: district.mailingPostal,
              mailingProvinceCode: district.mailingProvinceCode,
              mailingCountryCode: district.mailingCountryCode,
              physicalAddressLine1: district.physicalAddressLine1,
              physicalAddressLine2: district.physicalAddressLine2,
              physicalCity: district.physicalCity,
              physicalPostal: district.physicalPostal,
              physicalProvinceCode: district.physicalProvinceCode,
              physicalCountryCode: district.physicalCountryCode,
            };
            districtContacts.push(contactObject);
          });
        }
      });

      const propertyOrder = [
        { property: "districtId", label: "District Number" },
        { property: "name", label: "District Name" },
        {
          property: "districtNumber",
          label: "District Number",
        },
        {
          property: "districtContactLabel",
          label: "District Contact",
        },
        { property: "firstName", label: "Contact First Name" },
        { property: "lastName", label: "Contact Last name" },
        { property: "jobTitle", label: "Position Title" },
        { property: "districtContactTypeCode", label: "Contact Type" },
        { property: "mailingAddressLine1", label: "Address Line 1" },
        { property: "mailingAddressLine2", label: "Address Line 2" },
        { property: "mailingCity", label: "City" },
        { property: "mailingProvinceCode", label: "Province" },
        { property: "mailingPostal", label: "Postal Code" },
        { property: "mailingCountryCode", label: "Country" },
        {
          property: "physicalAddressLine1",
          label: "Courier Address Line 1",
        },
        {
          property: "physicalAddressLine2",
          label: "Courier Address Line 2",
        },
        { property: "physicalCity", label: "Courier City" },
        {
          property: "physicalProvinceCode",
          label: "Courier Province",
        },
        { property: "physicalPostal", label: "Courier Postal Code" },
        { property: "physicalCountryCode", label: "Courier Country" },
        { property: "phoneNumber", label: "Contact Phone" },
        { property: "phoneExtension", label: "Contact Phone Extension" },
        { property: "email", label: "Contact Emailx" },
      ];
      const FILE_STORAGE_DIR = path.join(__dirname, "../..", "public");

      // District Contacts
      districtContacts.sort((a, b) => a.districtNumber - b.districtNumber);
      districtContacts = this.mapPropertiesToLabels(
        districtContacts,
        propertyOrder
      );
      const filePathPublic = path.join(
        FILE_STORAGE_DIR,
        "alldistrictcontacts.csv"
      );

      await this.writeCSVToFile(districtContacts, filePathPublic);
    } catch (e) {
      console.error("Error generating CSV:", e);
    }
  },

  async createDistrictMailingFile(_res, _req) {
    try {
      const districtMailing = [];

      // Build CSV-ready objects using forEach
      districts.forEach((district) => {
        const districtMailingObject = {
          "District Number": district.districtNumber,
          "District Name": district.displayName,
          "Address Line 1": district.mailingAddressLine1 ?? "",
          "Address Line 2": district.mailingAddressLine2 ?? "",
          City: district.mailingCity ?? "",
          Province: district.mailingProvinceCode ?? "",
          "Postal Code": district.mailingPostal ?? "",
          Country: district.mailingCountryCode ?? "",
          "Courier Address Line 1": district.physicalAddressLine1 ?? "",
          "Courier Address Line 2": district.physicalAddressLine2 ?? "",
          "Courier City": district.physicalCity ?? "",
          "Courier Province": district.physicalProvinceCode ?? "",
          "Courier Postal Code": district.physicalPostal ?? "",
          "Courier Country": district.physicalCountryCode ?? "",
          "Web Address": district.webAddress ?? "",
          Phone: district.phoneNumber ?? "",
          Fax: district.fax ?? "",
        };

        districtMailing.push(districtMailingObject);
      });

      // Sort by "District Number" numerically
      const sortedDistrictMailing = sortJSONByKey(
        districtMailing,
        "District Number",
        true
      );

      // Define file path
      const FILE_STORAGE_DIR = path.join(__dirname, "../..", "public");
      const filePathPublic = path.join(FILE_STORAGE_DIR, "districtmailing.csv");

      // Write CSV once
      await this.writeCSVToFile(sortedDistrictMailing, filePathPublic);
    } catch (e) {
      console.error("Error generating CSV:", e);
    }
  },

  async createSchoolFiles(_res, _req) {
    try {
      const schoolList = [];

      districtsMap.forEach((item) => {
        if (Array.isArray(item.districtSchools)) {
          item.districtSchools.forEach((school) => {
            const principal = school.contacts?.find(
              (contact) => contact.schoolContactTypeCode === "PRINCIPAL"
            );
            school.principalEmail = principal?.email || null;
            school.principalFirstName = principal?.firstName || null;
            school.principalLastName = principal?.lastName || null;
            school.principalPhoneNumber = principal?.phoneNumber || null;
            school.principalPhoneExtension = principal?.phoneExtension || null;
            school.principalJobTile = principal?.jobTitle || null;
            const flattenedAddresses =
              school.addresses?.reduce((acc, addr) => {
                const prefix = addr.addressTypeCode.toLowerCase(); // 'mailing' or 'physical'
                acc[`${prefix}AddressLine1`] = addr.addressLine1;
                acc[`${prefix}AddressLine2`] = addr.addressLine2;
                acc[`${prefix}City`] = addr.city;
                acc[`${prefix}Province`] = addr.provinceCode;
                acc[`${prefix}Postal`] = addr.postal;
                acc[`${prefix}Country`] = addr.countryCode;
                return acc;
              }, {}) || {};
            const facilityMatch = facilityCodes.find(
              (ref) => ref.facilityTypeCode === school.facilityTypeCode
            );
            if (facilityMatch) {
              school.facilityTypeCode = facilityMatch.description;
            }
            Object.assign(school, flattenedAddresses);

            delete school.contacts;
            delete school.schoolFundingGroups;
            delete school.addresses;

            schoolList.push(school);
          });
        }
      });
      schoolList.sort((a, b) => a.mincode.localeCompare(b.mincode));

      const propertyOrder = [
        { property: "districtNumber", label: "District Number" },
        { property: "mincode", label: "School Code" },
        { property: "displayName", label: "School Name" },
        { property: "mailingAddressLine1", label: "Address" },
        { property: "mailingCity", label: "City" },
        { property: "mailingProvince", label: "Province" },
        { property: "mailingPostal", label: "Postal Code" },
        { property: "physicalAddressLine1", label: "Physical Address" },
        { property: "physicalCity", label: "Physical City" },
        { property: "physicalProvince", label: "Physical Province" },
        { property: "physicalPostal", label: "Physical Postal Code" },
        { property: "principalFirstName", label: "Principal First Name" },
        { property: "principalLastName", label: "Principal Last Name" },
        { property: "facilityTypeCode", label: "Type" },
        {
          property: "schoolCategoryCode_description",
          label: "School Category",
        },
        { property: "phoneNumber", label: "Phone" },
        { property: "faxNumber", label: "Fax" },
        { property: "email", label: "Email" },
        { property: "KINDHALF", label: "Kindergarten Half Enrollment" },
        { property: "KINDFULL", label: "Kindergarten Full Enrollment" },
        { property: "GRADE01", label: "Grade 1 Enrollment" },
        { property: "GRADE02", label: "Grade 2 Enrollment" },
        { property: "GRADE03", label: "Grade 3 Enrollment" },
        { property: "GRADE04", label: "Grade 4 Enrollment" },
        { property: "GRADE05", label: "Grade 5 Enrollment" },
        { property: "GRADE06", label: "Grade 6 Enrollment" },
        { property: "GRADE07", label: "Grade 7 Enrollment" },
        { property: "GRADE08", label: "Grade 8 Enrollment" },
        { property: "GRADE09", label: "Grade 9 Enrollment" },
        { property: "GRADE10", label: "Grade 10 Enrollment" },
        { property: "GRADE11", label: "Grade 11 Enrollment" },
        { property: "GRADE12", label: "Grade 12 Enrollment" },
        { property: "primaryK3", label: "Group Classification Primary K-3" },
        {
          property: "elementary47",
          label: "Group Classification Elementary 4-7 EU",
        },
        {
          property: "juniorSecondary810",
          label: "Group Classification Junior Secondary 8-10 SU",
        },
        {
          property: "seniorSecondary1112",
          label: "Group Classification Senior Secondary 11-12",
        },
      ];

      const FILE_STORAGE_DIR = path.join(__dirname, "../..", "public");

      // PUBLIC schools

      let publicSchools = schoolList.filter(
        (s) => s.schoolCategoryCode === "PUBLIC"
      );

      publicSchools = this.mapPropertiesToLabels(publicSchools, propertyOrder);
      const filePathPublic = path.join(
        FILE_STORAGE_DIR,
        "publicschoolcontacts.csv"
      );

      await this.writeCSVToFile(publicSchools, filePathPublic);

      // INDEPENDENT schools
      let independentSchools = schoolList.filter(
        (s) => s.schoolCategoryCode === "INDEPEND"
      );
      const filePathIndependent = path.join(
        FILE_STORAGE_DIR,
        "allindependentschools.csv"
      );

      independentSchools = this.mapPropertiesToLabels(
        independentSchools,
        propertyOrder
      );

      await this.writeCSVToFile(independentSchools, filePathIndependent);

      // All Schools
      let allSchools = schoolList;
      const filePathAllSchools = path.join(
        FILE_STORAGE_DIR,
        "allschoolContacts.csv"
      );
      allSchools = this.mapPropertiesToLabels(allSchools, propertyOrder);
      await this.writeCSVToFile(allSchools, filePathAllSchools);

      // All Schools Mailing
      const filePathAllSchoolsMailing = path.join(
        FILE_STORAGE_DIR,
        "allschoolMailing.csv"
      );
      const propertyOrderAllSchools = [
        { property: "districtNumber", label: "District Number" },
        { property: "mincode", label: "School Code" },
        { property: "displayName", label: "School Name" },
        { property: "mailingAddressLine1", label: "Address" },
        { property: "mailingCity", label: "City" },
        { property: "mailingProvince", label: "Province" },
        { property: "mailingPostal", label: "Postal Code" },
        { property: "physicalAddressLine1", label: "Physical Address" },
        { property: "physicalCity", label: "Physical City" },
        { property: "physicalProvince", label: "Physical Province" },
        { property: "physicalPostal", label: "Physical Postal Code" },
        { property: "principalFirstName", label: "Principal First Name" },
        { property: "principalLastName", label: "Principal Last Name" },
        { property: "facilityTypeCode", label: "Type" },
        {
          property: "schoolCategoryCode_description",
          label: "School Category",
        },
        { property: "phoneNumber", label: "Phone" },
        { property: "faxNumber", label: "Fax" },
        { property: "email", label: "Email" },
      ];
      allSchools = schoolList;
      allSchools = this.mapPropertiesToLabels(
        allSchools,
        propertyOrderAllSchools
      );

      await this.writeCSVToFile(allSchools, filePathAllSchoolsMailing);
    } catch (e) {
      console.error("Error generating CSV:", e);
    }
  },
  mapPropertiesToLabels(items, propertyOrder) {
    return items.map((item) => {
      const mapped = {};
      propertyOrder.forEach(({ property, label }) => {
        mapped[label] = item[property] ?? "";
      });
      return mapped;
    });
  },
  // Helper function to convert JSON to CSV and write to file
  async writeCSVToFile(data, filePath) {
    return new Promise((resolve, reject) => {
      jsonExport(data, (err, csv) => {
        if (err) return reject(err);
        fs.writeFile(filePath, "\ufeff" + csv, (error) => {
          if (error) return reject(error);
          resolve();
        });
      });
    });
  },
};

module.exports = cacheService;
