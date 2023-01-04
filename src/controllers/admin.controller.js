const { Op } = require("sequelize");
const { sequelize } = require("../model");

/**
 * @returns Result most paid profession inside a period of time
 */
const getBestProfession = async (req, res) => {
  //TODO: Authenticate request, check if made by admin
  const { Job, Contract, Profile } = req.app.get("models");

  try {
    const start = req.query.start;
    const end = req.query.end;
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    // get the profession with the highest earnings in the given time range
    const profession = await Job.findOne({
      attributes: [[sequelize.fn("SUM", sequelize.col("price")), "totalPrice"]],
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              as: "Contractor",
              attributes: ["profession"],
            },
          ],
        },
      ],
      where: {
        paymentDate: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
      group: ["Contract.Contractor.profession"],
      raw: true,
      order: [[sequelize.fn("SUM", sequelize.col("price")), "desc"]],
    });

    if (!profession) {
      return res.status(404).json({ error: "Profession not found" });
    }

    res.json({
      profession: {
        name: profession["Contract.Contractor.profession"],
        total: profession.totalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @returns Result clients that paid the most for jobs in the query time period
 */
const getMostPayingClients = async (req, res) => {
  // TO DO: Authenticate request, check if made by admin
  const { start, end, limit = 2 } = req.query;
  const { Job, Contract, Profile } = req.app.get("models");

  try {
    // Validate start and end dates
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    // Validate limit parameter
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: "Invalid limit parameter" });
    }

    const topClients = await Job.findAll({
      attributes: [[sequelize.fn("SUM", sequelize.col("price")), "totalPaid"]],
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              as: "Client",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
      where: {
        paymentDate: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
      group: ["Contract.Client.id"],
      raw: true,
      limit,
      order: [[sequelize.fn("SUM", sequelize.col("price")), "desc"]],
    });

    if (!topClients || topClients.length == 0) {
      return res.status(404).json({ error: "Top clients not found" });
    }
    const topClientsMapped = topClients.map((client) => {
      return {
        id: client["Contract.Client.id"],
        fullName:
          client["Contract.Client.firstName"] +
          " " +
          client["Contract.Client.lastName"],
        paid: client.totalPaid,
      };
    });
    res.json({ topClients: topClientsMapped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBestProfession,
  getMostPayingClients,
};
