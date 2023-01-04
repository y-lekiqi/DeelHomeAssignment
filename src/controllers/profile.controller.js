const { sequelize } = require("../model");

/**
 * @returns Result of deposit request, either success or error message
 */
const depositToClient = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");

  try {
    const profile_id = req.profile.id;
    const amount = req.body.amount;
    const t = await sequelize.transaction(); // start a transaction

    // find the client's profile
    const clientProfile = await Profile.findOne({
      where: { id: profile_id },
      transaction: t,
    });
    if (!clientProfile) {
      return res.status(404).json({ error: "Client profile not found" });
    }

    // calculate the total amount of unpaid jobs for the client
    const unpaidJobsTotal = await Job.sum("amount", {
      include: [
        {
          model: Contract,
          where: { clientId: userId },
        },
      ],
      where: {
        paid: false,
      },
      transaction: t,
    });

    // check if the deposit amount exceeds the limit
    if (amount > unpaidJobsTotal * 0.25) {
      return res
        .status(400)
        .json({ error: "Deposit amount exceeds the limit" });
    }

    // update the client's balance
    clientProfile.balance += amount;
    await clientProfile.save({ transaction: t });

    // commit the transaction
    await t.commit();

    res.json({ message: "Deposit successful" });
  } catch (error) {
    // rollback the transaction in case of error
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  depositToClient,
};
