"use strict";

const axios = require("axios");
const config = require("../config/index");
const log = require("./logger");
const HttpStatus = require("http-status-codes");
const lodash = require("lodash");
const { ApiError } = require("./error");
const jsonwebtoken = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { LocalDateTime, DateTimeFormatter } = require("@js-joda/core");
const { Locale } = require("@js-joda/locale_en");
const auth = require("./auth");
const cache = require("memory-cache");
let memCache = new cache.Cache();
axios.interceptors.request.use((axiosRequestConfig) => {
  axiosRequestConfig.headers["X-Client-Name"] = "GRAD-ADMIN";
  axiosRequestConfig.headers["Request-Source"] = "grad-admin";
  return axiosRequestConfig;
});

async function getBackendServiceToken() {
  return await auth.getBackendServiceToken();
}

function getUsernameFromToken(token) {
  try {
    const decoded = jsonwebtoken.decode(token); // Use decode if you don't need verification
    return decoded?.idir_username || null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

function getUser(req) {
  const thisSession = req.session;
  if (
    thisSession &&
    thisSession["passport"] &&
    thisSession["passport"].user &&
    thisSession["passport"].user.jwt
  ) {
    try {
      return jsonwebtoken.verify(
        thisSession["passport"].user.jwt,
        config.get("oidc:publicKey")
      );
    } catch (e) {
      log.error("error is from verify", e);
      return false;
    }
  } else {
    return false;
  }
}

function minify(obj, keys = ["documentData"]) {
  return lodash.transform(
    obj,
    (result, value, key) =>
      (result[key] =
        keys.includes(key) && lodash.isString(value)
          ? value.substring(0, 1) + " ..."
          : value)
  );
}

function getSessionUser(req) {
  log.verbose("getSessionUser", req.session);
  const session = req.session;
  return session && session.passport && session.passport.user;
}

function getAccessToken(req) {
  const user = getSessionUser(req);
  return user && user.jwt;
}

async function deleteData(token, url, correlationID) {
  try {
    const username = getUsernameFromToken(token);
    const delConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4(),
        "User-Name": username || "N/A",
      },
    };

    log.info("delete Data Url", url);
    const response = await axios.delete(url, delConfig);
    log.info(`delete Data Status for url ${url} :: is :: `, response.status);
    log.info(
      `delete Data StatusText for url ${url}  :: is :: `,
      response.statusText
    );
    log.verbose(
      `delete Data Response for url ${url}  :: is :: `,
      minify(response.data)
    );

    return response.data;
  } catch (e) {
    log.error("deleteData Error", e.response ? e.response.status : e.message);
    const status = e.response
      ? e.response.status
      : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: "API Delete error" }, e);
  }
}

async function forwardGetReq(req, res, url) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "No access token",
      });
    }

    const params = {
      params: req.query,
    };

    log.info("forwardGetReq Url", url);
    const data = await getDataWithParams(
      accessToken,
      url,
      params,
      req.session?.correlationID
    );
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error("forwardGetReq Error", e.stack);
    return res.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Forward Get error",
    });
  }
}

function addTokenToHeader(params, token) {
  if (params) {
    if (params.headers) {
      params.headers.Authorization = `Bearer ${token}`;
    } else {
      params.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
  } else {
    params = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  return params;
}

async function getCommonServiceData(url, params) {
  try {
    params = addTokenToHeader(params, await getBackendServiceToken());
    log.info("GET", url);
    const response = await axios.get(url, params);
    return response.data;
  } catch (e) {
    log.error(
      "getCommonServiceData Error",
      e.response ? e.response.status : e.message
    );
    const status = e.response
      ? e.response.status
      : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: "API Get error" }, e);
  }
}

async function getData(token, url, correlationID) {
  try {
    const getDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4(),
      },
    };
    // log.info('get Data Url', url);
    const response = await axios.get(url, getDataConfig);
    // log.info(`get Data Status for url ${url} :: is :: `, response.status);
    // log.info(`get Data StatusText for url ${url}  :: is :: `, response.statusText);
    // log.verbose(`get Data Response for url ${url}  :: is :: `, minify(response.data));
    return response.data;
  } catch (e) {
    log.error("getData Error", e.response ? e.response.status : e.message);
    const status = e.response
      ? e.response.status
      : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: "API Get error" }, e);
  }
}

async function getDataWithParams(token, url, params, correlationID) {
  try {
    const username = getUsernameFromToken(token);
    params.headers = {
      Authorization: `Bearer ${token}`,
      correlationID: correlationID || uuidv4(),
      "User-Name": username || "N/A",
    };

    log.info("get Data Url", url);
    const response = await axios.get(url, params);
    log.info(`get Data Status for url ${url} :: is :: `, response.status);
    log.info(
      `get Data StatusText for url ${url}  :: is :: `,
      response.statusText
    );
    log.verbose(
      `get Data Response for url ${url}  :: is :: `,
      minify(response.data)
    );

    return response.data;
  } catch (e) {
    log.error(
      "getDataWithParams Error",
      e.response ? e.response.status : e.message
    );
    const status = e.response
      ? e.response.status
      : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: "API Get error" }, e);
  }
}

