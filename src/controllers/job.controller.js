const { Op } = require("sequelize");
const { sequelize } = require("../model");

/**
 * @returns all unpaid jobs that belong to the authenticated user
 */
const getUnpaidJobs = async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  try {
    const profile_id = req.profile.id;
    // find jobs where user is either the client or contractor, contract is active, and job is unpaid
    const unpaidJobs = await Job.findAll({
      include: [
        {
          model: Contract,
          where: {
            [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
            status: "in_progress",
          },
        },
      ],
      where: {
        paid: null,
      },
    });
    res.json({ unpaidJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @returns Result of payment request, either success or error message
 */
const payJobById = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const t = await sequelize.transaction(); // start a transaction

  try {
    const profile_id = req.profile.id;
    const jobId = req.params.job_id;

    // find the job to be paid
    const job = await Job.findByPk(jobId, {
      include: [{ model: Contract }],
      transaction: t,
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    // check if the job is already paid
    if (job.paid == 1) {
      return res.status(401).json({ error: "Job is already paid" });
    }
    // check if the job was created by the paying user
    if (job.Contract.ClientId !== profile_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // find the client's profile
    const clientProfile = await Profile.findOne({
      where: { id: profile_id },
      transaction: t,
    });
    if (!clientProfile) {
      return res.status(404).json({ error: "Client profile not found" });
    }

    // check if the client has enough balance
    if (clientProfile.balance < job.price) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // find the contractor's profile
    const contractorProfile = await Profile.findOne({
      where: { id: job.Contract.ContractorId },
      transaction: t,
    });

    if (!contractorProfile) {
      return res.status(404).json({ error: "Contractor profile not found" });
    }

    // update the client's balance
    clientProfile.balance -= job.price;
    await clientProfile.save({ transaction: t });

    // update the contractor's balance
    contractorProfile.balance += job.price;
    await contractorProfile.save({ transaction: t });

    // update the job
    job.paid = true;
    job.paymentDate = new Date();
    await job.save({ transaction: t });

    // commit the transaction
    await t.commit();

    res.json({ message: "Payment successful" });
  } catch (error) {
    // rollback the transaction in case of error
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUnpaidJobs,
  payJobById,
};
