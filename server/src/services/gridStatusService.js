import "dotenv/config";

const baseURL = "https://api.gridstatus.io/v1/datasets";
const API_KEY = process.env.GS_API_KEY;
const hubNode = "TH_NP15_GEN-APND";

async function testConnection() {
  const response = await fetch("https://api.gridstatus.io/v1");
  return response.ok;
}

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
    console.log(
      `Error fetching current price from GridStatus: ${error.message}`
    );
    throw error;
  }
}

async function getDayAheadPrices(marketDate) {
  try {
    const dataset = "caiso_lmp_day_ahead_hourly";
    // Parse the date components manually to avoid timezone issues
    const [year, month, day] = marketDate.split("-").map(Number);
    const startTime = new Date(year, month - 1, day, 0, 0, 0, 0); // Month is 0-indexed
    const endTime = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
    const response = await fetch(
      `${baseURL}/${dataset}/query/location/${hubNode}?start_time=${startTime.toISOString()}&end_time=${endTime.toISOString()}&timezone=market&api_key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`);
    }
    const data = await response.json();
    if (data.data.length === 0) {
      console.log(
        `No day-ahead data received from GridStatus for ${marketDate}`
      );
      return null;
    }
    const hourData = data.data.map((entry) => {
      return {
        hourSlot: parseInt(
          entry.interval_start_local.split("T")[1].substring(0, 3)
        ),
        clearingPrice: entry.lmp,
      };
    });
    return hourData;
  } catch (error) {
    console.log(
      `Error fetching clearing price from GridStatus: ${error.message}`
    );
    throw error;
  }
}

export default {
  testConnection,
  getCurrentPrice,
  getDayAheadPrices,
};
