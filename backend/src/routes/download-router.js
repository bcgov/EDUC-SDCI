const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");
const { checkToken } = require("../components/auth");
const json2xls = require('json2xls');
const fs = require('fs');
const path = require('path');
const {isSafeFilePath} = require("../components/utils")
const { listCache } = require("../components/cache");

const FILE_STORAGE_DIR = path.join(__dirname, '../..', 'public');

router.get('/excel/*', checkToken, getData, addDistrictLabels, createExcelDownload, getExcelDownload);

async function createExcelDownload(req,res, next){
    try {
    const filepath = req.query.filepath;

    if (!filepath) {
      return res.status(400).send("Missing 'filepath' parameter");
    }else{
      if (!isSafeFilePath(filepath)) {
        return res.status(400).send("Invalid 'filepath' parameter");
      }
    }

    const filePath = path.join(FILE_STORAGE_DIR, `${filepath}.xlsx`);
      
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${filepath}.xlsx"`);
      return res.sendFile(filePath);
    }
    
    const xls = json2xls(req.jsonData);
    await writeFileAsync(filePath, xls, 'binary');
    next();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
}
async function writeFileAsync(filePath, data, encoding) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, encoding, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function addDistrictLabels(req, res, next) {
    try {
      let districtList = [];


      if (listCache.has("districtList")) {
        districtList=  listCache.get("districtList");
      } else {
        try {
          const response = await axios.get('http://localhost:8080/api/v1/institute/district/list', { headers: { Authorization: `Bearer ${req.accessToken}` } }); 
            const districts = response.data;
            listCache.set("districtList", districts);
            districtList = districts
      
        } catch (error) {
          // Handle errors during the API request
          throw new Error('Error fetching districts: ' + error.message);
        }
      }
    
      if (req.jsonData && Array.isArray(req.jsonData)) {
        req.jsonData.forEach(dataItem => {
          const district = districtList.find(item => item.districtId === dataItem.districtId);
          if (district) {
            dataItem.districtNumber = district.districtNumber;
            dataItem.displayName = district.displayName;
          }
        });
      }

      next();
    } catch (error) {
      // Handle errors here
      console.error(error);
      res.status(500).send('An error occurred.');
    }
  };


async function getData(req, res,next){
  try {
    const url = `${config.get('server:instituteAPIURL')}` + req.url.replace('/excel', '');
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } });
    // Attach the fetched data to the request object
    req.jsonData = response.data.content;
    next(); // Call the next middleware
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
}

async function getExcelDownload(req, res) {
  try {
    const filepath = req.query.filepath;
    if (!filepath) {
      return res.status(400).send("Missing 'filepath' parameter");
    }else{
      if (!isSafeFilePath(filepath)) {
        return res.status(400).send("Invalid 'filepath' parameter");
      }
    }

    const filePath = path.join(FILE_STORAGE_DIR, `${filepath}.xlsx`);
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = router;