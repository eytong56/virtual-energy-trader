import pool from "../config/database.js";
import gridStatusService from "../services/gridStatusService.js";

function isClear(bid, clearingPrice) {
  const { bid_type, price } = bid;
  if (bid_type == "buy") {
    // Clears if price >= clearingPrice
    return price >= clearingPrice;
  } else {
    // Clears if price <= clearingPrice
    return price <= clearingPrice;
  }
}

async function clearBids() {
  try {
    const result = await pool.query(
      "SELECT * FROM bids WHERE status = 'pending' ORDER BY market_date ASC"
    );
    const pendingBids = result.rows;
    console.log(pendingBids);

    // No pending bids
    if (pendingBids.length === 0) {
      console.log("No pending bids");
      return;
    }

    for (let i = 0; i < pendingBids.length; i++) {
      const pendingBid = pendingBids[i];
      const { market_date, hour_slot } = pendingBid;
      const clearingPrice = await gridStatusService.getClearingPrice(
        market_date,
        hour_slot
      );
      if (clearingPrice === null) {
        console.log(
          `Clearing price not yet released for ${market_date}, ${hour_slot}:00`
        );
        break;
      }
      if (isClear(pendingBid, clearingPrice)) {
        // Set bid to filled
        console.log(
          `TODO: setting bid for ${market_date}, ${hour_slot}:00 to filled`
        );
        // Create contract with clearing price
        console.log(`TODO: creating contract for $${clearingPrice}`);
      } else {
        // Set bid to rejected
        console.log(
          `TODO: setting bid for ${market_date}, ${hour_slot}:00 to rejected`
        );
      }
    }
  } catch (error) {}
}

export default clearBids;
