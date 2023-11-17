const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");

const { filterByField, getArrayofNonPubliclyAvailableCodes, normalizeJsonObject, createSchoolCache, addDistrictLabels, formatGrades, sortJSONBySchoolCode, rearrangeAndRelabelObjectProperties} = require("../components/utils");
const { checkToken } = require("../components/auth");
const { schoolCache, listCache, codeCache } = require("../components/cache");

//Batch Routes

router.get("/all/:schoolCategory/", checkToken, getAllSchools);
router.get("/:schoolId", checkToken, getSchool);

async function getSchool(req, res) {
    const {schoolId} = req.params;
    const contactTypeCodes= await listCache.get("codesList")
    const url = `${config.get(
      "server:instituteAPIURL"
    )}/institute/school/` + schoolId;
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        //const openSchoolList = createList(response.data, openSchoolListOptions);
        const schoolGrades = [{"schoolGradeCode":"KINDHALF","label":"Kindergarten Half","description":"Kindergarten half","displayOrder":1,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"KINDFULL","label":"Kindergarten Full","description":"Kindergarten full","displayOrder":2,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE01","label":"Grade 1","description":"First grade","displayOrder":3,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE02","label":"Grade 2","description":"Second grade","displayOrder":4,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE03","label":"Grade 3","description":"Third grade","displayOrder":5,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE04","label":"Grade 4","description":"Fourth grade","displayOrder":6,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE05","label":"Grade 5","description":"Fifth grade","displayOrder":7,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE06","label":"Grade 6","description":"Sixth grade","displayOrder":8,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE07","label":"Grade 7","description":"Seventh grade","displayOrder":9,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"ELEMUNGR","label":"Elementary Ungraded","description":"Elementary ungraded","displayOrder":10,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE08","label":"Grade 8","description":"Eighth grade","displayOrder":11,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE09","label":"Grade 9","description":"Ninth grade","displayOrder":12,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE10","label":"Grade 10","description":"Tenth grade","displayOrder":13,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE11","label":"Grade 11","description":"Eleventh grade","displayOrder":14,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"GRADE12","label":"Grade 12","description":"Twelfth grade","displayOrder":15,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"},{"schoolGradeCode":"SECUNGR","label":"Secondary Ungraded","description":"Secondary ungraded","displayOrder":16,"effectiveDate":"2020-01-01T00:00:00","expiryDate":"2099-12-31T00:00:00"}]
        const schoolData = response.data;
        const includedFields = ['schoolContactTypeCode', 'label', 'description'];
        schoolData.contacts = normalizeJsonObject(schoolData.contacts, contactTypeCodes.codesList.schoolContactTypeCodes, 'schoolContactTypeCode', (info) => info.publiclyAvailable === true, includedFields);
        schoolData.contacts = filterByField(schoolData.contacts, "schoolContactTypeCode", ["STUDREGIS"])
        const formattedGrades = formatGrades(schoolData.grades, schoolGrades);
        const schoolWithFormattedGrades = { ...schoolData, ...formattedGrades };
        res.json(schoolWithFormattedGrades);
      })
      .catch((e) => {
        log.error(
          "getSchools Error",
          e.response ? e.response.status : e.message
        );
      });

}
async function getAllSchoolMailing(req, res) {
  const allSchools = await getAllSchools(req,res)
  console.log(allSchools)
  res.json(allSchools)

}
async function getAllSchools(req, res) {
   
  const {schoolCategory} = req.params
  let params = [];
  if (await !schoolCache.has("openschoollist" + schoolCategory)) {
    if(schoolCategory!='ALL'){
    params = [
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
              key: "schoolCategoryCode",
              operation: "eq",
              value: schoolCategory,
              valueType: "STRING",
              condition: "AND",
          }
        ],
      }
    ];
  }else {
      params = [
        {
          condition: null,
          searchCriteriaList: [
            {
              key: "closedDate",
              operation: "eq",
              value: null,
              valueType: "STRING",
              condition: "AND",
            }
          ]
        }]
    }    
  
    
    const jsonString = JSON.stringify(params);
    const encodedParams = encodeURIComponent(jsonString);
    const districtList = await listCache.get("districtlist")
    const schoolGrades =  await codeCache.get("gradelist");
    
    const url = `${config.get(
      "server:instituteAPIURL"
    )}/institute/school/paginated?pageSize=3000&searchCriteriaList=${encodedParams}`;
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        //const openSchoolList = createList(response.data, openSchoolListOptions);
        
        const openSchoolListWithDistrictLabels = addDistrictLabels(response.data, districtList)
        const openSchoolList = sortJSONBySchoolCode(createSchoolCache(openSchoolListWithDistrictLabels.content, schoolGrades));
        const propertyOrder = [
          
          { property: "displayName", label: "School Name" },
          { property: "mincode", label: "School Code" },
          { property: "districtName", label: "District Name" },
          { property: "districtNumber", label: "District Number" },
          
          { property: "mailing_addressLine1", label: "Address" },
          { property: "mailing_city", label: "City" },
          { property: "mailing_provinceCode", label: "Province" },
          { property: "mailing_postal", label: "Postal Code" },
          // { property: "principalTitle", label: "Principal Title" },
          { property: "firstName", label: "Principal First Name" },
          { property: "lastName", label: "Principal Last Name" },
          { property: "schoolCategoryCode", label: "School Category" },
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
          { property: "GRADE12", label: "Grade 12 Enrollment" }
          
      ];

      openSchoolList.forEach((currentElement, index, array) => {
        const rearrangedElement = rearrangeAndRelabelObjectProperties(currentElement, propertyOrder);
        array[index] = rearrangedElement;
      });
        res.json(openSchoolList);
        schoolCache.set("openschoollist" + schoolCategory, openSchoolList);
        log.info(req.url);
      })
      .catch((e) => {
        log.error(
          "getSchoolsList Error",
          e.response ? e.response.status : e.message
        );
      });
  } else {
    const openSchoolList = await schoolCache.get("openschoollist" + schoolCategory);
    res.json(openSchoolList);
  }
}

module.exports = router;
