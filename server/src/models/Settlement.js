import "dotenv/config";
import pool from "../config/database.js";

async function getSettlements(date) {
  const result = await pool.query(
    "SELECT * FROM settlements WHERE settlement_time::DATE = $1::DATE ORDER BY settlement_time ASC",
    [date]
  );
  return result.rows;
}

// Create settlement from settled contract (used by settlement jobs)
async function createSettlement(contractData, settlementTime, rtPrice, pnlPerh) {
  try {
    const result = await pool.query(
      "INSERT INTO settlements (contract_id, settlement_time, rt_price, pnl_amount, cumulative_pnl) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [contractData.id, settlementTime, rtPrice, pnlPerh * 5 / 60, 0]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating contract:", error);
    throw error;
  }
}

export default {
  getSettlements,
  createSettlement
};
