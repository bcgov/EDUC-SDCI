"use strict";

const log = require("./logger");
const config = require("../config");
const { LocalDate, DateTimeFormatter } = require("@js-joda/core");
const axios = require("axios");

async function getOffshoreSchoolList(req, res) {
  try {
    const currentDate = new Date().toISOString().substring(0, 19);

    const params = [
      {
        condition: "AND",
        searchCriteriaList: [
          {
            key: "schoolCategoryCode",
            operation: "eq",
            value: "OFFSHORE",
            valueType: "STRING",
            condition: "AND",
          },
          {
            key: "openedDate",
            operation: "lte",
            value: currentDate,
            valueType: "DATE_TIME",
            condition: "AND",
          },
        ],
      },
      {
        condition: "AND",
        searchCriteriaList: [
          {
            key: "closedDate",
            operation: "eq",
            value: null,
            valueType: "STRING",
            condition: "OR",
          },
          {
            key: "closedDate",
            operation: "gte",
            value: currentDate,
            valueType: "DATE_TIME",
            condition: "OR",
          },
        ],
      },
    ];

    const jsonString = JSON.stringify(params);
    const encodedParams = encodeURIComponent(jsonString);

    const url = `${config.get(
      "server:instituteAPIURL"
    )}/institute/school/paginated?pageSize=1000&pageNumber=0&searchCriteriaList=${encodedParams}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });

    const offshoreSchoolList = response.data.content;
    res.json(offshoreSchoolList);
  } catch (e) {
    log.error(
      "getOffshoreSchoolsList Error",
      e.response ? e.response.status : e.message
    );
    res.status(500).json({ error: "Failed to fetch offshore school list" });
  }
}

module.exports = {
  getOffshoreSchoolList,
};
