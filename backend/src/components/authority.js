"use strict";
const express = require("express");
const router = express.Router();
const cacheService = require("./cache-service");
const { checkToken } = require("../components/auth");

router.get("/list", checkToken, getAuthorityList);

async function getAuthorityList(_req, res) {
  const activeAuthorities = cacheService.getAuthorityList();
  return res.status(200).json(activeAuthorities || []);
}

module.exports = {
  getAuthorityList,
};
