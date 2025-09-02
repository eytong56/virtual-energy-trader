import cron from "node-cron";
import Contract from "../models/Contract.js";
import gridStatusService from "../services/gridStatusService.js";
import Settlement from "../models/Settlement.js";

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
      stats.processed++;

      const { id, market_date, hour_slot } = contract;

      // Check if contract already fully settled
      if (await Settlement.checkFullySettled(id)) {
        await Contract.updateContractStatus(id, "settled");
        console.log(`Contract ${contract.id} fully settled`);
        stats.settled++;
        continue;
      }

      // Get real-time price from GridStatus.io
      const rtData = await gridStatusService.getRtPrices(
        market_date,
        hour_slot
      );

      for (const rtPrice of rtData) {
        // Check if already settled for this contract and settlement time
        if (await Settlement.checkSettlementExists(id, rtPrice.time)) {
          console.log(
            `Settlement for contract ${id} for ${rtPrice.time} already exists`
          );
          continue;
        }
        const pnl = calculatePnL(contract, rtPrice.price);
        // Create settlement for this settlement time
        const result = await Settlement.createSettlement(
          contract,
          rtPrice.time,
          rtPrice.price,
          pnl
        );
        console.log(result);
      }
      
      // Check now if contract is fully settled
      if (await Settlement.checkFullySettled(id)) {
        await Contract.updateContractStatus(contract.id, "settled");
        console.log(`Contract ${contract.id} fully settled`);
        stats.settled++;
      }
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    console.log("Settlement processing completed:", stats);
    return stats;
  } catch (error) {
    console.error("Error settling active contracts: ", error);
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
