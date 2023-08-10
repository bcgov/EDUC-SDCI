
const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const NodeCache = require("node-cache");
const axios = require("axios");
const { checkToken } = require("../components/auth");
const { createSchoolList } = require("../components/utils"); 


const listCache = new NodeCache({ stdTTL: 21600 });
const schoolListFields = ['mincode', 'displayName']; 
//Batch Routes
router.get('/:id', checkToken, getDistrict);

async function removeItemsFromDistrictDataResponse(response, itemsToRemove) {
  if (response && response.data) {
    const newData = { ...response.data };

    if (itemsToRemove && Array.isArray(itemsToRemove)) {
      itemsToRemove.forEach(item => {
        if (newData[item]) {
          delete newData[item];
        }
      });
    }

    response.data = newData;
  }
}

async function getSchoolList(req, res) {
  
  if(await !listCache.has("schoollist")){
    console.log("GETTING NEW SCHOOL LIST")
    const url = `${config.get('server:instituteAPIURL')}/institute/school`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const schoolList = createSchoolList(response.data, schoolListFields);
        res.json(schoolList);
        listCache.set("schoollist", schoolList)
        log.info(req.url);
      })
      .catch((e) => {
        log.error('getSchoolsList Error', e.response ? e.response.status : e.message);
      });    
  }else{
    console.log("USING SCHOOL LIST CACHE")
    schoolList = await listCache.get("schoollist")
    res.json(schoolList)
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
          key: 'districtID',
          operation: 'eq',
          value: id,
          valueType: 'UUID',
          condition: 'AND'
        }
      ]
    }
  ];

  const jsonString = JSON.stringify(params)
  const encodedParams = encodeURIComponent(jsonString)

  const url = `${config.get('server:instituteAPIURL')}/institute/district/${id}`;
  const districtSchoolsUrl = `${config.get('server:instituteAPIURL')}/institute/school/paginated?pageNumber=1&pageSize=10&searchCriteriaList=${encodedParams}`;
  //const districtSchoolsUrl = `${config.get('server:instituteAPIURL')}/institute/school/paginated?pageNumber=1&pageSize=10`;
  
  console.log(districtSchoolsUrl)
  

  try {
    const districtDataResponse = await axios.get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } });
    const districtSchoolsResponse = await axios.get(districtSchoolsUrl, { headers: { Authorization: `Bearer ${req.accessToken}` } });
    const districtJSON = {
      districtData: districtDataResponse.data,
      districtSchools: districtSchoolsResponse.data.content
    };
    
    res.json(districtJSON);
    log.info(req.url);
  } catch (e) {
    log.error('getData Error', e.response ? e.response.status : e.message);
  }
}
module.exports = router;