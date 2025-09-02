import "dotenv/config";
import gridStatusService from "../services/gridStatusService.js";

const API_KEY = process.env.GS_API_KEY;

async function getCurrentPrice(req, res) {
  try {
    const result = await gridStatusService.getCurrentPrice();
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getDayAheadPrices(req, res) {
  try {
    const result = await gridStatusService.getDayAheadPrices(req.query.date);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  getCurrentPrice,
  getDayAheadPrices
};
