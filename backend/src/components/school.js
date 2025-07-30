'use strict';
const { logApiError, errorResponse, getAccessToken, getDataWithParams, getData, putData, postData, handleExceptionResponse,
  getCreateOrUpdateUserValue
} = require('./utils');
const cacheService = require('./cache-service');
const log = require('./logger');
const config = require('../config');
const {FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../util/constants');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');


async function getAllCachedSchools(_req, res){
  try {
    let cachedSchools = cacheService.getAllSchoolsJSON();
    return res.status(200).json(cachedSchools ? cachedSchools : []);
  } catch (e) {
    logApiError(e, 'getAllCachedSchools', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function getAddressTypeCodes(_req, res){
  try {
    let addressTypeCodes = cacheService.getAddressTypeCodes();
    return res.status(200).json(addressTypeCodes ? addressTypeCodes : []);
  } catch (e) {
    logApiError(e, 'getAddressTypeCodes', 'Error occurred while attempting to GET address type codes.');
    return errorResponse(res);
  }
}
async function getCategoryCodes(_req, res){
  try {
    let categoryCodes = cacheService.getCategoryCodes();
    return res.status(200).json(categoryCodes ? categoryCodes : []);
  } catch (e) {
    logApiError(e, 'getCategoryCodes', 'Error occurred while attempting to GET category codes.');
    return errorResponse(res);
  }
}
async function getFacilityCodes(_req, res){
  try {
    let facilityCodes = cacheService.getFacilityCodes();
    return res.status(200).json(facilityCodes ? facilityCodes : []);
  } catch (e) {
    logApiError(e, 'getFacilityCodes', 'Error occurred while attempting to GET facility codes.');
    return errorResponse(res);
  }
}
async function getGradeCodes(_req, res){
  try {
    let gradeCodes = cacheService.getGradeCodes();
    return res.status(200).json(gradeCodes ? gradeCodes : []);
  } catch (e) {
    logApiError(e, 'getGradeCodes', 'Error occurred while attempting to GET grade codes.');
    return errorResponse(res);
  }
}
async function getAllSchoolsList(_req, res){
  try {
    const schoolData = cacheService.getAllSchoolsJSON();
    const schoolsList = schoolData.map(({ schoolID, schoolName, mincode }) => ({
      schoolID,
      schoolName,
      mincode,
    }));

    return res.status(200).json(schoolsList ? schoolsList : []);
  } catch (e) {
    logApiError(e, 'getAllSchoolList', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}


function checkSchoolBelongsToDistrict(req, res) {
  if (!res.locals.requestedInstituteIdentifier) {
    return res.status(200).json(false);
  }
  if (req.session.activeInstituteType !== 'DISTRICT') {
    return res.status(200).json(false);
  }
  let schoolBelongsToEdxDistrictUser = doesSchoolBelongToDistrict(res.locals.requestedInstituteIdentifier, req.session.activeInstituteIdentifier);
  return res.status(200).json(schoolBelongsToEdxDistrictUser);
}

async function getFullSchoolDetails(req, res){
  const token = getAccessToken(req);
  return Promise.all([
    getData(token, `${config.get('institute:rootURL')}/school/${res.locals.requestedInstituteIdentifier}`, req.session?.correlationID),
  ])
    .then(async ([dataResponse]) => {
      delete dataResponse['schoolFundingGroups'];
      delete dataResponse['schoolMove'];
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getFullSchoolDetails', 'Error getting school details by ID from API.');
      return errorResponse(res);
    });
}

async function getAllSchoolDetails(req, res){
  return Promise.all([
    getSchoolsPaginated(req)
  ])
    .then(async ([dataResponse]) => {
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getAllSchoolDetails', 'Error getting paginated list of school details.');
      return errorResponse(res);
    });
}

async function getSchoolsPaginated(req){
  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject('getSchoolsPaginated error: User activeInstituteIdentifier does not exist in session');
  }

  let parsedParams = req.query.searchParams;

  const schoolSearchCriteria = [{
    condition: null,
    searchCriteriaList: createSchoolSearchCriteria(parsedParams),
  }];

  const schoolSearchParam = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(schoolSearchCriteria)
    }
  };

  const accessToken = getAccessToken(req);
  return getDataWithParams(accessToken, `${config.get('institute:rootURL')}/school/paginated`, schoolSearchParam, req.session?.correlationID);
}

function createSchoolSearchCriteria(searchParams){

  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'status'){
      let currentDate = new Date().toISOString().substring(0,19);

      if(pValue === 'Open'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      } else if (pValue === 'Opening'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'Closing'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'NotClosed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.OR});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR});
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.NOT_EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      }
    }
    if(key === 'pubEarlyLearning'){
      searchCriteriaList.push({key: 'schoolCategoryCode', operation: FILTER_OPERATION.IN, value: 'EAR_LEARN,PUBLIC,YUKON', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if(key === 'schoolID'){
      searchCriteriaList.push({key: 'schoolId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'districtID'){
      searchCriteriaList.push({key: 'districtID', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'type'){
      searchCriteriaList.push({key: 'facilityTypeCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

module.exports = {
  getAllCachedSchools,
  getAllSchoolDetails,
  getFullSchoolDetails,
  checkSchoolBelongsToDistrict,
  getAllSchoolsList,
  getAddressTypeCodes,
  getCategoryCodes,
  getFacilityCodes,
  getGradeCodes

};
