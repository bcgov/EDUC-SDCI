'use strict';
const { errorResponse, getAccessToken, getData, putData, postData, handleExceptionResponse, getCreateOrUpdateUserValue} = require('./utils');
const log = require('./logger');
const config = require('../config');
const HttpStatus = require('http-status-codes');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');

async function getAllDistrictList(req, res){
    const token = getAccessToken(req);
    return Promise.all([
      getData(token, `${config.get('institute:rootURL')}/district/${res.locals.requestedInstituteIdentifier}`, req.session?.correlationID),
    ])
      .then(async ([dataResponse]) => {
        return res.status(200).json(dataResponse);
      }).catch(e => {
        log.error(e, 'getDistrictByDistrictID', 'Error getting district details by ID from API.');
        return errorResponse(res);
      });
  }
  
module.exports = {
  // getDistrictByDistrictID,
  getAllDistrictList
};