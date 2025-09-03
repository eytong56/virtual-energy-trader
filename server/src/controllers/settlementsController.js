import Settlement from "../models/Settlement.js";

async function getSettlements(req, res) {
  try {
    const settlements = await Settlement.getSettlements();
    res.json(settlements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTotalPnL(req, res) {
  try {
    const pnl = await Settlement.getTotalPnL(req.query.date);
    res.json(pnl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  getSettlements,
  getTotalPnL
};