async function forwardPostReq(req, res, url) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "No session data",
      });
    }

    const data = await postData(
      accessToken,
      req.body,
      url,
      req.session?.correlationID
    );
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error("forwardPostReq Error", e.stack);
    return res.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Forward Post error",
    });
  }
}

async function postData(token, url, data, correlationID) {
  try {
    const username = getUsernameFromToken(token);
    const postDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4(),
        "User-Name": username || "N/A",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };

    log.info("post Data Url", url);
    log.verbose("post Data Req", minify(data));
    data.createUser = "GRAD";
    data.updateUser = "GRAD";
    const response = await axios.post(url, data, postDataConfig);

    log.info(`post Data Status for url ${url} :: is :: `, response.status);
    log.info(
      `post Data StatusText for url ${url}  :: is :: `,
      response.statusText
    );
    log.verbose(
      `post Data Response for url ${url}  :: is :: `,
      typeof response.data === "string" ? response.data : minify(response.data)
    );

    return response.data;
  } catch (e) {
    log.error("postData Error", e.response ? e.response.status : e.message);
    const status = e.response
      ? e.response.status
      : HttpStatus.INTERNAL_SERVER_ERROR;
    let responseData;
    if (e?.response?.data) {
      responseData = e.response.data;
    } else {
      responseData = { message: `API POST error, on ${url}` };
    }
    throw new ApiError(status, responseData, e);
  }
}

async function putData(token, data, url, correlationID) {
  try {
    const username = getUsernameFromToken(token);
    const putDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4(),
        "User-Name": username || "N/A",
      },
    };

    log.info("put Data Url", url);
    log.verbose("put Data Req", data);

    // set updateUser to GRAD by default if key isn't provided in payload
    if (!data.updateUser) {
      data.updateUser = "GRAD";
    }

    const response = await axios.put(url, data, putDataConfig);

    log.info(`put Data Status for url ${url} :: is :: `, response.status);
    log.info(
      `put Data StatusText for url ${url}  :: is :: `,
      response.statusText
    );
    log.verbose(
      `put Data Response for url ${url}  :: is :: `,
      minify(response.data)
    );

    return response.data;
  } catch (e) {
    log.error("putData Error", e.response ? e.response.status : e.message);
    const status = e.response
      ? e.response.status
      : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: "API Put error" }, e);
  }
}

function formatCommentTimestamp(time) {
  const timestamp = LocalDateTime.parse(time);
  return timestamp.format(
    DateTimeFormatter.ofPattern("yyyy-MM-dd h:mma").withLocale(Locale.CANADA)
  );
}

function getCodeTable(token, key, url, useCache = true) {
  try {
    let cacheContent = useCache && memCache.get(key);
    if (cacheContent) {
      return cacheContent;
    } else {
      const getDataConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      log.info("get Data Url", url);

      return axios
        .get(url, getDataConfig)
        .then((response) => {
          useCache && memCache.put(key, response.data);
          return response.data;
        })
        .catch((e) => {
          log.error(e, "getCodeTable", "Error during get on " + url);
          const status = e.response
            ? e.response.status
            : HttpStatus.INTERNAL_SERVER_ERROR;
          throw new ApiError(status, { message: "API get error" }, e);
        });
    }
  } catch (e) {
    throw new Error(`getCodeTable error, ${e}`);
  }
}
function getCodes(urlKey, cacheKey, extraPath, useCache = true) {
  return async function getCodesHandler(req, res) {
    try {
      const token = auth.getBackendToken(req);
      if (!token) {
        return unauthorizedError(res);
      }
      const url = config.get(urlKey);
      const codes = await getCodeTable(
        token,
        cacheKey,
        extraPath ? `${url}${extraPath}` : url,
        useCache
      );

      return res.status(HttpStatus.OK).json(codes);
    } catch (e) {
      log.error(
        e,
        "getCodes",
        `Error occurred while attempting to GET ${cacheKey}.`
      );
      return errorResponse(res);
    }
  };
}

function unauthorizedError(res) {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    message: "No access token",
  });
}

function errorResponse(res, msg, code) {
  return res.status(code || HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: msg || "INTERNAL SERVER ERROR",
    code: code || HttpStatus.INTERNAL_SERVER_ERROR,
  });
}

const utils = {
  prettyStringify: (obj, indent = 2) => JSON.stringify(obj, null, indent),
  getUser,
  getSessionUser,
  getAccessToken,
  deleteData,
  forwardGetReq,
  getDataWithParams,
  getData,
  getCommonServiceData,
  forwardPostReq,
  postData,
  putData,
  formatCommentTimestamp,
  errorResponse,
  getCodes,
  getBackendServiceToken,
  getCodeTable,
};


