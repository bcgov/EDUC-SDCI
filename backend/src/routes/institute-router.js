
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
router.get('/school/list', checkToken, getSchoolList);
router.get('/*', checkToken, getInstituteAPI);


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




async function getInstituteAPI(req, res) {
  const url = `${config.get('server:instituteAPIURL')}/institute` + req.url;
  axios
    .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
    .then((response) => {
      res.json(response.data);
      log.info(req.url);
    })
    .catch((e) => {
      log.error('getData Error', e.response ? e.response.status : e.message);
    });
}
module.exports = router;