const express = require("express");
const {
  getBestProfession,
  getMostPayingClients,
} = require("../controllers/admin.controller");
const contractRouter = express.Router();

contractRouter.get("/best-profession", getBestProfession);
contractRouter.get("/best-clients", getMostPayingClients);

module.exports = contractRouter;
