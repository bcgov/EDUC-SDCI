const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");

const axios = require("axios");
const { checkToken } = require("../components/auth");
const {filterByOpenedAndClosedDate, formatGrades, removeFieldsByCriteria, createList, addDistrictLabels, districtNumberSort, isAllowedSchoolCategory, filterRemoveByField, filterByField } = require("../components/utils");
const { listCache, codeCache } = require("../components/cache");

const schoolListOptions = { fields: ["mincode", "displayName", "schoolId", "closedDate", "openedDate","schoolCategoryCode"], fieldToInclude: null, valueToInclude: null, sortField: "mincode" };
const districtListOptions = { fields: ["displayName", "districtId","districtNumber", "closedDate"] ,fieldToInclude: "districtStatusCode", valueToInclude: "ACTIVE", sortField: "districtNumber"};
const authorityListOptions = { fields: ["displayName", "authorityNumber","independentAuthorityId", "closedDate", "opendDate"], sortField: "authorityNumber" };
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
router.get("/school/list", checkToken, getSchoolList);
router.get("/authority/list", checkToken, getAuthorityList);
router.get("/district/list", checkToken, getDistrictList);
router.get("/district/contact/*", checkToken, getDistrictContactsAPI);
router.get("/create-cache", checkToken, createCache);
router.get("/category-codes", checkToken, getCategoryCodes);

router.get("/*", checkToken, getInstituteAPI);

