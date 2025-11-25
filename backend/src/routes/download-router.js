const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const axios = require("axios");
const { checkToken } = require("../components/auth");
const jsonExport = require("jsonexport");
const fs = require("fs");
const path = require("path");
const FILE_STORAGE_DIR = path.join(__dirname, "../..", "public");

router.get("/csv/*", checkToken, getCSVDownload);
router.get("/flush-cache/:token", flushFileCache);

async function flushFileCache(req, res) {
  try {
    const providedToken = req.params.token;
    const configuredToken = config.get("server:clearFilesKey");

    if (providedToken !== configuredToken) {
      return res.status(403).send("Invalid token");
    }
    const directoryPath = FILE_STORAGE_DIR;
    // Read all files in the directory
    fs.readdirSync(directoryPath).forEach((file) => {
      const filePath = path.join(directoryPath, file);

      // Delete each file
      fs.unlinkSync(filePath);
    });

    res.status(200).send("All files in the directory deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

async function getCSVDownload(req, res) {
  try {
    const filepath = req.query.filepath;
    console.log(filepath);
    if (!filepath) {
      return res.status(400).send("Missing 'filepath' parameter");
    }

    const filePath = path.join(FILE_STORAGE_DIR, `${filepath}.csv`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }
    console.log(filepath);
    // Send the file inline (so CSV can open in browser)
    res.sendFile(filePath);

    // 👉 Or if you want to force download:
    // res.download(filePath, `${filepath}.csv`);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error - getCSVDownload");
  }
}

module.exports = router;
