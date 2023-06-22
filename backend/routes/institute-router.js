
const express = require('express');
const router = express.Router();
const config = require('../config/index');
const NodeCache = require("node-cache");
const jsonwebtoken = require("jsonwebtoken");
const axios = require("axios");
const cache = new NodeCache({ stdTTL: 300 });
const clientId = config.get("oidc:clientId");
const clientSecret = config.get("oidc:clientSecret")
const tokenEndpoint = config.get("oidc:tokenEndpoint")

const data = {
  grant_type: "client_credentials",
  client_id: clientId,
  client_secret: clientSecret,
};

//Batch Routes
router.get('/*',getToken, getInstituteAPI);

async function isTokenExpired(token) {
  const now = Date.now().valueOf() / 1000;
  const payload = jsonwebtoken.decode(token);
  console.log(payload)
  console.log("Token: " + payload['exp']) 
  console.log("Time : " + now)

  return (!!payload['exp'] && payload['exp'] < (now + 30)); // Add 30 seconds to make sure , edge case is avoided and token is refreshed.
}

async function getToken(req, res, next) {
  try{
    let token = await cache.get("token")

    if(token && !isTokenExpired(token)){
      console.log("TOKEN IS EXPIRED... GETTING A NEW ONE")
      await axios
      .post(tokenEndpoint, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => {
        let accessToken = response.data.access_token;
        console.log(accessToken)
        cache.set("token", accessToken);
        
      })
      .catch((error) => {
        console.error("Error:", error.response.data);
      });
    }else{
      await axios
      .post(tokenEndpoint, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => {
        let accessToken = response.data.access_token;
        console.log(accessToken)
        cache.set("token", accessToken);
        
      })
      .catch((error) => {
        console.error("Error:", error.response.data);
      });
    }
    next();  
  }catch(error){
    console.log(error)
  }
      
  
  
}
async function getInstituteAPI(req, res) {
  const memToken = await cache.get("token");  

  
  const url = `${config.get('server:instituteAPIURL')}/institute` + req.url;
  axios
    .get(url, { headers: { Authorization: `Bearer ${memToken}` } })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
}
module.exports = router;
