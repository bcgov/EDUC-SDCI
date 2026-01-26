const express = require("express");
const router = express.Router();
const config = require("../config/index");
const axios = require("axios");
const { checkToken } = require("../components/auth");
const {
  getOffshoreSchoolList,
  getOffshoreSchoolRepresentatives,
} = require("../components/offshore");
router.get("/offshore-schools-list", checkToken, getOffshoreSchoolList);
router.get("/representatives", checkToken, getOffshoreSchoolRepresentatives);
router.get("/:id", checkToken, getOffshore);

async function getOffshore(req, res) {
  const { id } = req.params;
  const params = [
    {
      condition: null,
      searchCriteriaList: [
        {
          key: "schoolId",
          operation: "eq",
          value: id,
          valueType: "UUID",
          condition: "AND",
        },
      ],
    },
  ];

  const jsonString = JSON.stringify(params);
  const encodedParams = encodeURIComponent(jsonString);

  const url = `${config.get(
    "server:instituteAPIURL"
  )}/institute/school/paginated?pageNumber=0&pageSize=100&searchCriteriaList=${encodedParams}`;

  const schoolResponse = await axios.get(url, {
    headers: { Authorization: `Bearer ${req.accessToken}` },
  });
  res.json(schoolResponse.data);
}
module.exports = router;
