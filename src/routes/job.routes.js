const express = require("express");
const { getUnpaidJobs, payJobById } = require("../controllers/job.controller");
const { getProfile } = require("../middleware/getProfile");
const jobRoutes = express.Router();

jobRoutes.get("/unpaid", getProfile, getUnpaidJobs);
jobRoutes.post("/:job_id/pay", getProfile, payJobById);

module.exports = jobRoutes;