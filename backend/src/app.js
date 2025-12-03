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
const authorityRouter = require("./routes/authority-router");
const offshoreRouter = require("./routes/offshore-router");
const schoolRouter = require("./routes/school-router");
const searchRouter = require("./routes/search-router");
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

app.use(/(\/api)?/, apiRouter);

apiRouter.use("/v1/institute", instituteRouter);
apiRouter.use("/v1/district", districtRouter);
apiRouter.use("/v1/authority", authorityRouter);
apiRouter.use("/v1/offshore", offshoreRouter);
apiRouter.use("/v1/school", schoolRouter);
apiRouter.use("/v1/search", searchRouter);

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
