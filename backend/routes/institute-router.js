
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
async function getToken(req, res, next) {
  axios
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
  next();
}
async function getInstituteAPI(req, res) {
  const memToken = cache.get("token");
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
