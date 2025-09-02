import cron from "node-cron";

// Calculate P&L for a contract given real-time price
function calculatePnL(contract, rtPrice) {
  const { position_type, quantity, clearing_price } = contract;

  let pnlPerMWh;

  if (position_type === "long") {
    // Long = buy, profit when rt_price > clearing_price
    pnlPerMWh = rtPrice - clearing_price;
  } else {
    // Short = sell, profit when rt_price < clearing_price
    pnlPerMWh = clearing_price - rtPrice;
  }

  return pnlPerMWh * quantity;
}

async function settleContracts() {
  
}

function start() {
  cron.schedule("*/59 * * * * *", async () => {
    try {
      await settleContracts();
    } catch (error) {
      console.error("Settlement job failed: ", error);
    }
  });
  console.log("Settlement job scheduled to run every 5 minutes");
}

async function runOnce() {
  try {
    const stats = await settleContracts();
    return { success: true, stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default { start, runOnce };


