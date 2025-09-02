import cron from "node-cron";
import clearingPriceService from "../services/clearingPriceService.js";
import Bid from "../models/Bid.js";
import Contract from "../models/Contract.js";

let isRunning = false;

function isClear(bid, clearingPrice) {
  if (bid.bid_type == "buy") {
    // Buy bid clears if bid price >= clearingPrice
    return bid.price >= clearingPrice;
  } else {
    // Sell bid clears if bid price <= clearingPrice
    return bid.price <= clearingPrice;
  }
}

async function processBids() {
  if (isRunning) {
    console.log("Bid clearing already in progress, skipping...");
    return;
  }
  isRunning = true;

  try {
    console.log("Start bid clearing process");

    // Get pending bids
    const pendingBids = await Bid.getPendingBids();
    console.log(pendingBids);

    let stats = { processed: 0, filled: 0, rejected: 0 };

    if (pendingBids.length === 0) {
      console.log("No pending bids to process");
      return stats;
    }

    console.log(`Processing ${pendingBids.length} pending bids`);

    for (const bid of pendingBids) {
      const { id, market_date, hour_slot } = bid;

      // Get clearing price from database
      const clearingPrice = await clearingPriceService.getClearingPrice(
        market_date,
        hour_slot
      );
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
  // cron.schedule("*/15 * * * *", async () => {
  cron.schedule("*/10 * * * * *", async () => {
    try {
      await processBids();
    } catch (error) {
      console.error("Bid processing job failed: ", error);
    }
  });
  console.log("Bid processing job scheduled to run every 15 minutes");
}

async function runOnce() {
  try {
    const stats = await processBids();
    return { success: true, stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default { start, runOnce };
