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

const FILE_STORAGE_DIR = path.join(__dirname, '../..', 'public');


router.get('/excel/*', checkToken, getExcelDownload);
//router.get('/csv/*', checkToken, getCSVDownload);

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
      
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${filepath}.xlsx"`);
      return res.sendFile(filePath);
    }

    const url = `${config.get('server:instituteAPIURL')}` + req.url.replace('/excel', '');
    
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } });
    
    const xls = json2xls(response.data.content);
    await writeFileAsync(filePath, xls, 'binary');
    console.log("Sending newly created Excel file as response");
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
}


module.exports = router;