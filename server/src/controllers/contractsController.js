import Contract from "../models/Contract.js";

async function getContracts(req, res) {
  try {
    const contracts = await Contract.getContracts();
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  getContracts,
};
