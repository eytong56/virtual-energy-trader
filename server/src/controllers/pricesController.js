import "dotenv/config";
import gridStatusService from "../services/gridStatusService.js";
import clearBids from "../jobs/damClearingJob.js";

const API_KEY = process.env.GS_API_KEY;

async function getCurrentPrice(req, res) {
  try {
    // const result = await gridStatusService.getCurrentPrice();
    // const result = await gridStatusService.getClearingPrice(new Date(), 21);
    const result = clearBids();
    res.send("result");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  getCurrentPrice,
};
