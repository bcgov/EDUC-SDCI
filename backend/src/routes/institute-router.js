
const express = require('express');
const router = express.Router();
const log = require('../components/logger');
const config = require('../config/index');
const NodeCache = require("node-cache");
const jsonwebtoken = require("jsonwebtoken");
const axios = require("axios");

const cache = new NodeCache({ stdTTL: config.get("server:instituteAPITokenExpiry") });
const listCache = new NodeCache({ stdTTL: 21600 });
const clientId = config.get("oidc:clientId");
const clientSecret = config.get("oidc:clientSecret")
const tokenEndpoint = config.get("oidc:tokenEndpoint")

const data = {
  grant_type: "client_credentials",
  client_id: clientId,
  client_secret: clientSecret,
};

//Batch Routes
router.get('/school/list', checkToken, getSchoolList);
router.get('/*',checkToken, getInstituteAPI);


function createSchoolList(schools) {
  return schools.map(function(school) {
    return {
      mincode: school.mincode,
      displayName: school.displayName
    };
  });
}

async function getSchoolList(req, res) {
  const memToken = await cache.get("token");  
  if(await !listCache.has("schoollist")){
    const url = `${config.get('server:instituteAPIURL')}/institute/school`; // Update the URL according to your API endpoint
    axios
      .get(url, { headers: { Authorization: `Bearer ${memToken}` } })
      .then((response) => {
        const schoolList = createSchoolList(response.data)
        res.json(schoolList);
        listCache.set("schoollist", schoolList)
        log.info(req.url);
      })
      .catch((e) => {
        log.error('getSchoolsList Error', e.response ? e.response.status : e.message);
      });    
  }else{
    schoolList = await listCache.get("schoollist")
    res.json(schoolList)
  }
  
}

async function getNewToken(req, res, next) {
  await axios
  .post(tokenEndpoint, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  .then((response) => {
    let accessToken = response.data.access_token;
    cache.set("token", accessToken);
  })
  .catch((error) => {
    console.error("Error:", error.response.data);
  });
} 
async function checkToken(req, res, next) {
  try{
    if(await !cache.has("token") ){
      await getNewToken();
    }
    next();  
  }catch(error){
    console.log(error)
  }
}
async function getInstituteAPI(req, res) {
  console.log("GET INSTITUTE")
  const memToken = await cache.get("token");  
  const url = `${config.get('server:instituteAPIURL')}/institute` + req.url;
  axios
    .get(url, { headers: { Authorization: `Bearer ${memToken}` } })
    .then((response) => {
      res.json(response.data);
      log.info(req.url);
    })
    .catch((e) => {
      log.error('getData Error', e.response ? e.response.status : e.message);
    });
}
module.exports = router;
