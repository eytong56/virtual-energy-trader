import "dotenv/config";
import pool from "./pool.js";

async function getBids(market_date) {
  const result = await pool.query(
    "SELECT * FROM bids WHERE market_date = $1 ORDER BY hour_slot ASC",
    [market_date]
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
    throw new Error('SAMPLE_USER environment variable is not set');
  }

  const result = await pool.query(
    "INSERT INTO bids (user_id, market_date, hour_slot, bid_type, price, quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [userId, market_date, hour_slot, bid_type, price, quantity]
  );
  return result.rows[0];
}

export default { getBids, createBid };