function appendMailingAddressDetailsAndRemoveAddresses(data) {
  if (data && data.addresses && data.addresses.length > 0) {
    const physicalAddress = data.addresses?.find(
      (address) => address.addressTypeCode === "PHYSICAL"
    );
    if (physicalAddress) {
      // Extract specific name-value pairs from the mailing address
      const {
        addressLine1,
        addressLine2,
        city,
        postal,
        provinceCode,
        countryCode,
      } = physicalAddress;

      // Add these name-value pairs to the original district object
      data.physicalAddressLine1 = addressLine1;
      data.physicalAddressLine2 = addressLine2;
      data.physicalCity = city;
      data.physicalPostal = postal;
      data.physicalProvinceCode = provinceCode;
      data.physicalCountryCode = countryCode;

      // Remove the "addresses" property
    }
    const courierAddress = data.addresses?.find(
      (address) => address.addressTypeCode === "MAILING"
    );
    if (courierAddress) {
      // Extract specific name-value pairs from the mailing address
      const {
        addressLine1,
        addressLine2,
        city,
        postal,
        provinceCode,
        countryCode,
      } = courierAddress;

      // Add these name-value pairs to the original district object
      data.mailingAddressLine1 = addressLine1;
      data.mailingAddressLine2 = addressLine2;
      data.mailingCity = city;
      data.mailingPostal = postal;
      data.mailingProvinceCode = provinceCode;
      data.mailingCountryCode = countryCode;

      // Remove the "addresses" property
    }
    delete data.addresses;
    delete data.contacts;
  }
}
function addDistrictLabels(jsonData, districtList) {
  if (jsonData.content && Array.isArray(jsonData.content)) {
    jsonData.content.forEach((dataItem) => {
      const district = districtList?.find(
        (item) => item.districtId === dataItem.districtId
      );
      if (district) {
        dataItem.districtNumber = district.districtNumber;
        dataItem.districtName = district.displayName;
      }
    });
  }
  return jsonData;
}

function sortJSONByKey(items, key, numeric = false) {
  return items.slice().sort((a, b) => {
    const valueA = a[key] ?? "";
    const valueB = b[key] ?? "";

    if (numeric) {
      return valueA.toString().localeCompare(valueB.toString(), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }
    return valueA.toString().localeCompare(valueB.toString());
  });
}

function sortByProperty(
  arr,
  propertyName,
  options = { numeric: true, sensitivity: "base" }
) {
  return arr.slice().sort((a, b) => {
    const valueA = a[propertyName] || "";
    const valueB = b[propertyName] || "";
    return valueA.localeCompare(valueB, undefined, options);
  });
}

function rearrangeAndRelabelObjectProperties(object, propertyList) {
  const reorderedObject = {};
  propertyList.forEach((propertyInfo) => {
    const prop = propertyInfo.property;
    const label = propertyInfo.label;
    reorderedObject[label] = object.hasOwnProperty(prop) ? object[prop] : "";
  });
  return reorderedObject;
}
function filterByField(jsonArray, fieldName, stringsToRemove) {
  // Filter the array based on the condition
  const filteredArray = jsonArray.filter((item) => {
    // Extract the field value (or use an empty string if the field is not present)
    const fieldValue = item[fieldName] || "";

    // Check if the fieldValue exactly matches any string from the stringsToRemove array
    return !stringsToRemove.includes(fieldValue);
  });
  return filteredArray;
}
function filterByField(jsonArray, fieldName, stringsToRemove) {
  // Filter the array based on the condition
  const filteredArray = jsonArray.filter((item) => {
    // Extract the field value (or use an empty string if the field is not present)
    const fieldValue = item[fieldName] || "";

    // Check if the fieldValue exactly matches any string from the stringsToRemove array
    return !stringsToRemove.includes(fieldValue);
  });
  return filteredArray;
}

function replaceGroup(input) {
  return input.replace(/GROUP([1-7])/g, (_, num) => `0${num}`);
}

function addFundingGroups(school) {
  try {
    const gradeCategories = {
      primaryK3: ["KINDFULL", "KINDHALF", "GRADE01", "GRADE02", "GRADE03"],
      elementary47: ["GRADE04", "GRADE05", "GRADE06", "GRADE07"],
      juniorSecondary810: ["GRADE08", "GRADE09", "GRADE10"],
      seniorSecondary1112: ["GRADE11", "GRADE12"],
    };

    // Initialize category fields
    school.primaryK3 = "";
    school.elementary47 = "";
    school.juniorSecondary810 = "";
    school.seniorSecondary1112 = "";

    // Build grade → fundingGroup map
    const fundingMap = new Map(
      school.schoolFundingGroups?.map((group) => [
        group.schoolGradeCode,
        replaceGroup(group.schoolFundingGroupCode),
      ]) || []
    );

    // Assign funding group per category
    for (const category in gradeCategories) {
      const offeredGrade = gradeCategories[category].find(
        (gradeCode) => school[gradeCode] === "Y"
      );

      if (offeredGrade) {
        school[category] = fundingMap.get(offeredGrade) || "";
      }
    }

    return school;
  } catch (error) {
    console.error("An error occurred in addFundingGroups:", error);
    throw error;
  }
}

module.exports = {
  addFundingGroups,
  sortByProperty,
  filterByField,
  appendMailingAddressDetailsAndRemoveAddresses,
  sortJSONByKey,
  addDistrictLabels,
  rearrangeAndRelabelObjectProperties,
  utils,
};
