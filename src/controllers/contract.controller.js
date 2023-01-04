const { Op } = require("sequelize");

/**
 * @returns contract by id
 *
 */
const getContractById = async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const profile_id = req.profile.id;
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
};

/**
 * @returns all contracts that belong to the authenticated user
 */
const getNonTerminatedContracts = async (req, res) => {
  const { Contract } = req.app.get("models");
  try {
    const profile_id = req.profile.id;
    // find contracts where user is either the client or contractor and status is not 'terminated'
    const contracts = await Contract.findAll({
      where: {
        [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
        status: { [Op.ne]: "terminated" },
      },
    });
    res.json({ contracts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getContractById,
  getNonTerminatedContracts,
};
