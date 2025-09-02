import Settlement from "../models/Settlement.js";

async function getSettlements(req, res) {
  try {
    const settlements = await Settlement.getSettlements(req.query.date);
    res.json(settlements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  getSettlements,
};
