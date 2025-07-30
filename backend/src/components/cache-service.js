'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const { auth } = require('../components/auth');
const {utils, addFundingGroups} = require('../components/utils');
const retry = require('async-retry');
const {generateSchoolObject, isSchoolActive} = require('./schoolUtils');
const {generateDistrictObject, isDistrictActive,generateAuthorityObject,isAuthorityActive} = require('./districtUtils');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');
const jsonExport = require('jsonexport');
const path = require('path');
const fs = require('fs');
const constants = require('../util/constants');
const { getGradeCodes } = require('./school');

let schoolMap = new Map();
let schools = [];
let districts = [];
let districtsMap = new Map();
let districtsNumber_ID_Map = new Map();
let districtID_Name_Map = new Map();
let mincode_school_ID_Map = new Map();
let activeSchools = [];
let activeDistricts = [];
let addressTypeCodes = [];
let schoolCategoryCodes = [];
let facilityCodes = [];
let gradeCodes = [];
let fundingGroups =[];

const cacheService = {
  async loadAllSchoolsToMap() {
    await retry(async () => {
      // if anything throws, we retry
    
      const data = await auth.getApiCredentials(config.get("oidc:serviceClientId"), config.get("oidc:serviceClientSecret"), "client_credentials", "profile openid"); // get the tokens first to make api calls.
      const schoolsResponse = await utils.getData(data.accessToken, `${config.get('server:instituteAPIURL')}/api/v1/institute/school/paginated`);
      const schoolWithFundingGroups = addFundingGroups(schoolsResponse.content, fundingGroups)
      schools = []; // reset the value.
      schoolMap.clear();// reset the value.
      mincode_school_ID_Map.clear();
      activeSchools = [];

      if (schoolWithFundingGroups && schoolWithFundingGroups.length > 0) {
        
        for (const school of schoolWithFundingGroups) {
          const schoolObject = generateSchoolObject(school, gradeCodes);
          schoolObject.districtDisplayName = districtID_Name_Map.get(schoolObject.districtID)
          schoolMap.set(schoolObject.schoolId, schoolObject);
          mincode_school_ID_Map.set(schoolObject.mincode, schoolObject.schoolId);
          schools.push(schoolObject);
          if (isSchoolActive(schoolObject)) {
            activeSchools.push(schoolObject);
          }
        }
        
      }
      log.info(`Loaded ${schoolMap.size} schools.`);
      log.info(`Loaded ${activeSchools.length} active schools.`);
    }, {
      retries: 10
    });
  },
  async addFundingGroups(schools, fundingGroups) {
    try {
      // Process each school in the array
      const schoolsWithFunding = schools.map((school) => {
        // Find all matching funding groups by mincode
        const matchingFundingGroups = fundingGroups.filter(
          (fundingGroup) => fundingGroup.mincode === school.mincode
        );
  
        const schoolWithFunding = {
          ...school,
          primaryK3: "", // Replace with an appropriate default value
          elementary47: "", // Replace with an appropriate default value
          juniorSecondary810: "", // Replace with an appropriate default value
          seniorSecondary1112: "", // Replace with an appropriate default value
        };
  
        // Iterate through the matching funding groups
        matchingFundingGroups.forEach((matchingFundingGroup) => {
          // Access the fundingGroupCode and fundingSubCode properties
          const fundingGroupCode = matchingFundingGroup.fundingGroupCode;
          const fundingSubCode = matchingFundingGroup.fundingGroupSubCode;
  
          // Check the fundingSubCode and update the school information
          switch (fundingSubCode) {
            case "01":
              schoolWithFunding.primaryK3 = fundingGroupCode;
              break;
            case "04":
              schoolWithFunding.elementary47 = fundingGroupCode;
              break;
            case "08":
              schoolWithFunding.juniorSecondary810 = fundingGroupCode;
              break;
            case "11":
              schoolWithFunding.seniorSecondary1112 = fundingGroupCode;
              break;
            default:
              break;
          }
        });
  
        return schoolWithFunding;
      });
  
      return schoolsWithFunding;
    } catch (error) {
      // Handle the error here, you can log it or perform other actions
      console.error("An error occurred in addFundingGroups:", error);
      // Optionally, you can rethrow the error if needed
      throw error;
    }
  }, 
  async loadAddressTypeCodes() {
    await retry(async () => {
      // if anything throws, we retry
      const data = await auth.getApiCredentials(config.get("oidc:serviceClientId"), config.get("oidc:serviceClientSecret"), "client_credentials", "profile openid"); // get the tokens first to make api calls.
      const addressTypeCodesResponse = await utils.getData(data.accessToken, `${config.get('server:instituteAPIURL')}/api/v1/institute/address-type-codes`);
      addressTypeCodes = []; // reset the value.
      if (addressTypeCodesResponse && addressTypeCodesResponse.length > 0) {
          addressTypeCodes = addressTypeCodesResponse
      }
      log.info(`Loaded ${addressTypeCodes.length} address type codes.`);
    }, {
      retries: 10
    });
  },
  async loadSchoolCategoryCodes() {
    await retry(async () => {
      
      // Get API access token
      const data = await auth.getApiCredentials(
        config.get("oidc:serviceClientId"),
        config.get("oidc:serviceClientSecret"),
        "client_credentials",
        "profile openid"
      );
  
      // Fetch category codes from the API
      const categoryCodesResponse = await utils.getData(
        data.accessToken,
        `${config.get('server:instituteAPIURL')}/api/v1/institute/category-codes`
      );
  
      // Reset and filter the category codes
      schoolCategoryCodes = [];
  
      if (Array.isArray(categoryCodesResponse) && categoryCodesResponse.length > 0) {
        // Filter out the unwanted codes
        const excludedCodes = ["FED_BAND", "YUKON", "POST_SEC"];
        schoolCategoryCodes = categoryCodesResponse.filter(
          (code) => !excludedCodes.includes(code.schoolCategoryCode)
        );
      }
  
      log.info(`Loaded ${schoolCategoryCodes.length} school category codes.`);
    }, {
      retries: 10
    });
  },
  async loadFacilityCodes() {
    await retry(async () => {
      const accessToken = (await auth.getApiCredentials(
        config.get("oidc:serviceClientId"),
        config.get("oidc:serviceClientSecret"),
        "client_credentials",
        "profile openid"
      ))?.accessToken;
  
      if (!accessToken) {
        throw new Error("Failed to retrieve access token.");
      }
  
      const url = `${config.get("server:instituteAPIURL")}/api/v1/institute/facility-codes`;
      const response = await utils.getData(accessToken, url);
  
      const excludedTypes = new Set([
        "PROVINCIAL",
        "DIST_CONT",
        "ELEC_DELIV",
        "POST_SEC",
        "JUSTB4PRO",
        "SUMMER"
      ]);
  
      facilityCodes = (Array.isArray(response) ? response : []).filter(
        code => !excludedTypes.has(code.facilityTypeCode)
      );
  
      log.info(`Loaded ${facilityCodes.length} facility codes (after filtering).`);
    }, {
      retries: 10
    });
  },
  async loadGradeCodes() {
    await retry(async () => {
      // if anything throws, we retry
      const data = await auth.getApiCredentials(config.get("oidc:serviceClientId"), config.get("oidc:serviceClientSecret"), "client_credentials", "profile openid"); // get the tokens first to make api calls.
      const gradeCodesResponse = await utils.getData(data.accessToken, `${config.get('server:instituteAPIURL')}/api/v1/institute/grade-codes`);
      gradeCodes = []; // reset the value.
      if (gradeCodesResponse && gradeCodesResponse.length > 0) {
        gradeCodes = gradeCodesResponse
      }
      log.info(`Loaded ${gradeCodes.length} grade codes.`);
    }, {
      retries: 10
    });
  },  
  async loadFundingCodes() {
    await retry(async () => {
      // if anything throws, we retry
      const data = await auth.getApiCredentials(config.get("oidc:serviceClientId"), config.get("oidc:serviceClientSecret"), "client_credentials", "profile openid"); // get the tokens first to make api calls.
      fundingGroups = await utils.getData(data.accessToken, `${config.get('server:schoolsAPIURL')}/schools/fundingGroups`);
      
      log.info(`Loaded ${fundingGroups.length} grade codes.`);
    }, {
      retries: 10
    });
  },    
  getGradeCodes(){
    return gradeCodes;
  },
  getFacilityCodes(_req,res){
    return res.status(200).json(facilityCodes ? facilityCodes : []);
  },
  getCategoryCodes(_req, res){
    
    return res.status(200).json(schoolCategoryCodes ? schoolCategoryCodes : []);
  },
  getAddressTypeCodes(){
     return addressTypeCodes;
  },
  getAllSchoolsJSON() {
    return res.status(200).json(schools ? schools : []); 
  },

  getSchoolBySchoolID(req, res) {
    const schoolID = req.params.schoolId; // match param name in route
  
    const school = schoolMap.get(schoolID);
    return res.status(200).json(school ? school : []);
  },
  getDistrictByDistrictID(req, res) {
  
    const districtId = req.params.districtId;
  
    const district = districtsMap.get(districtId);
  
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }
  
    return res.status(200).json(district);
  },
  getAllActiveSchoolsJSON(_req,res) {
    return res.status(200).json(activeSchools ? activeSchools : []);
  },
 
  async loadAllDistrictsToMap() {
    await retry(async () => {
      const data = await auth.getApiCredentials(config.get("oidc:serviceClientId"), config.get("oidc:serviceClientSecret"), "client_credentials", "profile openid");
      const districtsResponse = await utils.getData(data.accessToken, `${config.get('server:instituteAPIURL')}/api/v1/institute/district/paginated?pageSize=500`);
      // reset the value.
      districts = [];
      activeDistricts = [];
      districtsMap.clear();
      districtsNumber_ID_Map.clear();
      districtID_Name_Map.clear();
      if (districtsResponse.content && districtsResponse.content.length > 0) {
        for (const district of districtsResponse.content) {
          const districtData = generateDistrictObject(district);
          districtsMap.set(district.districtId, districtData);
          districtsNumber_ID_Map.set(district.districtNumber, district.districtId);
          districtID_Name_Map.set(district.districtId, district.displayName)
          
          districts.push(districtData);
          if(isDistrictActive(districtData)){
            activeDistricts.push(districtData);
          }
        }
      }
      
      log.info(`loaded ${districtsMap.size} districts.`);
      log.info(`loaded ${activeDistricts.length} active districts.`);
    }, {
      retries: 50
    });
  },
  getDistrictSchools(districtId) {
    return Array.from(schoolMap.entries())
      .filter(([_, value]) => value.districtId === districtId)
      .map(([key, value]) => ({ key, ...value }));
  },
  
  async addSchoolsToDistricts() {

    await retry(async () => {
      try{

      
      for (const [districtId, districtData] of districtsMap.entries()) {
      
        const schools = this.getDistrictSchools(districtId);
        districtData.districtSchools = schools;
        // Optionally update the Map if needed
        districtsMap.set(districtId, districtData);
      }
    }catch(e){
      console.log(e)
    }
    }, {
      retries: 50
    });
  },
  getAllDistrictsJSON() {
    return districts;
  },
  getActiveDistricts(req_, res){
    return res.status(200).json(activeDistricts ? activeDistricts : []);
  },
  getAuthorityJSONByAuthorityID(authorityID) {
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

  async createDistrictFiles(res_, req_) {
    try {
      let districtContacts = [];

      districts.forEach(district => {
        if (Array.isArray(district.contacts)) {
          district.contacts.forEach(contact => {
            const contactObject = {
              districtId: district.districtId,
              districtNumber: district.districtNumber,
              name: district.name,
              phoneNumber: contact.phoneNumber,
              jobTitle: contact.jobTitle,
              phoneExtension: contact.phoneExtension,
              alternatePhoneNumber: contact.alternatePhoneNumber,
              alternatePhoneExtension: contact.alternatePhoneExtension,
              email: contact.email,
              firstName: contact.firstName,
              lastName: contact.lastName,
              districtContactTypeCode: contact.districtContactTypeCode
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
          property: "districtContactTypeCode_description",
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
      const FILE_STORAGE_DIR = path.join(__dirname, '../..', 'public');
  
      // District Contacts
      
      districtContacts = this.relabelSchoolProperties(districtContacts, propertyOrder)
      const filePathPublic = path.join(FILE_STORAGE_DIR, 'alldistrictcontacts.csv');

  
      await this.writeCSVToFile(districtContacts, filePathPublic);
  
      
      
    } catch (e) {
      console.error('Error generating CSV:', e);
    }
  },
  async createSchoolFiles(res_, req_) {
    try {
      const schoolList = [];
  
      districts.forEach(item => {
        if (Array.isArray(item.districtSchools)) {
          item.districtSchools.forEach(school => {
            const principal = school.contacts?.find(
              contact => contact.schoolContactTypeCode === 'PRINCIPAL'
            );
  
            school.principalEmail = principal?.email || null;
            school.principalFirstName = principal?.firstName || null;
            school.principalLastName = principal?.lastName || null;
  
            delete school.contacts;
            delete school.schoolFundingGroups;
  
            schoolList.push(school);
          });
        }
      });
      const propertyOrder = [
        { property: "districtNumber", label: "District Number" },
        { property: "mincode", label: "School Code" },
        { property: "displayName", label: "School Name" },
        { property: "mailing_addressLine1", label: "Address" },
        { property: "mailing_city", label: "City" },
        { property: "mailing_provinceCode", label: "Province" },
        { property: "mailing_postal", label: "Postal Code" },
        { property: "physical_addressLine1", label: "Physical Address" },
        { property: "physical_city", label: "Physical City" },
        { property: "physical_provinceCode", label: "Physical Province" },
        { property: "physical_postal", label: "Physical Postal Code" },
        { property: "firstName", label: "Principal First Name" },
        { property: "lastName", label: "Principal Last Name" },
        { property: "facilityTypeCode", label: "Type" },
        { property: "facilityTypeCode_description", label: "Type" },
        {
          property: "schoolCategoryCode_description",
          label: "School Category",
        },
        // { property: "gradeRange", label: "Grade Range" },
        // { property: "fundingGroups", label: "Funding Group(s)" },
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

      const FILE_STORAGE_DIR = path.join(__dirname, '../..', 'public');
  
      // PUBLIC schools
      let publicSchools = schoolList.filter(s => s.schoolCategoryCode === 'PUBLIC');
      publicSchools = this.relabelSchoolProperties(publicSchools, propertyOrder)
      const filePathPublic = path.join(FILE_STORAGE_DIR, 'allpublicschools.csv');

  
      await this.writeCSVToFile(publicSchools, filePathPublic);
  
      // INDEPENDENT schools
      let independentSchools = schoolList.filter(s => s.schoolCategoryCode === 'INDEPEND');
      


      const filePathIndependent = path.join(FILE_STORAGE_DIR, 'allindependentschools.csv');
      independentSchools = this.relabelSchoolProperties(independentSchools, propertyOrder)
  
      await this.writeCSVToFile(independentSchools, filePathIndependent);
  
      // ✅ Send file response for public schools
      
      
    } catch (e) {
      console.error('Error generating CSV:', e);
    }
  },
  relabelSchoolProperties(schools, propertyOrder) {
    return schools.map(school => {
      const relabeled = {};
      propertyOrder.forEach(({ property, label }) => {
        relabeled[label] = school[property] ?? "";
      });
      return relabeled;
    });
  },
  // Helper function to convert JSON to CSV and write to file
  async writeCSVToFile(data, filePath) {
    return new Promise((resolve, reject) => {
      jsonExport(data, (err, csv) => {
        if (err) return reject(err);
        fs.writeFile(filePath, '\ufeff' + csv, (error) => {
          if (error) return reject(error);
          resolve();
        });
      });
    });
  }
    
}

module.exports = cacheService;
