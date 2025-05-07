
const express = require("express");
const router = express.Router();
const log = require("../components/logger");
const config = require("../config/index");
const NodeCache = require("node-cache");
const axios = require("axios");
const { checkToken } = require("../components/auth");


const listCache = new NodeCache({ stdTTL: 21600 });
const schoolListFields = ['mincode', 'displayName']; 
//Batch Routes
router.get('/:id', checkToken, getOffshore);


async function getOffshore(req, res) {
  const { id } = req.params;
  const params = [
    {
      condition: null,
      searchCriteriaList: [
        {
          key: 'schoolId',
          operation: 'eq',
          value: id,
          valueType: 'UUID',
          condition: 'AND'
        }
      ]
    }
  ];

  const jsonString = JSON.stringify(params)
  const encodedParams = encodeURIComponent(jsonString)
  
  const url = `${config.get('server:instituteAPIURL')}/api/v1/institute/school/paginated?pageNumber=0&pageSize=100&searchCriteriaList=${encodedParams}`;

  // try {
    const schoolResponse = await axios.get(url, { headers: { Authorization: `Bearer ${req.accessToken}` } });
    res.json(schoolResponse.data)
     
  //   log.info(req.url);

  // } catch (e) {
  //   log.error('getData Error', e.response ? e.response.status : e.message);
  // }
}
module.exports = router;