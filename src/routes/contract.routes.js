const express = require("express");
const {
  getContractById,
  getNonTerminatedContracts,
} = require("../controllers/contract.controller");
const { getProfile } = require("../middleware/getProfile");

const contractRoutes = express.Router();

contractRoutes.get("/", getProfile, getNonTerminatedContracts);
contractRoutes.get("/:id", getProfile, getContractById);

module.exports = contractRoutes;