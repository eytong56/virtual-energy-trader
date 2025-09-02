import "dotenv/config";

const baseURL = "https://api.gridstatus.io/v1/datasets";
const API_KEY = process.env.GS_API_KEY;
const hubNode = "TH_NP15_GEN-APND";

async function getCurrentPrice() {
  try {
    const dataset = "caiso_lmp_real_time_5_min";
    const now = new Date();
    const roundedMinutes = Math.floor(now.getMinutes() / 5) * 5;
    const currentInterval = new Date(now);
    currentInterval.setMinutes(roundedMinutes, 0, 0);
    const time = currentInterval.toISOString();
    const response = await fetch(
      `${baseURL}/${dataset}/query/location/${hubNode}?time=${time}&limit=1&timezone=market&api_key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`);
    }
    const data = await response.json();
    if (data.data.length === 0) {
      throw new Error("No price data received from GridStatus");
    }
    const result = {
      timestamp: time,
      price: data.data[0].lmp,
    };
    console.log(`Current price: $${result.price}/MWh at ${result.timestamp}`);
    return result;
  } catch (error) {
    console.log(`Error fetching current price from GridStatus: ${error.message}`);
    throw error;
  }
}

async function getClearingPrice(date, hour) {
  try {
    const dataset = "caiso_lmp_day_ahead_hourly";
    const timeSlot = new Date(date);
    timeSlot.setHours(hour, 0, 0, 0);
    const time = timeSlot.toISOString();
    const response = await fetch(
      `${baseURL}/${dataset}/query/location/${hubNode}?time=${time}&limit=1&timezone=market&api_key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`);
    }
    const data = await response.json();
    if (data.data.length === 0) {
      console.log(`No clearing data received from GridStatus for ${date}, ${hour}:00`);
      return null;
    }
    const clearingPrice = data.data[0].lmp;
    console.log(`Clearing price: $${clearingPrice}/MWh at ${time}`);
    return clearingPrice;
  } catch (error) {
    console.log(`Error fetching clearing price from GridStatus: ${error.message}`);
    throw error;
  }
}

export default {
  getCurrentPrice,
  getClearingPrice
};
