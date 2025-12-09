"use strict";
const {
  logApiError,
  errorResponse,
  getAccessToken,
  getDataWithParams,
  getData,
} = require("./utils");
const cacheService = require("./cache-service");
const log = require("./logger");
const config = require("../config");
const {
  FILTER_OPERATION,
  VALUE_TYPE,
  CONDITION,
} = require("../util/constants");
const HttpStatus = require("http-status-codes");
const _ = require("lodash");
const { LocalDate, DateTimeFormatter } = require("@js-joda/core");

function checkSchoolBelongsToDistrict(req, res) {
  if (!res.locals.requestedInstituteIdentifier) {
    return res.status(200).json(false);
  }
  if (req.session.activeInstituteType !== "DISTRICT") {
    return res.status(200).json(false);
  }
  let schoolBelongsToEdxDistrictUser = doesSchoolBelongToDistrict(
    res.locals.requestedInstituteIdentifier,
    req.session.activeInstituteIdentifier
  );
  return res.status(200).json(schoolBelongsToEdxDistrictUser);
}

async function getFullSchoolDetails(req, res) {
  const token = getAccessToken(req);
  return Promise.all([
    getData(
      token,
      `${config.get("institute:rootURL")}/school/${
        res.locals.requestedInstituteIdentifier
      }`,
      req.session?.correlationID
    ),
  ])
    .then(async ([dataResponse]) => {
      delete dataResponse["schoolFundingGroups"];
      delete dataResponse["schoolMove"];
      return res.status(200).json(dataResponse);
    })
    .catch((e) => {
      log.error(
        e,
        "getFullSchoolDetails",
        "Error getting school details by ID from API."
      );
      return errorResponse(res);
    });
}

async function getAllSchoolDetails(req, res) {
  return Promise.all([getSchoolsPaginated(req)])
    .then(async ([dataResponse]) => {
      return res.status(200).json(dataResponse);
    })
    .catch((e) => {
      log.error(
        e,
        "getAllSchoolDetails",
        "Error getting paginated list of school details."
      );
      return errorResponse(res);
    });
}

async function getSchoolsPaginated(req) {
  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject(
      "getSchoolsPaginated error: User activeInstituteIdentifier does not exist in session"
    );
  }

  let parsedParams = req.query.searchParams;

  const schoolSearchCriteria = [
    {
      condition: null,
      searchCriteriaList: createSchoolSearchCriteria(parsedParams),
    },
  ];

  const schoolSearchParam = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(schoolSearchCriteria),
    },
  };

  const accessToken = getAccessToken(req);
  return getDataWithParams(
    accessToken,
    `${config.get("institute:rootURL")}/school/paginated`,
    schoolSearchParam,
    req.session?.correlationID
  );
}

function createSchoolSearchCriteria(searchParams) {
  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function (key) {
    let pValue = searchParams[key];
    if (key === "status") {
      let currentDate = new Date().toISOString().substring(0, 19);

      if (pValue === "Open") {
        searchCriteriaList.push({
          key: "openedDate",
          operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO,
          value: currentDate,
          valueType: VALUE_TYPE.DATE_TIME,
          condition: CONDITION.AND,
        });
        searchCriteriaList.push({
          key: "closedDate",
          operation: FILTER_OPERATION.EQUAL,
          value: null,
          valueType: VALUE_TYPE.STRING,
          condition: CONDITION.AND,
        });
      } else if (pValue === "Opening") {
        searchCriteriaList.push({
          key: "openedDate",
          operation: FILTER_OPERATION.GREATER_THAN,
          value: currentDate,
          valueType: VALUE_TYPE.DATE_TIME,
          condition: CONDITION.AND,
        });
      } else if (pValue === "Closing") {
        searchCriteriaList.push({
          key: "closedDate",
          operation: FILTER_OPERATION.GREATER_THAN,
          value: currentDate,
          valueType: VALUE_TYPE.DATE_TIME,
          condition: CONDITION.AND,
        });
      } else if (pValue === "NotClosed") {
        searchCriteriaList.push({
          key: "closedDate",
          operation: FILTER_OPERATION.GREATER_THAN,
          value: currentDate,
          valueType: VALUE_TYPE.DATE_TIME,
          condition: CONDITION.OR,
        });
        searchCriteriaList.push({
          key: "closedDate",
          operation: FILTER_OPERATION.EQUAL,
          value: null,
          valueType: VALUE_TYPE.STRING,
          condition: CONDITION.OR,
        });
        searchCriteriaList.push({
          key: "openedDate",
          operation: FILTER_OPERATION.NOT_EQUAL,
          value: null,
          valueType: VALUE_TYPE.STRING,
          condition: CONDITION.AND,
        });
      }
    }
    if (key === "pubEarlyLearning") {
      searchCriteriaList.push({
        key: "schoolCategoryCode",
        operation: FILTER_OPERATION.IN,
        value: "EAR_LEARN,PUBLIC,YUKON",
        valueType: VALUE_TYPE.STRING,
        condition: CONDITION.AND,
      });
    }
    if (key === "schoolID") {
      searchCriteriaList.push({
        key: "schoolId",
        operation: FILTER_OPERATION.EQUAL,
        value: pValue,
        valueType: VALUE_TYPE.UUID,
        condition: CONDITION.AND,
      });
    }
    if (key === "districtID") {
      searchCriteriaList.push({
        key: "districtID",
        operation: FILTER_OPERATION.EQUAL,
        value: pValue,
        valueType: VALUE_TYPE.UUID,
        condition: CONDITION.AND,
      });
    }
    if (key === "type") {
      searchCriteriaList.push({
        key: "facilityTypeCode",
        operation: FILTER_OPERATION.EQUAL,
        value: pValue,
        valueType: VALUE_TYPE.STRING,
        condition: CONDITION.AND,
      });
    }
  });

  return searchCriteriaList;
}

async function getSchoolList(_req, res) {
  const activeSchools = cacheService.getActiveSchools();
  const trimmedSchools = (activeSchools || []).map((school) => ({
    mincode: school.mincode,
    displayName: school.displayName,
    schoolId: school.schoolId,
    closedDate: school.closedDate,
    openedDate: school.openedDate,
    schoolCategoryCode: school.schoolCategoryCode,
  }));
  return res.status(200).json(trimmedSchools);
}

async function getSchoolBySchoolID(req, res) {
  const { schoolId } = req.params;
  const school = cacheService.getSchoolMap().get(schoolId);

  if (school) {
    return res.status(200).json(school); // send the school object
  } else {
    return res.status(404).json({ message: "School not found" });
  }
}

module.exports = {
  getAllSchoolDetails,
  getFullSchoolDetails,
  checkSchoolBelongsToDistrict,
  getSchoolList,
  getSchoolBySchoolID,
};