async function createCache(req, res) {
  if (await !listCache.has("fundingGroups")) {
    //const codes = [];

    try {
      const fundingGroupsResponse = await axios.get(
        `${config.get(
          "server:schoolsAPIURL"
        )}/schools/fundingGroups`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );
      listCache.set("fundingGroups", fundingGroupsResponse.data);
      res.json(fundingGroupsResponse.data);
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("getFunding Groups Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
  } else {
    const cachedFundingGroupList = await listCache.get("fundingGroups");
    res.json(cachedFundingGroupList);
  }
  if (await !listCache.has("districtlist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/district`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const filteredNonbBCDistrictList = response.data.filter(district => ["098","102", "103"].includes(district.districtNumber));
        const filteredDistrictList = response.data.filter(district => !["098","102", "103"].includes(district.districtNumber));
        const districtList = createList(filteredDistrictList, districtListOptions);
        const nonBCdistrictList = createList(filteredNonbBCDistrictList, districtListOptions);

        listCache.set("nonbcdistrictlist", nonBCdistrictList);
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
  } 
  if (!listCache.has("categoryCodes")) {
    //const codes = [];
    
    try {
      const categoryCodesResponse = await axios.get(
        `${config.get(
          "server:instituteAPIURL"
        )}/institute/category-codes`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );
      
      categoryCodesResponse.data = filterRemoveByField(categoryCodesResponse.data,"schoolCategoryCode", ["FED_BAND","POST_SEC","YUKON"])
      listCache.set("categoryCodes", categoryCodesResponse.data);
      
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("Category Code Caching Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
  } else{
    const categoryCodes = await listCache.get("categoryCodes");
    res.json(categoryCodes)
  }
  if (await !codeCache.has("gradelist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/grade-codes`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const gradeCodes = response.data;
        
        codeCache.set("gradelist", gradeCodes);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getDistrictList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const gradeCodes = await codeCache.get("gradelist");
    res.json(gradeCodes);
  }

  if (!listCache.has("categoryCodes")) {
    //const codes = [];
    
    try {
      const categoryCodesResponse = await axios.get(
        `${config.get(
          "server:instituteAPIURL"
        )}/institute/category-codes`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );
      
      categoryCodesResponse.data = filterRemoveByField(categoryCodesResponse.data,"schoolCategoryCode", ["FED_BAND","POST_SEC","YUKON"])
      listCache.set("categoryCodes", categoryCodesResponse.data);
      
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("Category Code Caching Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
  } 
  
  if (!listCache.has("facilityCodes")) {
    //const codes = [];

    try {
      const facilityCodesResponse = await axios.get(
        `${config.get(
          "server:instituteAPIURL"
        )}/institute/facility-codes`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );
      listCache.set("facilityCodes", facilityCodesResponse.data);
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("Faility Code Caching Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
  } 
  if (!listCache.has("districtAddresses")) {
    //const codes = [];

    try {
      const districtsResponse = await axios.get(
        `${config.get("server:instituteAPIURL")}/institute/district/paginated?pageSize=200`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );
      
      districtsResponse.data.content.forEach((district) => {
        district.addresses.forEach((address) => {
          
          if (address.addressTypeCode === "MAILING") {
            Object.keys(address).forEach((field) => {
              // Exclude the specified fields
              if (![
                "createUser",
                "updateUser",
                "createDate",
                "updateDate",
                "schoolAddressId",
                "schoolId",
                "addressTypeCode"
              ].includes(field)) {
                district[`mailing_${field}`] = address[field];
              }
            });
          } else if (address.addressTypeCode === "PHYSICAL") {
            Object.keys(address).forEach((field) => {
              if (![
                "createUser",
                "updateUser",
                "createDate",
                "updateDate",
                "schoolAddressId",
                "schoolId",
                "addressTypeCode"
              ].includes(field)) {
                district[`physical_${field}`] = address[field];
              }
            });
          }
        });
      });
      listCache.set("districtAddresses", districtsResponse.data.content);
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("District Code Caching Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
  } 


  if (await !listCache.has("codesList")) {
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
        authorityContactTypeCodes: removeFieldsByCriteria(authorityContactTypeCodesResponse.data, [{ fieldToRemove: "publiclyAvailable", value: false }]),
        districtContactTypeCodes: removeFieldsByCriteria(districtContactTypeCodesResponse.data,[{ fieldToRemove: "publiclyAvailable", value: false }]),
        schoolContactTypeCodes: removeFieldsByCriteria(schoolContactTypeCodesResponse.data,[{ fieldToRemove: "publiclyAvailable", value: false }]),
      };
      res.json(codes);
      listCache.set("codesList", { codesList: codes });
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("getCodesList Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
  }
  res.status(200).json({ success: true });

}


async function getContactTypeCodes(req, res) {
  if (await !listCache.has("codesList")) {
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
        authorityContactTypeCodes: removeFieldsByCriteria(authorityContactTypeCodesResponse.data, [{ fieldToRemove: "publiclyAvailable", value: false }]),
        districtContactTypeCodes: removeFieldsByCriteria(districtContactTypeCodesResponse.data,[{ fieldToRemove: "publiclyAvailable", value: false }]),
        schoolContactTypeCodes: removeFieldsByCriteria(schoolContactTypeCodesResponse.data,[{ fieldToRemove: "publiclyAvailable", value: false }]),
      };
      listCache.set("codesList", { codesList: codes });
      res.json(codes);
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("getContactCodeList Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
  } else {
    const cachedCodeList = await listCache.get("codesList");
    res.json(cachedCodeList);
  }
}
async function getOffshoreSchoolList(req, res) {
  
  let currentDate = new Date().toISOString().substring(0, 19)
  const params = [
    {
      condition: 'AND',
      searchCriteriaList: [
        {
          key: 'schoolCategoryCode',
          operation: 'eq',
          value: "OFFSHORE",
          valueType: 'STRING',
          condition: 'AND'
        },
        {
          key: 'openedDate',
          operation: 'lte',
          value: currentDate,
          valueType: 'DATE_TIME',
          condition: 'AND'
        }      
      ]
    },
    {
      condition: 'AND',
      searchCriteriaList: [
        {
          key: 'closedDate',
          operation: 'eq',
          value: null,
          valueType: 'STRING',
          condition: 'OR'
        },
        {
          key: 'closedDate',
          operation: 'gte',
          value: currentDate,
          valueType: 'DATE_TIME',
          condition: 'OR'
        }          
      ]
    }
  ];

  const jsonString = JSON.stringify(params)
  const encodedParams = encodeURIComponent(jsonString)
  
  

  if (await !listCache.has("offshoreschoollist")) {
    const url = `${config.get('server:instituteAPIURL')}/institute/school/paginated?pageSize=1000&pageNumber=0&searchCriteriaList=${encodedParams}`;
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const offshoreSchoolList = response.data.content;
        const schoolGrades =  codeCache.get("gradelist");
        
        for (let i = 0; i < offshoreSchoolList.length; i++) {
          const formattedGrades = formatGrades(offshoreSchoolList[i].grades, schoolGrades);
          offshoreSchoolList[i] = { ...offshoreSchoolList[i], ...formattedGrades };
          // Now you can use the updated offshoreSchoolList[i] object as needed
      }
        res.json(offshoreSchoolList);
        listCache.set("offshoreschoollist", offshoreSchoolList);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getOffshoreSchoolsList Error",
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

    let currentDate = new Date().toISOString().substring(0, 19)
    const params = [
      {
        condition: null,
        searchCriteriaList: [
          {
            key: 'closedDate',
            operation: 'eq',
            value: null,
            valueType: 'STRING',
            condition: 'OR'
          },
          {
            key: 'closedDate',
            operation: 'gte',
            value: currentDate,
            valueType: 'DATE_TIME',
            condition: 'OR'
          }          
        ]
      }
    ];
  
    const jsonString = JSON.stringify(params)
    const encodedParams = encodeURIComponent(jsonString)
    
    const url = `${config.get('server:instituteAPIURL')}/institute/authority/paginated?pageSize=1000&searchCriteriaList=${encodedParams}`;
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const authorityList = createList(response.data.content, authorityListOptions);
        
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
async function getCategoryCodes(req, res) {
   
  if (!listCache.has("categoryCodes")) {
    //const codes = [];
    
    try {
      const categoryCodesResponse = await axios.get(
        `${config.get(
          "server:instituteAPIURL"
        )}/institute/category-codes`,
        {
          headers: { Authorization: `Bearer ${req.accessToken}` },
        }
      );
      
      categoryCodesResponse.data = filterRemoveByField(categoryCodesResponse.data,"schoolCategoryCode", ["FED_BAND","POST_SEC","YUKON"])
      listCache.set("categoryCodes", categoryCodesResponse.data);
      
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("Category Code Caching Error", statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
  } else{
    const categoryCodes = await listCache.get("categoryCodes");
    res.json(categoryCodes)
  }
}
async function getSchoolList(req, res) {
  if (await !listCache.has("schoollist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/school`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const openSchools = filterByOpenedAndClosedDate(response.data)
        const validSchoolCategories = filterByField(openSchools, "schoolCategoryCode", ["POST_SEC", "YUKON", "SUMMER", "FED_BAND"])
        const validSchoolFacilities = filterByField(validSchoolCategories, "facilityTypeCode", ['PROVINCIAL','DIST_CONT','ELEC_DELIV','POST_SEC','JUSTB4PRO','SUMMER'])
        const schoolList = createList(validSchoolFacilities, schoolListOptions);
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
        const filteredNonbBCDistrictList = response.data.filter(district => ["098","102", "103"].includes(district.districtNumber));
        const filteredDistrictList = response.data.filter(district => !["098","102", "103"].includes(district.districtNumber));
        const districtList = createList(filteredDistrictList, districtListOptions);
        const nonBCdistrictList = createList(filteredNonbBCDistrictList, districtListOptions);
        listCache.set("nonbcdistrictlist", nonBCdistrictList);
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
  const nonBCDistrictList =  await listCache.get("nonbcdistrictlist");
  axios
    .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
    .then((response) => {
      if (req.url.includes("/district/contact/paginated")) {
        const jsonData = addDistrictLabels(response.data, districtList);
        let nonBCDistrictIds = nonBCDistrictList.map(district => district.districtId);
        nonBCDistrictIds.push("8e34ab4d-f387-220b-b54e-2c9a7f380f85");
        jsonData.content = jsonData.content.filter(contact => !nonBCDistrictIds.includes(contact.districtId));

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
        const gradeCodes = response.data;
        
        codeCache.set("gradelist", gradeCodes);
        res.json(gradeCodes);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getGradesList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const gradeCodes = await codeCache.get("gradelist");
    res.json(gradeCodes);
  }
}
module.exports = router;
