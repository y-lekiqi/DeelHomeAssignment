const express = require("express");
const { depositToClient } = require("../controllers/profile.controller");
const profileRoutes = express.Router();

profileRoutes.post("/deposit/:userId", depositToClient);

module.exports = profileRoutes;