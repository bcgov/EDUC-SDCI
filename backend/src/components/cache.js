const NodeCache = require("node-cache");
const listCache = new NodeCache({ stdTTL: 21600 });
const schoolCache = new NodeCache({ stdTTL: 21600 });
const codeCache = new NodeCache({ stdTTL: 21600 });
const fileCache = new NodeCache({ stdTTL: 39600 });
const { removeFieldsByCriteria, createList, filterRemoveByField} = require("../components/utils");
const config = require("../config/index"); 
const axios = require("axios");
const districtListOptions = { fields: ["displayName", "districtId","districtNumber", "closedDate"] ,fieldToInclude: "districtStatusCode", valueToInclude: "ACTIVE", sortField: "districtNumber"};
const authorityListOptions = { fields: ["displayName", "authorityNumber","independentAuthorityId", "closedDate", "opendDate"], sortField: "authorityNumber" };

async function createCache(req) {
  
  if (!listCache.has("districtlist")) {
  
    const url = `${config.get("server:instituteAPIURL")}/institute/district`; // Update the URL according to your API endpoint

    await axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        
        const filteredDistrictList = response.data.filter(district => !["098","102", "103"].includes(district.districtNumber));
        const districtList = createList(filteredDistrictList, districtListOptions);
        listCache.set("districtlist", districtList);
      })
      .catch((e) => {
        log.error(
          "getDistrictList Error",
          e.response ? e.response.status : e.message
        );
      });
  } 
  if (!listCache.has("categoryCodes")) {
    
    
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
    }
  }
  if (!codeCache.has("gradelist")) {
    const url = `${config.get("server:instituteAPIURL")}/institute/grade-codes`; // Update the URL according to your API endpoint
    await axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const gradeCodes = response.data;
        codeCache.set("gradelist", gradeCodes);
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
      listCache.set("codesList", { codesList: codes });
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error("getCodesList Error", statusCode, error.message);
    }
  }

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
    await axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const authorityList = createList(response.data.content, authorityListOptions);
        
        listCache.set("authoritylist", authorityList);
      })
      .catch((e) => {
        log.error(
          "authorityList Error",
          e.response ? e.response.status : e.message
        );
      });
  }

}

module.exports = {
    listCache,schoolCache,codeCache, fileCache, createCache
  };