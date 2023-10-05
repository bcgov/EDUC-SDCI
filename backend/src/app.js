const config = require("./config/index");
const log = require("./components/logger");
const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const NodeCache = require("node-cache");
const apiRouter = express.Router();
const instituteRouter = require("./routes/institute-router");
const districtRouter = require("./routes/district-router");
const downloadRouter = require("./routes/download-router");
const authorityRouter = require("./routes/authority-router");
const offshoreRouter = require("./routes/offshore-router");
const app = express();
const publicPath = path.join(__dirname, "public");

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
app.use(express.static(publicPath));

app.use(express.static("public"));
app.use(cors());
app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/download/:fileName", (req, res) => {
  try {
    // Get the requested file name from the URL parameter
    const { fileName } = req.params;

    // Construct the file path based on the requested file name

    const filePath = path.join(__dirname, "../public", fileName);
    console.log(filePath);
    // Check if the file exists
    if (!filePath || !fileName || !fs.existsSync(filePath)) {
      // If the file doesn't exist, send a 404 Not Found response
      res.status(404).send("File not found");
      return;
    }

    // Set the appropriate headers for a file download
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/octet-stream"); // Set the appropriate MIME type

    // Send the file as the response
    res.sendFile(filePath, (err) => {
      if (err) {
        // If an error occurs during sending, log the error and send a 500 Internal Server Error response
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    });
  } catch (err) {
    // Handle any unexpected errors with a 500 Internal Server Error response
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.use(/(\/api)?/, apiRouter);

apiRouter.use("/v1/download", downloadRouter);
apiRouter.use("/v1/institute", instituteRouter);
apiRouter.use("/v1/district", districtRouter);
apiRouter.use("/v1/authority", authorityRouter);
apiRouter.use("/v1/offshore", offshoreRouter);

//Handle 500 error
app.use((err, _req, res, next) => {
  res?.redirect(
    config?.get("server:frontend") + "/error?message=500_internal_error"
  );
});

// Handle 404 error
app.use((_req, res) => {
  res.redirect(
    config?.get("server:frontend") + "/error?message=404_Page_Not_Found"
  );
});

// Prevent unhandled errors from crashing application
process.on("unhandledRejection", (err) => {});
module.exports = app;
