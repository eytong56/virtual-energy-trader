import cron from "node-cron";
import Contract from "../models/Contract.js";

// Calculate P&L for a contract given real-time price
function calculatePnL(contract, rtPrice, timeIntervalMinutes = 5) {
  const { position_type, quantity, clearing_price } = contract;

  let pnlPerMWh;

  if (position_type === "long") {
    // Long position: profit when rt_price > clearing_price
    pnlPerMWh = rtPrice - clearing_price;
  } else {
    // Short position: profit when rt_price < clearing_price
    pnlPerMWh = clearing_price - rtPrice;
  }

  // P&L for this time interval (5 minutes = 1/12 of an hour)
  return pnlPerMWh * quantity * (timeIntervalMinutes / 60);
}

// Round timestamp to nearest 5-minute interval
function roundToFiveMinutes(timestamp) {
  const rounded = new Date(timestamp);
  rounded.setMinutes(Math.floor(rounded.getMinutes() / 5) * 5, 0, 0);
  return rounded;
}

// Get the latest cumulative P&L for a contract
async function getLastCumulativePnL(contractId, client) {
  try {
    const result = await client.query(
      `
        SELECT cumulative_pnl 
        FROM settlements 
        WHERE contract_id = $1 
        ORDER BY settlement_time DESC 
        LIMIT 1
      `,
      [contractId]
    );

    return result.rows.length > 0
      ? parseFloat(result.rows[0].cumulative_pnl)
      : 0;
  } catch (error) {
    console.error(
      `Error getting last cumulative P&L for contract ${contractId}:`,
      error
    );
    return 0;
  }
}

// Check if settlement already exists for this contract and time
async function settlementExists(contractId, settlementTime, client) {
  try {
    const result = await client.query(
      `
        SELECT id FROM settlements 
        WHERE contract_id = $1 AND settlement_time = $2
      `,
      [contractId, settlementTime]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking settlement existence:", error);
    return false;
  }
}

let isRunning = false;
async function settleContracts() {
  if (isRunning) {
    console.log("Settlement job already in progress, skipping...");
    return;
  }
  isRunning = true;

  try {
    console.log("Start settlement job");

    // Get active contracts
    const activeContracts = await Contract.getActiveContracts();
    console.log(activeContracts);

    let stats = { processed: 0, settled: 0 };

    if (activeContracts.length === 0) {
      console.log("No active contracts to settle");
      return stats;
    }

    console.log(`Settling ${activeContracts.length} active contracts`);

    for (const contract of activeContracts) {
      const { id, market_date, hour_slot } = contract;

      // Get real-time price from database
      const rtPrice = await rtPriceService.getRtPrice(market_date, hour_slot);
      if (clearingPrice === null) {
        console.log(
          `Clearing price not available for ${market_date} hour ${hour_slot}`
        );
        continue;
      }

      if (isClear(bid, clearingPrice)) {
        // Fill the bid
        await Bid.updateBidStatus(id, "filled");
        // Create contract with clearing price
        await Contract.createContract(bid, clearingPrice);
        console.log(
          `Bid ${id} filled (clearing: $${clearingPrice}, bid: $${bid.price})`
        );
        stats.filled++;
      } else {
        // Reject the bid
        await Bid.updateBidStatus(id, "rejected");
        console.log(
          `Bid ${id} rejected (clearing: $${clearingPrice}, bid: $${bid.price})`
        );
        stats.rejected++;
      }
      stats.processed++;
    }
    console.log("Bid processing completed:", stats);
    return stats;
  } catch (error) {
    console.error("Error processing pending bids: ", error);
    throw error;
  } finally {
    isRunning = false;
  }
}

function start() {
  // cron.schedule("*/5 * * * * *", async () => {
    cron.schedule("*/5 * * * *", async () => {
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
