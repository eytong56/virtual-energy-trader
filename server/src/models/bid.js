import "dotenv/config";
import pool from "../config/database.js";

async function getBids(date) {
  if (date !== null) {
    const result = await pool.query(
      "SELECT * FROM bids WHERE market_date = $1 ORDER BY hour_slot ASC",
      [date]
    );
  }
  const result = await pool.query(
    "SELECT * FROM bids ORDER BY market_date ASC, hour_slot ASC"
  );
  return result.rows;
}

async function createBid({
  market_date,
  hour_slot,
  bid_type,
  price,
  quantity,
}) {
  const userId = process.env.SAMPLE_USER;
  if (!userId) {
    throw new Error("SAMPLE_USER environment variable is not set");
  }

  const result = await pool.query(
    "INSERT INTO bids (user_id, market_date, hour_slot, bid_type, price, quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [userId, market_date, hour_slot, bid_type, price, quantity]
  );
  return result.rows[0];
}

async function getPendingBids() {
  try {
    const result = await pool.query(
      "SELECT * FROM bids WHERE status = 'pending' ORDER BY market_date ASC, hour_slot ASC"
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching pending bids:", error);
    throw error;
  }
}

async function updateBidStatus(bidId, status) {
  try {
    const result = await pool.query(
      "UPDATE bids SET status = $1 WHERE id = $2 RETURNING *",
      [status, bidId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Bid with id ${bidId} not found`);
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error updating bid status:", error);
    throw error;
  }
}

export default { getBids, createBid, getPendingBids, updateBidStatus };
