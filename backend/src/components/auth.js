const axios = require("axios");
const Ioredis = require("ioredis");
const config = require("../config/index");

const redisHost = 'localhost';
const redisPort = 6379;

const client = new Ioredis(redisPort, redisHost);
const clientId = config.get("oidc:clientId");
const clientSecret = config.get("oidc:clientSecret");
const tokenEndpoint = config.get("oidc:tokenEndpoint");
const instituteAPITokenExpiry = config.get("server:instituteAPITokenExpiry");

const data = {
  grant_type: "client_credentials",
  client_id: clientId,
  client_secret: clientSecret,
};

async function getNewToken() {
  console.log("GETTING TOKEN FROM ENDPOINT");
  try {
    const response = await axios.post(tokenEndpoint, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    console.log("NEW TOKEN RECEIVED " + accessToken);
    await client.set("token", accessToken, 'EX', instituteAPITokenExpiry);
  } catch (error) {
    console.error("Error getting a new token:", error.response?.data || error.message);
    // Rethrow the error to indicate the failure
    throw error;
  }
}

async function checkToken(req, res, next) {
  try {
    const ttl = await client.ttl('token');
    console.log("TTL: " + ttl);

    if (ttl < 0) {
      console.log("TOKEN EXPIRED - GETTING A NEW TOKEN");
      await getNewToken();
    }

    const cachedToken = await client.get('token');
    console.log("CACHED TOKEN: " + cachedToken);

    req.accessToken = cachedToken;
    console.log("NEXT");
    next();
  } catch (error) {
    console.log("ERROR");
    console.error(error);
    // Handle the error or pass it to the error handler middleware
    // depending on your application structure
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { checkToken };