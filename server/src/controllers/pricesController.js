import "dotenv/config";

const API_KEY = process.env.GS_API_KEY;

async function getCurrentPrice(req, res) {
  try {
    const dataset = "caiso_lmp_real_time_5_min";
    const location = "TH_NP15_GEN-APND";
    const now = new Date();
    const roundedMinutes = Math.floor(now.getMinutes() / 5) * 5
    const currentInterval = new Date(now);
    currentInterval.setMinutes(roundedMinutes, 0, 0);
    const time = currentInterval.toISOString();
    const response = await fetch(
      `https://api.gridstatus.io/v1/datasets/${dataset}/query/location/${location}?time=${time}&limit=1&timezone=market&api_key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    res.send(data.data[0].lmp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default {
  getCurrentPrice,
};
