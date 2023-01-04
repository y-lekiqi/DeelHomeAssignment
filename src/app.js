const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const app = express();

app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

const profileRoutes = require("./routes/profile.routes");
const jobRoutes = require("./routes/job.routes");
const contractRoutes = require("./routes/contract.routes");
const adminRoutes = require("./routes/admin.routes");

app.use("/balances", profileRoutes);
app.use("/jobs", jobRoutes);
app.use("/contracts", contractRoutes);
app.use("/admin", adminRoutes);

module.exports = app;
