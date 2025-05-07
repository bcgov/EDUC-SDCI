"use strict";

const axios = require("axios");
const config = require("../config/index");
const log = require("./logger");
const jsonwebtoken = require("jsonwebtoken");
const qs = require("querystring");
const safeStringify = require("fast-safe-stringify");
const userRoles = require("./roles");
const { partial, fromPairs } = require("lodash");
const HttpStatus = require("http-status-codes");
const { pick } = require("lodash");
const { ApiError } = require("./error");
let discovery = null;
let serviceToken = null;


const NodeCache = require("node-cache");

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
const auth = {
  // Check if JWT Access Token has expired
  // logic to add 30 seconds to the check is to avoid edge case when the token is valid here
  // but expires just before the api call due to ms time difference, so if token is expiring within next 30 seconds, refresh it.
  isTokenExpired(token) {
    const now = Date.now().valueOf() / 1000;
    const payload = jsonwebtoken.decode(token);

    return !!payload["exp"] && payload["exp"] < now + 30; // Add 30 seconds to make sure , edge case is avoided and token is refreshed.
  },

  async getBackendServiceToken() {
    if (serviceToken) {
      if (auth.isTokenExpired(serviceToken)) {
        log.info("Service token is expired, fetching new service client token");
        serviceToken = await auth.getServiceAccountToken();
      }
    } else {
      log.info("Service token not found, fetching new service client token");
      serviceToken = await auth.getServiceAccountToken();
    }

    return serviceToken;
  },

  getBackendToken(req) {
    const thisSession = req.session;
    return (
      thisSession &&
      thisSession["passport"] &&
      thisSession["passport"].user &&
      thisSession["passport"].user.jwt
    );
  },

  async getServiceAccountToken() {
    try {
      const discovery = await auth.getOidcDiscovery();
      const response = await axios.post(
        discovery.token_endpoint,
        qs.stringify({
          client_id: config.get("oidc:serviceClientId"),
          client_secret: config.get("oidc:serviceClientSecret"),
          grant_type: "client_credentials",
          scope: "openid profile",
        }),
        {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      let result = {};
      result.accessToken = response.data.access_token;
      return result.accessToken;
    } catch (error) {
      log.error(
        "getServiceAccountToken Error",
        error.response
          ? pick(error.response, ["status", "statusText", "data"])
          : error.message
      );
      const status = error.response
        ? error.response.status
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new ApiError(
        status,
        { message: "Get getServiceAccountToken error" },
        error
      );
    }
  },

  // Check if JWT Refresh Token has expired
  isRenewable(token) {
    const now = Date.now().valueOf() / 1000;
    const payload = jsonwebtoken.decode(token);

    // Check if expiration exists, or lacks expiration
    if (typeof payload["exp"] !== "undefined" && payload["exp"] !== null) {
      return payload["exp"] === 0 || payload["exp"] > now;
    } else if (
      typeof payload["iat"] !== "undefined" &&
      payload["iat"] !== null
    ) {
      const expiresIn = config.get("tokenGenerate:expiresIn") || "1800";
      return payload["iat"] + parseInt(expiresIn) > now;
    } else {
      return false;
    }
  },

  // Get new JWT and Refresh tokens
  async renew(refreshToken) {
    let result = {};

    try {
      const discovery = await auth.getOidcDiscovery();
      const response = await axios.post(
        discovery.token_endpoint,
        qs.stringify({
          client_id: config.get("oidc:clientId"),
          client_secret: config.get("oidc:clientSecret"),
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          scope: "openid profile",
        }),
        {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      result.jwt = response.data.access_token;
      result.refreshToken = response.data.refresh_token;
    } catch (error) {
      log.error("renew", error.message);
      result = error.response.data;
    }

    return result;
  },

  // Update or remove token based on JWT and user state
  async refreshJWT(req, _res, next) {
    try {
      if (req?.user?.jwt) {
        log.verbose("refreshJWT", "User & JWT exists");

        if (auth.isTokenExpired(req.user.jwt)) {
          log.verbose("refreshJWT", "JWT has expired");

          if (
            req?.user?.refreshToken &&
            auth.isRenewable(req.user.refreshToken)
          ) {
            log.verbose("refreshJWT", "Can refresh JWT token");
            // Get new JWT and Refresh Tokens and update the request
            const result = await auth.renew(req.user.refreshToken);
            req.user.jwt = result.jwt; // eslint-disable-line require-atomic-updates
            req.user.refreshToken = result.refreshToken; // eslint-disable-line require-atomic-updates
          } else {
            log.verbose("refreshJWT", "Cannot refresh JWT token");
            delete req.user;
          }
        }
      } else {
        log.verbose("refreshJWT", "No existing User or JWT");
        delete req.user;
      }
    } catch (error) {
      log.error("refreshJWT", error.message);
    }
    next();
  },
  
  async getApiCredentials(client_id, client_secret, grant_type, scope) {
  
    try {
      const discovery = await auth.getOidcDiscovery();
      const response = await axios.post(
        discovery.token_endpoint,
        qs.stringify({
          client_id: client_id,
          client_secret: client_secret,
          grant_type: grant_type,
          scope: scope,
        }),
        {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // log.verbose("getApiCredentials Res", safeStringify(response.data));

      let result = {};
      result.accessToken = response.data.access_token;
      result.refreshToken = response.data.refresh_token;
      return result;
    } catch (error) {
      log.error(
        "getApiCredentials Error",
        error.response
          ? pick(error.response, ["status", "statusText", "data"])
          : error.message
      );
      const status = error.response
        ? error.response.status
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new ApiError(
        status,
        { message: "Get getApiCredentials error" },
        error
      );
    }
  },

  async getOidcDiscovery() {
    if (!discovery) {
      try {
        const response = await axios.get(config.get("oidc:discovery"));
        discovery = response.data;
      } catch (error) {
        log.error(
          "getOidcDiscovery",
          `OIDC Discovery failed - ${error.message}`
        );
      }
    }
    return discovery;
  },
};

module.exports = { checkToken, auth };
