const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");
const { checkToken } = require("../components/auth");
const jsonExport = require('jsonexport');
const fs = require('fs');
const path = require('path');
const {isSafeFilePath} = require("../components/utils")
const { listCache, fileCache, schoolCache, createCache } = require("../components/cache");
const FILE_STORAGE_DIR = path.join(__dirname, '../..', 'public');

router.get('/csv/*', checkToken, getDownload, createCSVFile, getCSVDownload);
router.get('/flush-cache/:token', flushFileCache);

async function flushFileCache(req, res) {
  try {
    const providedToken = req.params.token;
    const configuredToken = config.get('server:clearFilesKey');

    if (providedToken !== configuredToken) {
      return res.status(403).send('Invalid token');
    }
    fileCache.flushAll();
    schoolCache.flushAll();
    const directoryPath = FILE_STORAGE_DIR ;
    // Read all files in the directory
    fs.readdirSync(directoryPath).forEach((file) => {
      const filePath = path.join(directoryPath, file);

      // Delete each file
      fs.unlinkSync(filePath);
    });
    

    
    res.status(200).send('All files in the directory deleted successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function createCSVFile(req,res, next){
  try {
  
    jsonExport(req.jsonData, async function(err, csv){
      if (err) return console.error(err);
      await writeFileAsync(filePath, csv, 'binary');
      next();
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error- Write File Sync issue");
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

async function getDownload(req, res,next){
  
  console.log("download")
  const filepath = req.query.filepath;
  if (!filepath) {
    return res.status(400).send("Missing 'filepath' parameter");
  }else{
    if (!isSafeFilePath(filepath)) {
      return res.status(400).send("Invalid 'filepath' parameter");
    }
  }
  filePath = path.join(FILE_STORAGE_DIR, `${filepath}.csv`);
  if(fileCache.has(filepath)){
    const file = path.join(FILE_STORAGE_DIR, `${filepath}.csv`);
    res.setHeader('Content-Disposition', `attachment; filename="${filepath}.csv"`);
    return res.sendFile(file);
  }else{
    try {
      const path = req.url.replace('/csv', ''); // Modify the URL path as neededz
      
      const url =`${config.get("server:backend")}/v1${path}`
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } });
      // Attach the fetched data to the request object
      if (response.data?.content) {
        req.jsonData = response.data.content;
      }else{
        req.jsonData = response.data;
      }
      fileCache.set(filepath, req.jsonData)
      next(); // Call the next middleware
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal server error - Getting Download");
    }
  }
}

async function getCSVDownload(req, res) {
  try {
    const filepath = req.query.filepath;
    if (!filepath) {
      return res.status(400).send("Missing 'filepath' parameter");
    }else{
      if (!isSafeFilePath(filepath)) {
        return res.status(400).send("Invalid 'filepath' parameter");
      }
    }
    const filePath = path.join(FILE_STORAGE_DIR, `${filepath}.csv`);
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error - getCSVDownload");
  }
}

module.exports = router;