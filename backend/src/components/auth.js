const NodeCache = require("node-cache");
const axios = require("axios");
const config = require("../config/index");

const tokenCache = new NodeCache({
  stdTTL: config.get("server:instituteAPITokenExpiry"),
});

const clientId = config.get("oidc:clientId");
const clientSecret = config.get("oidc:clientSecret");
const tokenEndpoint = config.get("oidc:tokenEndpoint");

const data = {
  grant_type: "client_credentials",
  client_id: clientId,
  client_secret: clientSecret,
};

async function getNewToken() {
  try {
    const response = await axios.post(tokenEndpoint, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    tokenCache.set("token", accessToken);
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}

async function checkToken(req, res, next) {
  try {
    if (!tokenCache.has("token")) {
      await getNewToken();
    }
    // Set the token as a property on the request object
    req.accessToken = await tokenCache.get("token");
    next();
  } catch (error) {
    console.log(error);
  }
}

module.exports = { checkToken };
