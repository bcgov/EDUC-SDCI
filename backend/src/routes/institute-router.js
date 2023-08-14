
const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");

const axios = require("axios");
const { checkToken } = require("../components/auth");
const { createList } = require("../components/utils")
const { listCache } = require("../components/cache");; 

const schoolListFields = ['mincode', 'displayName']; 
//Batch Routes
router.get('/contact-type-codes', checkToken, getContactTypeCodes);
router.get('/school/list', checkToken, getSchoolList);
router.get('/*', checkToken, getInstituteAPI);


async function getContactTypeCodes(req, res) {
  
  if(await !listCache.has("codesList")){
    console.log("GETTING NEW SCHOOL LIST")
    
    const codes = [];
    
    try {
      const authorityContactTypeCodesResponse = await axios.get(`${config.get('server:instituteAPIURL')}/institute/authority-contact-type-codes`, {
        headers: { Authorization: `Bearer ${req.accessToken}` }
      });
      codes.push({ "authorityContactTypeCodes": authorityContactTypeCodesResponse.data });

      const districtContactTypeCodesResponse = await axios.get(`${config.get('server:instituteAPIURL')}/institute/district-contact-type-codes`, {
        headers: { Authorization: `Bearer ${req.accessToken}` }
      });
      codes.push({ "districtContactTypeCodes": districtContactTypeCodesResponse.data });

      const schoolContactTypeCodesResponse = await axios.get(`${config.get('server:instituteAPIURL')}/institute/school-contact-type-codes`, {
        headers: { Authorization: `Bearer ${req.accessToken}` }
      });
      codes.push({ "schoolContactTypeCodes": schoolContactTypeCodesResponse.data });

      res.json(codes);
      listCache.set("codesList", { codesList: codes });
      log.info(req.url);
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      log.error('getSchoolsList Error', statusCode, error.message);
      res.status(statusCode).send(error.message);
    }
    listCache.set("codesList", codes);
    
    

  }else{
    console.log("USING SCHOOL LIST CACHE")
    const cachedCodeList = await listCache.get("codesList");
    res.json(cachedCodeList);
  }
  
}

async function getSchoolList(req, res) {
  
  if(await !listCache.has("schoollist")){
    console.log("GETTING NEW SCHOOL LIST")
    const url = `${config.get('server:instituteAPIURL')}/institute/school`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const schoolList = createList(response.data, schoolListFields);
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

async function getSchoolList(req, res) {
  
  if(await !listCache.has("schoollist")){
    console.log("GETTING NEW SCHOOL LIST")
    const url = `${config.get('server:instituteAPIURL')}/institute/school`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } })
      .then((response) => {
        const schoolList = createList(response.data, schoolListFields);
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